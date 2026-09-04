import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { SubjectsService } from './subjects.service';

@ApiTags('subjects')
@Controller('subjects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Post()
  @ApiCreatedResponse({ description: 'Disciplina criada' })
  async create(@CurrentUser() user: CurrentUser, @Body() dto: CreateSubjectDto) {
    const subject = await this.subjectsService.create(user.id, dto);
    return { data: subject };
  }

  @Get()
  @ApiOkResponse({ description: 'Lista disciplinas do usuário' })
  async list(@CurrentUser() user: CurrentUser) {
    const subjects = await this.subjectsService.findAllByUser(user.id);
    return { data: subjects };
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Retorna disciplina por ID' })
  async getOne(@CurrentUser() user: CurrentUser, @Param('id') id: string) {
    const subject = await this.subjectsService.findByIdForUser(id, user.id);
    return { data: subject };
  }

  @Patch(':id')
  @ApiOkResponse({ description: 'Disciplina atualizada' })
  async update(@CurrentUser() user: CurrentUser, @Param('id') id: string, @Body() dto: UpdateSubjectDto) {
    const subject = await this.subjectsService.update(id, user.id, dto);
    return { data: subject };
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'Disciplina removida' })
  async remove(@CurrentUser() user: CurrentUser, @Param('id') id: string) {
    await this.subjectsService.remove(id, user.id);
    return { data: { id, deleted: true } };
  }
}
