import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';

@ApiTags('analytics')
@Controller('analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOkResponse({ description: 'Dados do dashboard do usuário' })
  async getDashboard(@CurrentUser() user: CurrentUser) {
    const dashboard = await this.analyticsService.getDashboardData(user.id);
    return { data: dashboard };
  }

  @Get('metrics/tasks')
  @ApiOkResponse({ description: 'Métricas de tarefas' })
  async getTaskMetrics(@CurrentUser() user: CurrentUser) {
    const metrics = await this.analyticsService.getTaskMetrics(user.id);
    return { data: metrics };
  }

  @Get('metrics/study')
  @ApiOkResponse({ description: 'Métricas de estudo' })
  async getStudyMetrics(@CurrentUser() user: CurrentUser) {
    const metrics = await this.analyticsService.getStudyMetrics(user.id);
    return { data: metrics };
  }
}
