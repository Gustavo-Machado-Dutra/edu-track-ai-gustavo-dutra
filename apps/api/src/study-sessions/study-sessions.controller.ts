import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateStudySessionDto } from './dto/create-study-session.dto';
import { StudySessionsService } from './study-sessions.service';

@ApiTags('study-sessions')
@Controller('study-sessions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class StudySessionsController {
  constructor(private readonly studySessionsService: StudySessionsService) {}

  @Post()
  @ApiCreatedResponse({ description: 'Sessão de estudo criada' })
  async create(@CurrentUser() user: CurrentUser, @Body() dto: CreateStudySessionDto) {
    const session = await this.studySessionsService.create(user.id, dto);
    return { data: session };
  }

  @Get()
  @ApiOkResponse({ description: 'Lista sessões de estudo do usuário' })
  async list(@CurrentUser() user: CurrentUser) {
    const sessions = await this.studySessionsService.findAllByUser(user.id);
    return { data: sessions };
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Retorna sessão por ID' })
  async getOne(@CurrentUser() user: CurrentUser, @Param('id', new ParseUUIDPipe()) id: string) {
    const session = await this.studySessionsService.findByIdForUser(id, user.id);
    return { data: session };
  }

  @Post(':id/end')
  @ApiOkResponse({ description: 'Sessão de estudo encerrada' })
  async end(@CurrentUser() user: CurrentUser, @Param('id', new ParseUUIDPipe()) id: string) {
    const session = await this.studySessionsService.end(id, user.id);
    return { data: session };
  }
}
