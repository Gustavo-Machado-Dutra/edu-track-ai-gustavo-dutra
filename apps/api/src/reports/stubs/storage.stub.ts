import { Injectable } from '@nestjs/common';
import { IStorageProvider, StorageArtifact } from '../report-contracts';

@Injectable()
export class StorageStub implements IStorageProvider {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async upload(_buffer: Buffer, _fileName: string, _contentType: string): Promise<StorageArtifact> {
    throw new Error('S3-compatible Object Storage infrastructure is currently missing. Please configure storage provider.');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async delete(_storageKey: string): Promise<void> {
    throw new Error('S3-compatible Object Storage infrastructure is currently missing.');
  }
}

