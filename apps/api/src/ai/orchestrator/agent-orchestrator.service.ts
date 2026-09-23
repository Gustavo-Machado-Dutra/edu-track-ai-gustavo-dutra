import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ErrorObject } from 'ajv';
import { Prisma, TaskStatus } from '@prisma/client';
import { AgentService, AgentResponseType, ProcessedAIResponse } from '../agent.service';
import { StructuredOutputValidationService } from '../structured-output-validation.service';
import { AnalyticsService } from '../../analytics/analytics.service';
import { PrismaService } from '../../prisma/prisma.service';
import { TasksService } from '../../tasks/tasks.service';
import type { CreateTaskDto } from '../../tasks/dto/create-task.dto';
import type { UpdateTaskDto } from '../../tasks/dto/update-task.dto';
import { AgentToolCallValidator } from '../tools/agent-tool-call-validator';
import { AgentToolRegistry } from '../tools/agent-tool-registry';
import {
  LLM_PROVIDER_ADAPTER,
  LlmMessage,
  LlmProviderAdapter,
  LlmResult,
  LlmTool,
} from '../provider/llm-provider-adapter';

interface ToolResult {
  id: string;
  name: string;
  result?: unknown;
  error?: string;
  errors?: ErrorObject[];
}

@Injectable()
export class AgentOrchestratorService {
  private readonly MAX_ITERATIONS = 3;

  constructor(
    private readonly agentService: AgentService,
    private readonly toolRegistry: AgentToolRegistry,
    private readonly toolValidator: AgentToolCallValidator,
    private readonly validationService: StructuredOutputValidationService,
    private readonly prisma: PrismaService,
    private readonly tasksService: TasksService,
    private readonly analyticsService: AnalyticsService,
    @Inject(LLM_PROVIDER_ADAPTER) private readonly providerAdapter: LlmProviderAdapter,
  ) {}

  async execute(
    userId: string,
    message: string,
    conversationId?: string,
  ): Promise<{ conversationId: string; response: ProcessedAIResponse }> {
    let currentConversationId = conversationId;
    const conversation = conversationId
      ? await this.prisma.aIConversation.findFirst({
          where: { id: conversationId, userId },
          include: { messages: { orderBy: { createdAt: 'asc' } } },
        })
      : null;

    if (conversationId && !conversation) {
      throw new InternalServerErrorException('Conversation not found');
    }

    if (!conversation) {
      const createdConversation = await this.prisma.aIConversation.create({
        data: { userId },
      });
      currentConversationId = createdConversation.id;
    }

    const messages = this.restoreMessages(conversation?.messages ?? []);
    messages.push({ role: 'user', content: message });

    await this.prisma.aIMessage.create({
      data: {
        conversationId: currentConversationId!,
        role: 'USER',
        content: message,
      },
    });

    let iteration = 0;
    let expectedResponseType: AgentResponseType | undefined;
    let finalResponse: LlmResult | null = null;

    while (iteration < this.MAX_ITERATIONS) {
      iteration += 1;

      const llmResponse = await this.providerAdapter.complete({
        model: 'qwen/qwen3-coder:free',
        messages,
        tools: this.getProviderTools(),
        responseFormat: expectedResponseType
          ? this.getResponseFormat(expectedResponseType)
          : undefined,
      });

      if (!llmResponse.toolCalls || llmResponse.toolCalls.length === 0) {
        finalResponse = llmResponse;
        break;
      }

      messages.push({
        role: 'assistant',
        content: llmResponse.content,
        tool_calls: llmResponse.toolCalls,
      });
      await this.prisma.aIMessage.create({
        data: {
          conversationId: currentConversationId!,
          role: 'ASSISTANT',
          content: JSON.stringify({
            content: llmResponse.content,
            toolCalls: llmResponse.toolCalls,
          }),
        },
      });

      for (const call of llmResponse.toolCalls) {
        const definition = this.toolRegistry.get(call.name);
        if (definition?.risk === 'write') {
          expectedResponseType = 'action';
        } else if (definition && expectedResponseType !== 'action') {
          expectedResponseType = 'analysis';
        }

        const validation = this.toolValidator.validate(call.name, call.arguments);
        const execution = await this.prisma.aIToolExecution.create({
          data: {
            userId,
            intent: message,
            conversationId: currentConversationId!,
            toolName: call.name,
            inputJson: this.toJsonValue(call.arguments),
            outputJson: {},
            status: 'PENDING',
            model: llmResponse.model,
          },
        });
        let result: ToolResult;

        if (!validation.valid) {
          result = {
            id: call.id,
            name: call.name,
            error: 'Tool call validation failed',
            errors: validation.errors,
          };
        } else {
          try {
            result = {
              id: call.id,
              name: call.name,
              result: await this.executeTool(
                call.name,
                userId,
                call.arguments,
                execution.id,
              ),
            };
          } catch (error) {
            result = {
              id: call.id,
              name: call.name,
              error: error instanceof Error ? error.message : 'Tool execution failed',
            };
          }
        }

        await this.prisma.aIToolExecution.update({
          where: { id: execution.id },
          data: {
            outputJson: this.toJsonValue(
              result.error
                ? { error: result.error, errors: result.errors }
                : result.result,
            ),
            status: result.error ? 'FAILED' : 'SUCCESS',
            completedAt: new Date(),
          },
        });

        const toolMessage = {
          ...result,
          tool_call_id: call.id,
          executionId: execution.id,
        };
        const toolContent = JSON.stringify(toolMessage);

        await this.prisma.aIMessage.create({
          data: {
            conversationId: currentConversationId!,
            role: 'TOOL',
            content: toolContent,
          },
        });
        messages.push({
          role: 'tool',
          content: toolContent,
          tool_call_id: call.id,
        });
      }
    }

    if (!finalResponse) {
      throw new InternalServerErrorException(
        'Maximum iterations reached without final response',
      );
    }

    let processed: ProcessedAIResponse;
    try {
      processed = await this.agentService.processProviderResponse(
        finalResponse.content || '',
        expectedResponseType,
      );
    } catch (error) {
      await this.prisma.aIToolExecution.create({
        data: {
          userId,
          intent: message,
          conversationId: currentConversationId!,
          toolName: 'agent_response_validation',
          inputJson: this.toJsonValue({ response: finalResponse.content }),
          outputJson: this.toJsonValue({
            error: error instanceof Error ? error.message : 'Agent response validation failed',
          }),
          status: 'FAILED',
          model: finalResponse.model,
          completedAt: new Date(),
        },
      });
      throw error;
    }

    await this.prisma.aIMessage.create({
      data: {
        conversationId: currentConversationId!,
        role: 'ASSISTANT',
        content: JSON.stringify(processed),
      },
    });

    return {
      conversationId: currentConversationId!,
      response: processed,
    };
  }


  private getResponseFormat(expectedType: AgentResponseType) {
    const schemaName = expectedType === 'action'
      ? 'v1_agent-action-response'
      : 'v1_agent-analysis-response';
    const schema = this.validationService.getSchema(schemaName);
    if (!schema) {
      throw new InternalServerErrorException(
        'AI Configuration Error: ' + schemaName + ' not found',
      );
    }
    return {
      name: schemaName,
      strict: true,
      schema,
    };
  }

  private restoreMessages(
    storedMessages: Array<{ role: string; content: string }>,
  ): LlmMessage[] {
    return storedMessages.map((storedMessage) => {
      if (storedMessage.role === 'TOOL') {
        let toolCallId: string | undefined;
        try {
          const parsed = JSON.parse(storedMessage.content) as { tool_call_id?: unknown };
          if (typeof parsed.tool_call_id === 'string') {
            toolCallId = parsed.tool_call_id;
          }
        } catch {
          toolCallId = undefined;
        }
        return {
          role: 'tool',
          content: storedMessage.content,
          ...(toolCallId ? { tool_call_id: toolCallId } : {}),
        };
      }

      return {
        role: storedMessage.role.toLowerCase() as LlmMessage['role'],
        content: storedMessage.content,
      };
    });
  }

  private getProviderTools(): LlmTool[] {
    return this.toolRegistry.list().map((definition) => ({
      type: 'function',
      function: {
        name: definition.name,
        description: definition.description,
        parameters: definition.inputSchema,
      },
    }));
  }

  private async executeTool(
    name: string,
    userId: string,
    toolArguments: Record<string, unknown>,
    executionId: string,
  ): Promise<unknown> {
    switch (name) {
      case 'create_task':
        return this.tasksService.create(
          userId,
          toolArguments as unknown as CreateTaskDto,
          executionId,
        );
      case 'update_task': {
        const { taskId, ...updateArguments } = toolArguments;
        if (typeof taskId !== 'string') {
          throw new InternalServerErrorException('Task id is required');
        }
        return this.tasksService.update(
          taskId,
          userId,
          updateArguments as unknown as UpdateTaskDto,
        );
      }
      case 'complete_task':
        if (typeof toolArguments.taskId !== 'string') {
          throw new InternalServerErrorException('Task id is required');
        }
        return this.tasksService.complete(toolArguments.taskId, userId);
      case 'get_task':
        if (typeof toolArguments.taskId !== 'string') {
          throw new InternalServerErrorException('Task id is required');
        }
        return this.tasksService.findByIdForUser(toolArguments.taskId, userId);
      case 'list_tasks':
        return this.tasksService.findAllByUser(
          userId,
          toolArguments.status as TaskStatus | undefined,
        );
      case 'get_academic_performance':
        return this.analyticsService.getTaskMetrics(userId);
      case 'get_study_trends':
        return this.analyticsService.getStudyMetrics(userId);
      case 'get_general_dashboard':
        return this.analyticsService.getDashboardData(userId);
      default:
        throw new InternalServerErrorException(
          'Tool "' + name + '" has no backend executor',
        );
    }
  }

  private toJsonValue(value: unknown): Prisma.InputJsonValue {
    return JSON.parse(JSON.stringify(value ?? {})) as Prisma.InputJsonValue;
  }
}
