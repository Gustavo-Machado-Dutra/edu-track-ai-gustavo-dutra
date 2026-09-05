import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudySessionDto } from './dto/create-study-session.dto';

@Injectable()
export class StudySessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateStudySessionDto) {
    const startedAt = new Date(dto.startedAt);
    const endedAt = dto.endedAt ? new Date(dto.endedAt) : null;
    const subject = await this.prisma.subject.findFirst({
      where: { id: dto.subjectId, userId },
      select: { id: true },
    });

    if (!subject) {
      throw new NotFoundException('Disciplina não encontrada');
    }

    if (endedAt && endedAt <= startedAt) {
      throw new BadRequestException('O fim da sessão deve ocorrer após o início');
    }

    let durationSeconds = dto.durationSeconds;
    if (durationSeconds === undefined && endedAt) {
      durationSeconds = Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000);
    }

    if (durationSeconds !== undefined && durationSeconds < 1) {
      throw new BadRequestException('A duração da sessão deve ser maior que zero');
    }

    if (durationSeconds !== undefined && endedAt) {
      const expectedDuration = Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000);
      if (durationSeconds !== expectedDuration) {
        throw new BadRequestException('A duração da sessão não corresponde ao intervalo informado');
      }
    }

    if (dto.taskId) {
      const task = await this.prisma.academicTask.findFirst({
        where: { id: dto.taskId, userId, subjectId: dto.subjectId },
        select: { id: true },
      });

      if (!task) {
        throw new NotFoundException('Tarefa não encontrada');
      }
    }

    return this.prisma.studySession.create({
      data: {
        userId,
        subjectId: dto.subjectId,
        taskId: dto.taskId,
        startedAt,
        endedAt,
        durationSeconds,
      },
    });
  }

  async findAllByUser(userId: string) {
    return this.prisma.studySession.findMany({
      where: { userId },
      include: {
        subject: true,
        task: true,
      },
      orderBy: { startedAt: 'desc' },
    });
  }

  async findById(id: string) {
    const session = await this.prisma.studySession.findUnique({
      where: { id },
      include: {
        subject: true,
        task: true,
      },
    });

    if (!session) {
      throw new NotFoundException('Sessão de estudo não encontrada');
    }

    return session;
  }

  async findByIdForUser(id: string, userId: string) {
    const session = await this.prisma.studySession.findFirst({
      where: { id, userId },
      include: {
        subject: true,
        task: true,
      },
    });

    if (!session) {
      throw new NotFoundException('Sessão de estudo não encontrada');
    }

    return session;
  }

  async end(id: string, userId: string) {
    const session = await this.prisma.studySession.findFirst({
      where: { id, userId },
      select: { startedAt: true, endedAt: true },
    });

    if (!session) {
      throw new NotFoundException('Sessão de estudo não encontrada');
    }

    if (session.endedAt) {
      throw new BadRequestException('Sessão de estudo já encerrada');
    }

    const endedAt = new Date();
    const durationSeconds = Math.max(1, Math.floor((endedAt.getTime() - session.startedAt.getTime()) / 1000));

    return this.prisma.studySession.update({
      where: { id },
      data: { endedAt, durationSeconds },
    });
  }
}
