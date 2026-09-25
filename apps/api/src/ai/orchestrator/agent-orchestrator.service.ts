import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
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
  StructuredOutputSpec,
} from '../provider/llm-provider-adapter';
import { loadLlmProviderConfig } from '../provider/llm-provider-config';
import { LlmProviderError } from '../provider/llm-provider-error';

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
  private readonly logger = new Logger(AgentOrchestratorService.name);

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
    const requestId = `agent-req-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const startTime = Date.now();
    const providerConfig = loadLlmProviderConfig((key) => process.env[key]);
    const provider = providerConfig.provider;
    const model = providerConfig.model;

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

      let llmResponse: LlmResult;
      try {
        llmResponse = await this.providerAdapter.complete({
          model,
          messages,
          tools: expectedResponseType ? undefined : this.getProviderTools(),
          responseFormat: expectedResponseType
            ? this.getResponseFormat(expectedResponseType)
            : undefined,
        });
      } catch (error) {
        this.handleProviderError(error, requestId, provider, model, startTime);
      }

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
            error: 'Schema validation failed',
            errors: validation.errors ?? [],
          };
          await this.prisma.aIToolExecution.update({
            where: { id: execution.id },
            data: {
              status: 'FAILED',
              outputJson: this.toJsonValue({
                error: result.error,
                errors: result.errors,
              }),
              completedAt: new Date(),
            },
          });
        } else if (!definition) {
          result = {
            id: call.id,
            name: call.name,
            error: `Unauthorized or unregistered tool: ${call.name}`,
          };
          await this.prisma.aIToolExecution.update({
            where: { id: execution.id },
            data: {
              status: 'FAILED',
              outputJson: this.toJsonValue({ error: result.error }),
              completedAt: new Date(),
            },
          });
        } else {
          try {
            const output = await this.executeTool(
              call.name,
              call.arguments,
              userId,
              execution.id,
            );
            result = {
              id: call.id,
              name: call.name,
              result: output,
            };
            await this.prisma.aIToolExecution.update({
              where: { id: execution.id },
              data: {
                status: 'SUCCESS',
                outputJson: this.toJsonValue(output),
                completedAt: new Date(),
              },
            });
          } catch (error) {
            result = {
              id: call.id,
              name: call.name,
              error: error instanceof Error ? error.message : 'Tool execution failed',
            };
            await this.prisma.aIToolExecution.update({
              where: { id: execution.id },
              data: {
                status: 'FAILED',
                outputJson: this.toJsonValue({ error: result.error }),
                completedAt: new Date(),
              },
            });
          }
        }

        messages.push({
          role: 'tool',
          name: result.name,
          tool_call_id: result.id,
          content: JSON.stringify(result.error ? { error: result.error } : result.result),
        });
        await this.prisma.aIMessage.create({
          data: {
            conversationId: currentConversationId!,
            role: 'TOOL',
            content: JSON.stringify(result),
          },
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

    const totalLatency = Date.now() - startTime;
    this.logger.log(
      `[AgentOrchestrator] requestId=${requestId} provider=${provider} model=${model} operation=chat status=200 latency=${totalLatency}ms iterations=${iteration}`,
    );

    return {
      conversationId: currentConversationId!,
      response: processed,
    };
  }

  private handleProviderError(
    error: unknown,
    requestId: string,
    provider: string,
    model: string,
    startTime: number,
  ): never {
    const latency = Date.now() - startTime;
    const isLlmError = error instanceof LlmProviderError;
    const rawStatus = isLlmError ? error.status : undefined;
    const rawMessage = (error instanceof Error ? error.message : String(error)).toLowerCase();

    let httpStatus: HttpStatus;
    let errorCode: string;
    let userMessage: string;
    let errorCategory: string;

    if (
      rawStatus === 429 ||
      rawMessage.includes('quota') ||
      rawMessage.includes('rate limit') ||
      rawMessage.includes('resource_exhausted') ||
      (isLlmError && error.code === 'quota-exceeded')
    ) {
      httpStatus = HttpStatus.TOO_MANY_REQUESTS;
      errorCode = 'PROVIDER_QUOTA';
      userMessage = 'O limite de uso do provedor de IA foi temporariamente atingido.';
      errorCategory = 'EXTERNAL_PROVIDER_QUOTA';
    } else if (
      rawStatus === 503 ||
      rawStatus === 502 ||
      (isLlmError && error.code === 'empty-response')
    ) {
      httpStatus = HttpStatus.SERVICE_UNAVAILABLE;
      errorCode = 'PROVIDER_UNAVAILABLE';
      userMessage = 'O provedor de inteligência artificial está temporariamente indisponível.';
      errorCategory = 'EXTERNAL_PROVIDER_UNAVAILABLE';
    } else if (
      rawStatus === 401 ||
      rawStatus === 403 ||
      (isLlmError && error.code === 'missing-api-key')
    ) {
      httpStatus = HttpStatus.BAD_GATEWAY;
      errorCode = 'PROVIDER_AUTH_ERROR';
      userMessage = 'Erro de autenticação com o provedor de IA.';
      errorCategory = 'EXTERNAL_PROVIDER_AUTH_ERROR';
    } else if (rawStatus === 400) {
      httpStatus = HttpStatus.BAD_REQUEST;
      errorCode = 'PROVIDER_BAD_REQUEST';
      userMessage = 'Requisição inválida enviada ao provedor de IA.';
      errorCategory = 'EXTERNAL_PROVIDER_BAD_REQUEST';
    } else if (
      rawMessage.includes('timeout') ||
      rawMessage.includes('timed out') ||
      rawMessage.includes('aborted')
    ) {
      httpStatus = HttpStatus.GATEWAY_TIMEOUT;
      errorCode = 'PROVIDER_TIMEOUT';
      userMessage = 'Tempo limite esgotado ao consultar o provedor de IA.';
      errorCategory = 'EXTERNAL_PROVIDER_TIMEOUT';
    } else {
      httpStatus = HttpStatus.BAD_GATEWAY;
      errorCode = 'PROVIDER_ERROR';
      userMessage = 'Erro na comunicação com o provedor de IA.';
      errorCategory = 'EXTERNAL_PROVIDER_ERROR';
    }

    this.logger.error(
      `[AgentOrchestrator] requestId=${requestId} provider=${provider} model=${model} operation=chat status=${httpStatus} errorCategory=${errorCategory} latency=${latency}ms - ${error instanceof Error ? error.message : 'Unknown error'}`,
    );

    throw new HttpException(
      {
        statusCode: httpStatus,
        code: errorCode,
        message: userMessage,
        error: httpStatus === 429 ? 'Too Many Requests' : 'AI Provider Error',
      },
      httpStatus,
    );
  }

  private restoreMessages(
    history: Array<{ role: string; content: string }>,
  ): LlmMessage[] {
    return history.map((message) => {
      if (message.role === 'USER') {
        return { role: 'user', content: message.content };
      }
      if (message.role === 'ASSISTANT') {
        try {
          const parsed = JSON.parse(message.content) as {
            content?: string;
            toolCalls?: LlmResult['toolCalls'];
          };
          return {
            role: 'assistant',
            content: parsed.content ?? null,
            tool_calls: parsed.toolCalls,
          };
        } catch {
          return { role: 'assistant', content: message.content };
        }
      }
      if (message.role === 'TOOL') {
        try {
          const parsed = JSON.parse(message.content) as ToolResult;
          return {
            role: 'tool',
            name: parsed.name,
            tool_call_id: parsed.id,
            content: JSON.stringify(
              parsed.error ? { error: parsed.error } : parsed.result,
            ),
          };
        } catch {
          return { role: 'tool', content: message.content };
        }
      }
      return { role: 'user', content: message.content };
    });
  }

  private getProviderTools(): LlmTool[] {
    return this.toolRegistry.list().map((tool) => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.inputSchema,
      },
    }));
  }

  private getResponseFormat(
    expectedResponseType: AgentResponseType,
  ): StructuredOutputSpec {
    const primarySchemaName =
      expectedResponseType === 'action'
        ? 'v1_agent-action-response'
        : 'v1_agent-analysis-response';
    const fallbackSchemaName =
      expectedResponseType === 'action'
        ? 'agent-action.response'
        : 'agent-analysis.response';

    const schema =
      this.validationService.getSchema(primarySchemaName) ??
      this.validationService.getSchema(fallbackSchemaName);

    if (!schema) {
      throw new InternalServerErrorException(
        'AI Configuration Error: ' + primarySchemaName + ' not found',
      );
    }
    return {
      name: primarySchemaName,
      strict: true,
      schema,
    };
  }

  private async executeTool(
    name: string,
    toolArguments: Record<string, unknown>,
    userId: string,
    executionId?: string,
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
