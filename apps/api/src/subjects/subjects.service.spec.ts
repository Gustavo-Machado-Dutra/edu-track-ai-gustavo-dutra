import { describe, expect, it, vi } from 'vitest';
import { SubjectsService } from './subjects.service';

describe('SubjectsService', () => {
  it('removes a subject only after confirming it belongs to the current user', async () => {
    const prisma = {
      subject: {
        findFirst: vi.fn().mockResolvedValue({ id: 'subject-1' }),
        delete: vi.fn().mockResolvedValue({ id: 'subject-1' }),
      },
    };
    const service = new SubjectsService(prisma as never);

    await service.remove('subject-1', 'user-1');

    expect(prisma.subject.findFirst).toHaveBeenCalledWith({
      where: { id: 'subject-1', userId: 'user-1' },
    });
    expect(prisma.subject.delete).toHaveBeenCalledWith({ where: { id: 'subject-1' } });
  });
});
