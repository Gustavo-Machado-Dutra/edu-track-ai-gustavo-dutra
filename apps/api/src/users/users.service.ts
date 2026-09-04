import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserSettingsDto } from './dto/update-user-settings.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        timezone: true,
        notificationsEnabled: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async updateSettings(id: string, dto: UpdateUserSettingsDto) {
    return this.prisma.user.update({
      where: { id },
      data: {
        notificationsEnabled: dto.notificationsEnabled,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        timezone: true,
        notificationsEnabled: true,
      },
    });
  }
}
