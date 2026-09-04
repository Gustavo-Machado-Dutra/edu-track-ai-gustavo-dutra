import { describe, expect, it, vi } from 'vitest';
import { UsersService } from './users.service';

describe('UsersService', () => {
  it('updates the current user notification preference', async () => {
    const prisma = {
      user: {
        update: vi.fn().mockResolvedValue({
          id: 'user-1',
          notificationsEnabled: false,
        }),
      },
    };
    const service = new UsersService(prisma as never);

    const user = await service.updateSettings('user-1', { notificationsEnabled: false });

    expect(user.notificationsEnabled).toBe(false);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { notificationsEnabled: false },
      select: expect.objectContaining({ notificationsEnabled: true }),
    });
  });
});
