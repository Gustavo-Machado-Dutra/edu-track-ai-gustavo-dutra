import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InsightsService } from './insights.service';

@ApiTags('insights')
@Controller('insights')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  @Get()
  @ApiOkResponse({ description: 'Lista insights do usuário' })
  async list(@CurrentUser() user: CurrentUser) {
    const insights = await this.insightsService.findAllByUser(user.id);
    return { data: insights };
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Retorna insight por ID' })
  async getOne(@CurrentUser() user: CurrentUser, @Param('id') id: string) {
    const insight = await this.insightsService.findByIdForUser(id, user.id);
    return { data: insight };
  }

}
