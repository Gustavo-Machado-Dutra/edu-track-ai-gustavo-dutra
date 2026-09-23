import { Injectable, Logger } from '@nestjs/common';
import { WeeklyReportJobPayload } from './report-contracts';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  async enqueueWeeklyReport(payload: WeeklyReportJobPayload): Promise<void> {
    this.logger.log('Enqueuing weekly report job for reportId: ' + payload.reportId);
    
    // TODO: Implement actual BullMQ producer
    // This is a placeholder to allow the pipeline to be testable and integrated
    // once the BullMQ/Redis infrastructure is available.
    this.logger.debug('BullMQ producer not implemented: requires bullmq and ioredis dependencies');
  }
}

