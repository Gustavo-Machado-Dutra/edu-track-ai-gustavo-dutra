import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AgentController } from './agent.controller';
import { AgentOrchestratorService } from './agent-orchestrator.service';

type MockOrchestrator = {
  execute: ReturnType<typeof vi.fn>;
};

describe('AgentController', () => {
  let controller: AgentController;
  let orchestrator: MockOrchestrator;

  beforeEach(() => {
    orchestrator = { execute: vi.fn() };
    controller = new AgentController(
      orchestrator as unknown as AgentOrchestratorService,
    );
  });

  it('returns a client response when the message is empty', async () => {
    const result = await controller.chat(
      { user: { sub: 'user-123', email: 'student@example.com' } },
      { message: '  ', conversationId: 'conversation-123' },
    );

    expect(result.response.content).toBe('Message cannot be empty');
    expect(orchestrator.execute).not.toHaveBeenCalled();
  });

  it('delegates a valid message and returns the orchestrator response', async () => {
    orchestrator.execute.mockResolvedValue({
      conversationId: 'conversation-123',
      response: { type: 'text', content: 'Hello!' },
    });

    const result = await controller.chat(
      { user: { sub: 'user-123', email: 'student@example.com' } },
      { message: '  Hi  ', conversationId: 'conversation-123' },
    );

    expect(orchestrator.execute).toHaveBeenCalledWith(
      'user-123',
      'Hi',
      'conversation-123',
    );
    expect(result).toEqual({
      conversationId: 'conversation-123',
      response: { type: 'text', content: 'Hello!' },
    });
  });
});
