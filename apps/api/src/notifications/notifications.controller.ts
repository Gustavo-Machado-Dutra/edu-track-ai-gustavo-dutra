import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RegisterPushDeviceDto } from './dto/register-push-device.dto';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@Controller('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('devices')
  @ApiCreatedResponse({ description: 'Dispositivo push registrado' })
  async registerDevice(@CurrentUser() user: CurrentUser, @Body() dto: RegisterPushDeviceDto) {
    const device = await this.notificationsService.registerDevice(user.id, dto);
    return { data: device };
  }

  @Get('devices')
  @ApiOkResponse({ description: 'Lista dispositivos do usuário' })
  async listDevices(@CurrentUser() user: CurrentUser) {
    const devices = await this.notificationsService.listDevices(user.id);
    return { data: devices };
  }

  @Post('devices/:id/deactivate')
  @ApiOkResponse({ description: 'Dispositivo desativado' })
  async deactivateDevice(@CurrentUser() user: CurrentUser, @Param('id') id: string) {
    await this.notificationsService.deactivateDevice(id, user.id);
    return { data: { id, deactivated: true } };
  }

  @Get('history')
  @ApiOkResponse({ description: 'Histórico de notificações' })
  async getHistory(@CurrentUser() user: CurrentUser) {
    const history = await this.notificationsService.getDeliveryHistory(user.id);
    return { data: history };
  }
}
