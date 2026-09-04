import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReportsService } from './reports.service';

@ApiTags('reports')
@Controller('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post('weekly/generate')
  @ApiCreatedResponse({ description: 'Relatório semanal gerado' })
  async generateWeekly(@CurrentUser() user: CurrentUser) {
    const report = await this.reportsService.generateWeeklyReport(user.id);
    return { data: report };
  }

  @Get('weekly')
  @ApiOkResponse({ description: 'Lista relatórios semanais' })
  async listWeekly(@CurrentUser() user: CurrentUser, @Query('limit') limit?: string) {
    const reports = await this.reportsService.listWeeklyReports(
      user.id,
      limit ? parseInt(limit, 10) : 10,
    );
    return { data: reports };
  }

  @Get('weekly/:id')
  @ApiOkResponse({ description: 'Retorna relatório por ID' })
  async getWeekly(@CurrentUser() user: CurrentUser, @Param('id') id: string) {
    const report = await this.reportsService.getWeeklyReportForUser(id, user.id);
    return { data: report };
  }
}
