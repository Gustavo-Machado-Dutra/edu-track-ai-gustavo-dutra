import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, TaskStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateTaskDto) {
    const title = dto.title.trim();
    if (!title) {
      throw new NotFoundException('O título da tarefa é obrigatório');
    }

    const subject = await this.prisma.subject.findFirst({
      where: { id: dto.subjectId, userId },
      select: { id: true },
    });

    if (!subject) {
      throw new NotFoundException('Disciplina não encontrada');
    }

    return this.prisma.academicTask.create({
      data: {
        userId,
        subjectId: dto.subjectId,
        title,
        description: dto.description,
        priority: dto.priority ?? 'MEDIUM',
        difficulty: dto.difficulty ?? 'MEDIUM',
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        estimatedMinutes: dto.estimatedMinutes,
        status: 'TODO',
      },
    });
  }

  async findAllByUser(userId: string, status?: TaskStatus) {
    return this.prisma.academicTask.findMany({
      where: {
        userId,
        ...(status && { status }),
      },
      include: {
        subject: true,
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  async findById(id: string) {
    const task = await this.prisma.academicTask.findUnique({
      where: { id },
      include: { subject: true },
    });

    if (!task) {
      throw new NotFoundException('Tarefa não encontrada');
    }

    return task;
  }

  async findByIdForUser(id: string, userId: string) {
    const task = await this.prisma.academicTask.findFirst({
      where: { id, userId },
      include: { subject: true },
    });

    if (!task) {
      throw new NotFoundException('Tarefa não encontrada');
    }

    return task;
  }

  async update(id: string, userId: string, dto: UpdateTaskDto) {
    const currentTask = await this.prisma.academicTask.findFirst({
      where: { id, userId },
      select: { status: true, priority: true, dueDate: true },
    });

    if (!currentTask) {
      throw new NotFoundException('Tarefa não encontrada');
    }

    if (dto.title !== undefined && !dto.title.trim()) {
      throw new NotFoundException('O título da tarefa é obrigatório');
    }

    if (dto.subjectId) {
      const subject = await this.prisma.subject.findFirst({
        where: { id: dto.subjectId, userId },
        select: { id: true },
      });

      if (!subject) {
        throw new NotFoundException('Disciplina não encontrada');
      }
    }

    const data: Prisma.AcademicTaskUncheckedUpdateInput = {
      title: dto.title?.trim(),
      description: dto.description,
      priority: dto.priority,
      difficulty: dto.difficulty,
      status: dto.status,
      completedAt: dto.status === 'COMPLETED' ? new Date() : dto.status ? null : undefined,
      subjectId: dto.subjectId,
      estimatedMinutes: dto.estimatedMinutes,
      dueDate: dto.dueDate === undefined ? undefined : dto.dueDate ? new Date(dto.dueDate) : null,
    };

    const nextDueDate = dto.dueDate === undefined ? undefined : dto.dueDate ? new Date(dto.dueDate) : null;
    const statusChanged = dto.status !== undefined && dto.status !== currentTask.status;
    const priorityChanged = dto.priority !== undefined && dto.priority !== currentTask.priority;
    const dueDateChanged = dto.dueDate !== undefined && nextDueDate?.getTime() !== currentTask.dueDate?.getTime();

    return this.prisma.$transaction(async (transaction) => {
      const updated = await transaction.academicTask.update({
        where: { id },
        data,
      });

      if (statusChanged || priorityChanged || dueDateChanged) {
        await transaction.taskHistory.create({
          data: {
            taskId: id,
            userId,
            fromStatus: statusChanged ? currentTask.status : null,
            toStatus: statusChanged ? dto.status : null,
            fromPriority: priorityChanged ? currentTask.priority : null,
            toPriority: priorityChanged ? dto.priority : null,
            fromDueDate: dueDateChanged ? currentTask.dueDate : null,
            toDueDate: dueDateChanged ? nextDueDate : null,
          },
        });
      }

      return updated;
    });
  }

  async complete(id: string, userId: string) {
    await this.findByIdForUser(id, userId);

    const currentTask = await this.prisma.academicTask.findFirst({
      where: { id, userId },
      select: { status: true },
    });

    return this.prisma.$transaction(async (transaction) => {
      const updated = await transaction.academicTask.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });

      if (currentTask && currentTask.status !== 'COMPLETED') {
        await transaction.taskHistory.create({
          data: {
            taskId: id,
            userId,
            fromStatus: currentTask.status,
            toStatus: 'COMPLETED',
            changedAt: new Date(),
          },
        });
      }

      return updated;
    });
  }

  async remove(id: string, userId: string) {
    await this.findByIdForUser(id, userId);

    return this.prisma.academicTask.delete({
      where: { id },
    });
  }

  async getHistory(id: string, userId: string) {
    await this.findByIdForUser(id, userId);

    return this.prisma.taskHistory.findMany({
      where: { taskId: id, userId },
      orderBy: { changedAt: 'desc' },
    });
  }

}
