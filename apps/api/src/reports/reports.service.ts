import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueueService } from './queue.service';
import { WeeklyReportJobPayload } from './report-contracts';

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queueService: QueueService
  ) {}

  async generateWeeklyReport(userId: string) {
    const now = new Date();
    const periodStart = new Date(now);
    periodStart.setDate(now.getDate() - now.getDay());
    periodStart.setHours(0, 0, 0, 0);

    const periodEnd = new Date(periodStart);
    periodEnd.setDate(periodStart.getDate() + 6);
    periodEnd.setHours(23, 59, 59, 999);

    const report = await this.prisma.weeklyReport.upsert({
      where: {
        userId_periodStart_periodEnd: { userId, periodStart, periodEnd },
      },
      create: {
        userId,
        periodStart,
        periodEnd,
        status: 'PENDING',
      },
      update: {},
    });

    // Enqueue the asynchronous pipeline processing
    const payload: WeeklyReportJobPayload = {
      reportId: report.id,
      userId: report.userId,
      periodStart: report.periodStart,
      periodEnd: report.periodEnd,
    };

    await this.queueService.enqueueWeeklyReport(payload);

    return report;
  }

  async listWeeklyReports(userId: string, limit: number) {
    return this.prisma.weeklyReport.findMany({
      where: { userId },
      orderBy: { periodEnd: 'desc' },
      take: limit,
    });
  }

  async getWeeklyReport(id: string) {
    const report = await this.prisma.weeklyReport.findUnique({
      where: { id },
    });

    if (!report) {
      throw new NotFoundException('Relatório não encontrado');
    }

    return report;
  }

  async getWeeklyReportForUser(id: string, userId: string) {
    const report = await this.prisma.weeklyReport.findFirst({
      where: { id, userId },
    });

    if (!report) {
      throw new NotFoundException('Relatório não encontrado');
    }

    return report;
  }
}

