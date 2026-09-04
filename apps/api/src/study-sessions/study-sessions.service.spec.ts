import { describe, expect, it, vi } from 'vitest';
import { StudySessionsService } from './study-sessions.service';

describe('StudySessionsService', () => {
  it('ends an active session and persists its duration', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-04T15:02:00.000Z'));

    const startedAt = new Date('2026-09-04T15:00:00.000Z');
    const prisma = {
      studySession: {
        findFirst: vi.fn().mockResolvedValue({ startedAt, endedAt: null }),
        update: vi.fn().mockResolvedValue({ id: 'session-1', durationSeconds: 120 }),
      },
    };
    const service = new StudySessionsService(prisma as never);

    const result = await service.end('session-1', 'user-1');

    expect(result.durationSeconds).toBe(120);
    expect(prisma.studySession.update).toHaveBeenCalledWith({
      where: { id: 'session-1' },
      data: {
        endedAt: new Date('2026-09-04T15:02:00.000Z'),
        durationSeconds: 120,
      },
    });
    vi.useRealTimers();
  });
});
