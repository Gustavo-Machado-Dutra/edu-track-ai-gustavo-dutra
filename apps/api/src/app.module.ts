import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AnalyticsModule } from './analytics/analytics.module';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { InsightsModule } from './insights/insights.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ReportsModule } from './reports/reports.module';
import { StudySessionsModule } from './study-sessions/study-sessions.module';
import { SubjectsModule } from './subjects/subjects.module';
import { TasksModule } from './tasks/tasks.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env', '../../.env.local', '../../.env'],
      isGlobal: true,
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    AnalyticsModule,
    UsersModule,
    SubjectsModule,
    TasksModule,
    StudySessionsModule,
    NotificationsModule,
    InsightsModule,
    ReportsModule,
  ],
})
export class AppModule {}
