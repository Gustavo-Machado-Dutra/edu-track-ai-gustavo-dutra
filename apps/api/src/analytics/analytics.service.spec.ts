import { describe, expect, it, vi } from 'vitest';
import { AnalyticsService } from './analytics.service';

describe('AnalyticsService', () => {
  it('calculates task metrics using only the requested user data', async () => {
    const prisma = {
      academicTask: {
        findMany: vi.fn().mockResolvedValue([
          { status: 'TODO', priority: 'HIGH', dueDate: null, difficulty: 'HARD' },
          { status: 'COMPLETED', priority: 'LOW', dueDate: null, difficulty: 'EASY' },
        ]),
      },
    };
    const service = new AnalyticsService(prisma as never);

    const result = await service.getTaskMetrics('user-1');

    expect(prisma.academicTask.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      select: { status: true, priority: true, dueDate: true, difficulty: true },
    });
    expect(result).toEqual({
      total: 2,
      byStatus: { TODO: 1, IN_PROGRESS: 0, COMPLETED: 1, CANCELLED: 0 },
      overdue: 0,
      completionRate: 50,
    });
  });

  it('returns zero study metrics when the user has no sessions', async () => {
    const prisma = {
      studySession: {
        findMany: vi.fn().mockResolvedValue([]),
      },
    };
    const service = new AnalyticsService(prisma as never);

    await expect(service.getStudyMetrics('user-1')).resolves.toEqual({
      totalMinutes: 0,
      totalHours: 0,
      sessionsCount: 0,
      averageSessionMinutes: 0,
      bySubject: {},
    });
  });
});
