import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { QueueService } from './queue.service';
import { WorkerService } from './worker.service';
import { StorageStub } from './stubs/storage.stub';
import { PdfStub } from './stubs/pdf.stub';

@Module({
  controllers: [ReportsController],
  providers: [
    ReportsService, 
    QueueService, 
    WorkerService,
    {
      provide: 'IStorageProvider',
      useClass: StorageStub,
    },
    {
      provide: 'IPdfGenerator',
      useClass: PdfStub,
    },
  ],
  exports: [ReportsService],
})
export class ReportsModule {}

