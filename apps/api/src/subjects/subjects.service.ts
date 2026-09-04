import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@Injectable()
export class SubjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateSubjectDto) {
    return this.prisma.subject.create({
      data: {
        userId,
        name: dto.name,
        professor: dto.professor,
        workloadHours: dto.workloadHours,
        description: dto.description,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
      },
    });
  }

  async findAllByUser(userId: string) {
    return this.prisma.subject.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    const subject = await this.prisma.subject.findUnique({
      where: { id },
    });

    if (!subject) {
      throw new NotFoundException('Disciplina não encontrada');
    }

    return subject;
  }

  async findByIdForUser(id: string, userId: string) {
    const subject = await this.prisma.subject.findFirst({
      where: { id, userId },
    });

    if (!subject) {
      throw new NotFoundException('Disciplina não encontrada');
    }

    return subject;
  }

  async update(id: string, userId: string, dto: UpdateSubjectDto) {
    await this.findByIdForUser(id, userId);

    return this.prisma.subject.update({
      where: { id },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });
  }

  async remove(id: string, userId: string) {
    await this.findByIdForUser(id, userId);

    return this.prisma.subject.delete({
      where: { id },
    });
  }
}
