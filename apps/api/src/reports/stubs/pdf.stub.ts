import { Injectable } from '@nestjs/common';
import { IPdfGenerator, WeeklyReportAnalyticsDataset } from '../report-contracts';

@Injectable()
export class PdfStub implements IPdfGenerator {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async generate(_dataset: WeeklyReportAnalyticsDataset): Promise<Buffer> {
    throw new Error('PDF Generation infrastructure is currently missing. Please configure PDF generator.');
  }
}

