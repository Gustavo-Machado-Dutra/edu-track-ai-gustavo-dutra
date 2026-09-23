import { afterEach, describe, expect, it, vi } from 'vitest';
import { ReportsService } from './reports.service';

describe('ReportsService', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('uses the weekly compound key to make report generation idempotent', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-23T12:00:00.000Z'));
    const report = { id: 'report-1', userId: 'user-1', status: 'PENDING', periodStart: new Date(), periodEnd: new Date() };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prismaMock: any = {
      weeklyReport: {
        upsert: vi.fn().mockResolvedValue(report),
      },
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const queueMock: any = {
      enqueueWeeklyReport: vi.fn().mockResolvedValue(undefined),
    };
    const service = new ReportsService(prismaMock, queueMock);

    await expect(service.generateWeeklyReport('user-1')).resolves.toEqual(report);

    expect(prismaMock.weeklyReport.upsert).toHaveBeenCalledTimes(1);
    expect(queueMock.enqueueWeeklyReport).toHaveBeenCalledTimes(1);
  });

  it('lists only reports owned by the authenticated user', async () => {
    const reports = [{ id: 'report-1', userId: 'user-1' }];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prismaMock: any = {
      weeklyReport: {
        findMany: vi.fn().mockResolvedValue(reports),
      },
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const queueMock: any = {
      enqueueWeeklyReport: vi.fn().mockResolvedValue(undefined),
    };
    const service = new ReportsService(prismaMock, queueMock);

    await expect(service.listWeeklyReports('user-1', 5)).resolves.toEqual(reports);
    expect(prismaMock.weeklyReport.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      orderBy: { periodEnd: 'desc' },
      take: 5,
    });
  });

  it('throws NotFoundException when report is not found', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prismaMock: any = {
      weeklyReport: {
        findUnique: vi.fn().mockResolvedValue(null),
      },
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const queueMock: any = {
      enqueueWeeklyReport: vi.fn().mockResolvedValue(undefined),
    };
    const service = new ReportsService(prismaMock, queueMock);

    await expect(service.getWeeklyReport('non-existent')).rejects.toThrow('Relatório não encontrado');
  });

  it('throws NotFoundException when report does not belong to user', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prismaMock: any = {
      weeklyReport: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const queueMock: any = {
      enqueueWeeklyReport: vi.fn().mockResolvedValue(undefined),
    };
    const service = new ReportsService(prismaMock, queueMock);

    await expect(service.getWeeklyReportForUser('report-1', 'user-2')).rejects.toThrow('Relatório não encontrado');
  });
});
