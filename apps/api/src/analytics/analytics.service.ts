import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardData(userId: string) {
    const [tasks, study, subjects, recentSessions] = await Promise.all([
      this.getTaskMetrics(userId),
      this.getStudyMetrics(userId),
      this.prisma.subject.count({ where: { userId, archivedAt: null } }),
      this.prisma.studySession.findMany({
        where: { userId },
        orderBy: { startedAt: 'desc' },
        take: 5,
        include: { subject: true, task: true },
      }),
    ]);

    return {
      tasks,
      study,
      subjectsCount: subjects,
      recentSessions,
    };
  }

  async getTaskMetrics(userId: string) {
    const tasks = await this.prisma.academicTask.findMany({
      where: { userId },
      select: { status: true, priority: true, dueDate: true, difficulty: true },
    });

    const now = new Date();
    const total = tasks.length;
    const byStatus = {
      TODO: tasks.filter((t) => t.status === 'TODO').length,
      IN_PROGRESS: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
      COMPLETED: tasks.filter((t) => t.status === 'COMPLETED').length,
      CANCELLED: tasks.filter((t) => t.status === 'CANCELLED').length,
    };
    const overdue = tasks.filter(
      (t) => t.dueDate && t.dueDate < now && t.status !== 'COMPLETED' && t.status !== 'CANCELLED',
    ).length;

    return {
      total,
      byStatus,
      overdue,
      completionRate: total > 0 ? Math.round((byStatus.COMPLETED / total) * 100) : 0,
    };
  }

  async getStudyMetrics(userId: string) {
    const sessions = await this.prisma.studySession.findMany({
      where: { userId },
      select: { durationSeconds: true, subjectId: true },
    });

    const totalSeconds = sessions.reduce((acc, s) => acc + (s.durationSeconds ?? 0), 0);
    const bySubject: Record<string, number> = {};

    sessions.forEach((s) => {
      bySubject[s.subjectId] = (bySubject[s.subjectId] || 0) + (s.durationSeconds ?? 0);
    });

    return {
      totalMinutes: Math.floor(totalSeconds / 60),
      totalHours: Math.floor(totalSeconds / 3600),
      sessionsCount: sessions.length,
      averageSessionMinutes: sessions.length > 0 ? Math.round(totalSeconds / 60 / sessions.length) : 0,
      bySubject,
    };
  }
}
