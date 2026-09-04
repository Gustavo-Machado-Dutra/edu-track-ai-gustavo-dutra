import { Injectable, NotFoundException } from '@nestjs/common';
import { InsightType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InsightsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByUser(userId: string) {
    return this.prisma.insight.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async findById(id: string) {
    const insight = await this.prisma.insight.findUnique({
      where: { id },
    });

    if (!insight) {
      throw new NotFoundException('Insight não encontrado');
    }

    return insight;
  }

  async findByIdForUser(id: string, userId: string) {
    const insight = await this.prisma.insight.findFirst({
      where: { id, userId },
    });

    if (!insight) {
      throw new NotFoundException('Insight não encontrado');
    }

    return insight;
  }

  async create(
    userId: string,
    data: {
      type: InsightType;
      title: string;
      description: string;
      periodStart: Date;
      periodEnd: Date;
      metricsJson: Prisma.InputJsonValue;
      confidence?: number;
      datasetVersion?: string;
      model?: string;
      promptVersion?: string;
      expiresAt?: Date;
    },
  ) {
    return this.prisma.insight.create({
      data: {
        userId,
        type: data.type,
        title: data.title,
        description: data.description,
        periodStart: data.periodStart,
        periodEnd: data.periodEnd,
        metricsJson: data.metricsJson,
        confidence: data.confidence,
        datasetVersion: data.datasetVersion,
        model: data.model,
        promptVersion: data.promptVersion,
        expiresAt: data.expiresAt,
      },
    });
  }
}
