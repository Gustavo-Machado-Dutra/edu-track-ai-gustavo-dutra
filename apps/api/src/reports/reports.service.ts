import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async generateWeeklyReport(userId: string) {
    const now = new Date();
    const periodStart = new Date(now);
    periodStart.setDate(now.getDate() - now.getDay());
    periodStart.setHours(0, 0, 0, 0);

    const periodEnd = new Date(periodStart);
    periodEnd.setDate(periodStart.getDate() + 6);
    periodEnd.setHours(23, 59, 59, 999);

    const existing = await this.prisma.weeklyReport.findFirst({
      where: { userId, periodStart, periodEnd },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.weeklyReport.create({
      data: {
        userId,
        periodStart,
        periodEnd,
        status: 'PENDING',
      },
    });
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
