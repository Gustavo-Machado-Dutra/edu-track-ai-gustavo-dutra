import { Injectable, Logger, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { 
  WeeklyReportAnalyticsDataset, 
  WeeklyReportJobPayload, 
  IStorageProvider, 
  IPdfGenerator 
} from './report-contracts';
import { AnalyticsService } from '../analytics/analytics.service';

@Injectable()
export class WorkerService {
  private readonly logger = new Logger(WorkerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly analyticsService: AnalyticsService,
    @Inject('IStorageProvider') private readonly storageProvider: IStorageProvider,
    @Inject('IPdfGenerator') private readonly pdfGenerator: IPdfGenerator,
  ) {}

  async processReport(payload: WeeklyReportJobPayload): Promise<void> {
    const { reportId, userId, periodStart, periodEnd } = payload;

    try {
      this.logger.log('Starting pipeline for report ' + reportId);

      const dashboardData = await this.analyticsService.getDashboardData(userId);
      
      const dataset: WeeklyReportAnalyticsDataset = {
        userId,
        periodStart,
        periodEnd,
        metrics: {
          tasks: dashboardData.tasks,
          study: dashboardData.study,
          subjectsCount: dashboardData.subjectsCount,
          recentSessions: dashboardData.recentSessions,
        },
      };

      const pdfBuffer = await this.pdfGenerator.generate(dataset);

      const fileName = 'reports/weekly/' + userId + '/' + reportId + '.pdf';
      const artifact = await this.storageProvider.upload(
        pdfBuffer, 
        fileName, 
        'application/pdf'
      );

      await this.prisma.weeklyReport.update({
        where: { id: reportId },
        data: {
          status: 'COMPLETED',
          storageKey: artifact.storageKey,
          fileName: artifact.fileName,
          generatedAt: new Date(),
        },
      });

      this.logger.log('Successfully completed report ' + reportId);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to process report ' + reportId + ': ' + message);
      
      await this.prisma.weeklyReport.update({
        where: { id: reportId },
        data: { status: 'FAILED' },
      });
      
      throw error;
    }
  }
}

