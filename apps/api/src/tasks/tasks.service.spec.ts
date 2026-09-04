import { describe, expect, it, vi } from 'vitest';
import { TasksService } from './tasks.service';

describe('TasksService', () => {
  it('rejects creating a task in another user subject', async () => {
    const prisma = {
      subject: { findFirst: vi.fn().mockResolvedValue(null) },
      academicTask: { create: vi.fn() },
    };
    const service = new TasksService(prisma as never);

    await expect(
      service.create('user-1', {
        subjectId: 'subject-2',
        title: 'Estudar',
      }),
    ).rejects.toThrow('Disciplina não encontrada');

    expect(prisma.academicTask.create).not.toHaveBeenCalled();
  });

  it('records a status transition when completing a task', async () => {
    const prisma: {
      academicTask: {
        findFirst: ReturnType<typeof vi.fn>;
        update?: ReturnType<typeof vi.fn>;
      };
      taskHistory: { create: ReturnType<typeof vi.fn> };
      $transaction?: ReturnType<typeof vi.fn>;
    } = {
      academicTask: {
        findFirst: vi.fn().mockResolvedValue({ id: 'task-1' }),
      },
      taskHistory: { create: vi.fn().mockResolvedValue({}) },
    };
    prisma.academicTask.findFirst
      .mockResolvedValueOnce({ id: 'task-1' })
      .mockResolvedValueOnce({ status: 'TODO' });
    prisma.$transaction = vi.fn(async (callback) => callback(prisma));
    prisma.academicTask.update = vi.fn().mockResolvedValue({ id: 'task-1', status: 'COMPLETED' });
    const service = new TasksService(prisma as never);

    await service.complete('task-1', 'user-1');

    expect(prisma.taskHistory.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        taskId: 'task-1',
        userId: 'user-1',
        fromStatus: 'TODO',
        toStatus: 'COMPLETED',
      }),
    });
  });
});


