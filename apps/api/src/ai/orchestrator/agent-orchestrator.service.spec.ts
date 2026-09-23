import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InternalServerErrorException } from '@nestjs/common';
import { AgentService } from '../agent.service';
import { AnalyticsService } from '../../analytics/analytics.service';
import { PrismaService } from '../../prisma/prisma.service';
import { TasksService } from '../../tasks/tasks.service';
import { LlmProviderAdapter } from '../provider/llm-provider-adapter';
import { AgentOrchestratorService } from './agent-orchestrator.service';
import { AgentToolCallValidator } from '../tools/agent-tool-call-validator';
import { AgentToolRegistry } from '../tools/agent-tool-registry';
import { StructuredOutputValidationService } from '../structured-output-validation.service';

type MockPrisma = {
  aIConversation: {
    findFirst: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };
  aIMessage: {
    create: ReturnType<typeof vi.fn>;
  };
  aIToolExecution: {
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
};

type MockAnalytics = {
  getTaskMetrics: ReturnType<typeof vi.fn>;
  getStudyMetrics: ReturnType<typeof vi.fn>;
  getDashboardData: ReturnType<typeof vi.fn>;
};

type MockTasks = {
  create: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  complete: ReturnType<typeof vi.fn>;
  findByIdForUser: ReturnType<typeof vi.fn>;
  findAllByUser: ReturnType<typeof vi.fn>;
};

describe('AgentOrchestratorService', () => {
  let service: AgentOrchestratorService;
  let agentService: { processProviderResponse: ReturnType<typeof vi.fn> };
  let providerComplete: ReturnType<typeof vi.fn>;
  let prisma: MockPrisma;
  let tasksService: MockTasks;
  let analyticsService: MockAnalytics;

  const conversation = {
    id: 'conversation-123',
    userId: 'user-123',
    messages: [],
  };

  beforeEach(() => {
    agentService = { processProviderResponse: vi.fn() };
    providerComplete = vi.fn();
    prisma = {
      aIConversation: {
        findFirst: vi.fn(),
        create: vi.fn().mockResolvedValue({ id: 'conversation-created' }),
      },
      aIMessage: {
        create: vi.fn().mockResolvedValue({ id: 'message-1' }),
      },
      aIToolExecution: {
        create: vi.fn().mockResolvedValue({ id: 'execution-1' }),
        update: vi.fn().mockResolvedValue({ id: 'execution-1' }),
      },
    };
    tasksService = {
      create: vi.fn(),
      update: vi.fn(),
      complete: vi.fn(),
      findByIdForUser: vi.fn(),
      findAllByUser: vi.fn(),
    };
    analyticsService = {
      getTaskMetrics: vi.fn(),
      getStudyMetrics: vi.fn(),
      getDashboardData: vi.fn(),
    };

    const validationService = new StructuredOutputValidationService();
    validationService.onModuleInit();

    service = new AgentOrchestratorService(
      agentService as unknown as AgentService,
      new AgentToolRegistry(),
      new AgentToolCallValidator(new AgentToolRegistry()),
      validationService,
      prisma as unknown as PrismaService,
      tasksService as unknown as TasksService,
      analyticsService as unknown as AnalyticsService,
      { complete: providerComplete } as unknown as LlmProviderAdapter,
    );
  });

  function prepareFinalResponse(): void {
    agentService.processProviderResponse.mockResolvedValue({
      type: 'text',
      content: 'Final response',
      raw: {},
    });
  }

  function prepareExistingConversation(): void {
    prisma.aIConversation.findFirst.mockResolvedValue(conversation);
  }

  it('returns a final response without a tool call', async () => {
    prepareExistingConversation();
    prepareFinalResponse();
    providerComplete.mockResolvedValue({
      content: 'Final response',
      model: 'test-model',
      raw: {},
    });

    const result = await service.execute('user-123', 'Hello', 'conversation-123');

    expect(result.conversationId).toBe('conversation-123');
    expect(result.response.content).toBe('Final response');
    expect(prisma.aIMessage.create).toHaveBeenCalledTimes(2);
  });

  it('routes a valid create_task call with the authenticated user id', async () => {
    prepareExistingConversation();
    prepareFinalResponse();
    tasksService.create.mockResolvedValue({ id: 'task-1', title: 'Study' });
    providerComplete
      .mockResolvedValueOnce({
        content: null,
        model: 'test-model',
        raw: {},
        toolCalls: [{
          id: 'call-1',
          name: 'create_task',
          arguments: {
            subjectId: '123e4567-e89b-12d3-a456-426614174000',
            title: 'Study',
          },
        }],
      })
      .mockResolvedValueOnce({ content: 'Final response', model: 'test-model', raw: {} });

    await service.execute('user-123', 'Create a study task', 'conversation-123');

    expect(tasksService.create).toHaveBeenCalledWith(
      'user-123',
      {
        subjectId: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Study',
      },
      'execution-1',
    );
  });

  it('executes get_academic_performance with the authenticated user id', async () => {
    prepareExistingConversation();
    prepareFinalResponse();
    const metrics = { total: 4, overdue: 1, completionRate: 75 };
    analyticsService.getTaskMetrics.mockResolvedValue(metrics);
    providerComplete
      .mockResolvedValueOnce({
        content: null,
        model: 'test-model',
        raw: {},
        toolCalls: [
          { id: 'call-1', name: 'get_academic_performance', arguments: {} },
        ],
      })
      .mockResolvedValueOnce({ content: 'Final response', model: 'test-model', raw: {} });

    const result = await service.execute('user-123', 'How am I doing?', 'conversation-123');

    expect(result.response.content).toBe('Final response');
    expect(analyticsService.getTaskMetrics).toHaveBeenCalledWith('user-123');
    expect(prisma.aIToolExecution.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 'user-123',
          toolName: 'get_academic_performance',
          status: 'PENDING',
        }),
      }),
    );
    expect(prisma.aIToolExecution.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'execution-1' },
        data: expect.objectContaining({ status: 'SUCCESS' }),
      }),
    );

    const secondRequest = providerComplete.mock.calls[1]?.[0] as {
      messages: Array<{ role: string; content: string | null }>;
      responseFormat?: { name: string; strict: boolean };
    };
    expect(secondRequest.responseFormat).toEqual(expect.objectContaining({
      name: 'v1_agent-analysis-response',
      strict: true,
    }));
    expect(secondRequest.messages.at(-1)?.role).toBe('tool');
    expect(secondRequest.messages.at(-1)?.content).toContain(JSON.stringify(metrics));
  });

  it('routes the study trends tool to getStudyMetrics', async () => {
    prepareExistingConversation();
    prepareFinalResponse();
    analyticsService.getStudyMetrics.mockResolvedValue({ totalMinutes: 90 });
    providerComplete
      .mockResolvedValueOnce({
        content: null,
        model: 'test-model',
        raw: {},
        toolCalls: [{ id: 'call-1', name: 'get_study_trends', arguments: {} }],
      })
      .mockResolvedValueOnce({ content: 'Final response', model: 'test-model', raw: {} });

    await service.execute('user-123', 'Show study trends', 'conversation-123');

    expect(analyticsService.getStudyMetrics).toHaveBeenCalledWith('user-123');
  });

  it('routes the dashboard tool to getDashboardData', async () => {
    prepareExistingConversation();
    prepareFinalResponse();
    analyticsService.getDashboardData.mockResolvedValue({ subjectsCount: 3 });
    providerComplete
      .mockResolvedValueOnce({
        content: null,
        model: 'test-model',
        raw: {},
        toolCalls: [{ id: 'call-1', name: 'get_general_dashboard', arguments: {} }],
      })
      .mockResolvedValueOnce({ content: 'Final response', model: 'test-model', raw: {} });

    await service.execute('user-123', 'Show my dashboard', 'conversation-123');

    expect(analyticsService.getDashboardData).toHaveBeenCalledWith('user-123');
  });

  it('rejects analytics arguments that try to provide another user id', async () => {
    prepareExistingConversation();
    prepareFinalResponse();
    providerComplete
      .mockResolvedValueOnce({
        content: null,
        model: 'test-model',
        raw: {},
        toolCalls: [
          {
            id: 'call-1',
            name: 'get_academic_performance',
            arguments: { userId: 'another-user' },
          },
        ],
      })
      .mockResolvedValueOnce({ content: 'Final response', model: 'test-model', raw: {} });

    await service.execute('user-123', 'Show my performance', 'conversation-123');

    expect(analyticsService.getTaskMetrics).not.toHaveBeenCalled();
    expect(prisma.aIToolExecution.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'FAILED' }),
      }),
    );
    const secondRequest = providerComplete.mock.calls[1]?.[0] as {
      messages: Array<{ role: string; content: string | null }>;
    };
    expect(secondRequest.messages.at(-1)?.content).toContain('Tool call validation failed');
  });

  it('rejects unknown tools before execution and audits the rejection', async () => {
    prepareExistingConversation();
    prepareFinalResponse();
    providerComplete
      .mockResolvedValueOnce({
        content: null,
        model: 'test-model',
        raw: {},
        toolCalls: [{ id: 'call-1', name: 'delete_user', arguments: {} }],
      })
      .mockResolvedValueOnce({ content: 'Final response', model: 'test-model', raw: {} });

    await service.execute('user-123', 'Delete my account', 'conversation-123');

    expect(prisma.aIToolExecution.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ toolName: 'delete_user', status: 'PENDING' }),
      }),
    );
    expect(prisma.aIToolExecution.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'FAILED' }) }),
    );
  });

  it('passes registered tools to the provider in the provider contract shape', async () => {
    prepareExistingConversation();
    prepareFinalResponse();
    providerComplete.mockResolvedValue({
      content: 'Final response',
      model: 'test-model',
      raw: {},
    });

    await service.execute('user-123', 'Hello', 'conversation-123');

    const request = providerComplete.mock.calls[0]?.[0] as {
      tools: Array<{ type: string; function: { name: string; parameters: Record<string, unknown> } }>;
    };
    expect(request.tools[0]?.type).toBe('function');
    expect(request.tools.map((tool) => tool.function.name)).toContain('get_study_trends');
    expect(request.tools.find((tool) => tool.function.name === 'get_study_trends')?.function.parameters)
      .toEqual(expect.objectContaining({ additionalProperties: false }));
  });

  it('does not use an invalid OPEN task status when listing tasks', async () => {
    prepareExistingConversation();
    prepareFinalResponse();
    tasksService.findAllByUser.mockResolvedValue([]);
    providerComplete
      .mockResolvedValueOnce({
        content: null,
        model: 'test-model',
        raw: {},
        toolCalls: [{ id: 'call-1', name: 'list_tasks', arguments: {} }],
      })
      .mockResolvedValueOnce({ content: 'Final response', model: 'test-model', raw: {} });

    await service.execute('user-123', 'List tasks', 'conversation-123');

    expect(tasksService.findAllByUser).toHaveBeenCalledWith('user-123', undefined);
  });

  it('audits a final structured-output validation failure', async () => {
    prepareExistingConversation();
    agentService.processProviderResponse.mockRejectedValue(new Error('contract failed'));
    providerComplete.mockResolvedValue({
      content: '{"type":"analysis"}',
      model: 'test-model',
      raw: {},
    });

    await expect(
      service.execute('user-123', 'Analyze my data', 'conversation-123'),
    ).rejects.toThrow('contract failed');

    expect(prisma.aIToolExecution.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          toolName: 'agent_response_validation',
          status: 'FAILED',
        }),
      }),
    );
  });

  it('throws when a conversation id does not belong to the user', async () => {
    prisma.aIConversation.findFirst.mockResolvedValue(null);

    await expect(
      service.execute('user-123', 'Hello', 'conversation-123'),
    ).rejects.toThrow(InternalServerErrorException);
  });

  it('stops after the configured iteration limit', async () => {
    prepareExistingConversation();
    analyticsService.getStudyMetrics.mockResolvedValue({ totalMinutes: 1 });
    providerComplete.mockResolvedValue({
      content: null,
      model: 'test-model',
      raw: {},
      toolCalls: [{ id: 'call-1', name: 'get_study_trends', arguments: {} }],
    });

    await expect(
      service.execute('user-123', 'Keep going', 'conversation-123'),
    ).rejects.toThrow('Maximum iterations reached without final response');

    expect(providerComplete).toHaveBeenCalledTimes(3);
    expect(prisma.aIToolExecution.create).toHaveBeenCalledTimes(3);
    expect(prisma.aIToolExecution.update).toHaveBeenCalledTimes(3);
  });
});
