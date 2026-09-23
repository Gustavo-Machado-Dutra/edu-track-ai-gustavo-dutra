export interface WeeklyReportAnalyticsDataset {
  userId: string;
  periodStart: Date;
  periodEnd: Date;
  metrics: {
    tasks: {
      total: number;
      byStatus: {
        TODO: number;
        IN_PROGRESS: number;
        COMPLETED: number;
        CANCELLED: number;
      };
      overdue: number;
      completionRate: number;
    };
    study: {
      totalMinutes: number;
      totalHours: number;
      sessionsCount: number;
      averageSessionMinutes: number;
      bySubject: Record<string, number>;
    };
    subjectsCount: number;
    recentSessions: Array<Record<string, unknown>>;
  };
}

export interface WeeklyReportJobPayload {
  reportId: string;
  userId: string;
  periodStart: Date;
  periodEnd: Date;
}

export interface StorageArtifact {
  storageKey: string;
  fileName: string;
  url: string;
}

export interface IStorageProvider {
  upload(buffer: Buffer, fileName: string, contentType: string): Promise<StorageArtifact>;
  delete(storageKey: string): Promise<void>;
}

export interface IPdfGenerator {
  generate(dataset: WeeklyReportAnalyticsDataset): Promise<Buffer>;
}


