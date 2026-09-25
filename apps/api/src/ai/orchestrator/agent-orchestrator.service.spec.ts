import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpException, HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { AgentService } from '../agent.service';
import { AnalyticsService } from '../../analytics/analytics.service';
import { PrismaService } from '../../prisma/prisma.service';
import { TasksService } from '../../tasks/tasks.service';
import { LlmProviderAdapter } from '../provider/llm-provider-adapter';
import { AgentOrchestratorService } from './agent-orchestrator.service';
import { AgentToolCallValidator } from '../tools/agent-tool-call-validator';
import { AgentToolRegistry } from '../tools/agent-tool-registry';
import { StructuredOutputValidationService } from '../structured-output-validation.service';
import { LlmProviderError } from '../provider/llm-provider-error';

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
  });

  it('handles 429 / quota error and throws categorized HttpException with 429', async () => {
    prepareExistingConversation();
    providerComplete.mockRejectedValue(
      new LlmProviderError('Quota exceeded for model', 'quota-exceeded', true, 429),
    );

    try {
      await service.execute('user-123', 'Hello', 'conversation-123');
      expect.unreachable('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      const httpError = error as HttpException;
      expect(httpError.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
      const response = httpError.getResponse() as Record<string, unknown>;
      expect(response.code).toBe('PROVIDER_QUOTA');
      expect(response.statusCode).toBe(429);
      expect(response.message).toContain('limite de uso');
    }
  });

  it('handles 503 provider unavailable and throws categorized HttpException with 503', async () => {
    prepareExistingConversation();
    providerComplete.mockRejectedValue(
      new LlmProviderError('Service Unavailable', 'http-error', true, 503),
    );

    try {
      await service.execute('user-123', 'Hello', 'conversation-123');
      expect.unreachable('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      const httpError = error as HttpException;
      expect(httpError.getStatus()).toBe(HttpStatus.SERVICE_UNAVAILABLE);
      const response = httpError.getResponse() as Record<string, unknown>;
      expect(response.code).toBe('PROVIDER_UNAVAILABLE');
    }
  });

  it('handles 401 provider auth error and throws categorized HttpException with 502', async () => {
    prepareExistingConversation();
    providerComplete.mockRejectedValue(
      new LlmProviderError('Invalid API Key', 'missing-api-key', false, 401),
    );

    try {
      await service.execute('user-123', 'Hello', 'conversation-123');
      expect.unreachable('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      const httpError = error as HttpException;
      expect(httpError.getStatus()).toBe(HttpStatus.BAD_GATEWAY);
      const response = httpError.getResponse() as Record<string, unknown>;
      expect(response.code).toBe('PROVIDER_AUTH_ERROR');
    }
  });

  it('handles 400 bad request and throws categorized HttpException with 400', async () => {
    prepareExistingConversation();
    providerComplete.mockRejectedValue(
      new LlmProviderError('Bad payload', 'http-error', false, 400),
    );

    try {
      await service.execute('user-123', 'Hello', 'conversation-123');
      expect.unreachable('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      const httpError = error as HttpException;
      expect(httpError.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      const response = httpError.getResponse() as Record<string, unknown>;
      expect(response.code).toBe('PROVIDER_BAD_REQUEST');
    }
  });

  it('handles timeout and throws categorized HttpException with 504', async () => {
    prepareExistingConversation();
    providerComplete.mockRejectedValue(
      new Error('Request timed out after 30000ms'),
    );

    try {
      await service.execute('user-123', 'Hello', 'conversation-123');
      expect.unreachable('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      const httpError = error as HttpException;
      expect(httpError.getStatus()).toBe(HttpStatus.GATEWAY_TIMEOUT);
      const response = httpError.getResponse() as Record<string, unknown>;
      expect(response.code).toBe('PROVIDER_TIMEOUT');
    }
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

