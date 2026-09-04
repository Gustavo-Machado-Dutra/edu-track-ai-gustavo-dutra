import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterPushDeviceDto } from './dto/register-push-device.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async registerDevice(userId: string, dto: RegisterPushDeviceDto) {
    const existing = await this.prisma.pushDevice.findUnique({
      where: { token: dto.token },
    });

    if (existing) {
      return this.prisma.pushDevice.update({
        where: { id: existing.id },
        data: {
          userId,
          provider: 'FCM',
          platform: dto.platform,
          active: true,
        },
      });
    }

    return this.prisma.pushDevice.create({
      data: {
        userId,
        provider: 'FCM',
        token: dto.token,
        platform: dto.platform,
      },
    });
  }

  async listDevices(userId: string) {
    return this.prisma.pushDevice.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async deactivateDevice(id: string, userId: string) {
    const device = await this.prisma.pushDevice.findFirst({
      where: { id, userId },
    });

    if (!device) {
      throw new NotFoundException('Dispositivo não encontrado');
    }

    return this.prisma.pushDevice.update({
      where: { id },
      data: { active: false },
    });
  }

  async getDeliveryHistory(userId: string) {
    return this.prisma.notificationDelivery.findMany({
      where: { userId },
      orderBy: { sentAt: 'desc' },
      take: 50,
    });
  }
}
