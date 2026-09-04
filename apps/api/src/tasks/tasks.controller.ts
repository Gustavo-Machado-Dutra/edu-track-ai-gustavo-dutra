import { Body, Controller, Delete, Get, Param, ParseEnumPipe, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { TaskStatus } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';

@ApiTags('tasks')
@Controller('tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiCreatedResponse({ description: 'Tarefa criada' })
  async create(@CurrentUser() user: CurrentUser, @Body() dto: CreateTaskDto) {
    const task = await this.tasksService.create(user.id, dto);
    return { data: task };
  }

  @Get()
  @ApiOkResponse({ description: 'Lista tarefas do usuário' })
  async list(
    @CurrentUser() user: CurrentUser,
    @Query('status', new ParseEnumPipe(TaskStatus, { optional: true })) status?: TaskStatus,
  ) {
    const tasks = await this.tasksService.findAllByUser(user.id, status);
    return { data: tasks };
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Retorna tarefa por ID' })
  async getOne(@CurrentUser() user: CurrentUser, @Param('id', new ParseUUIDPipe()) id: string) {
    const task = await this.tasksService.findByIdForUser(id, user.id);
    return { data: task };
  }

  @Patch(':id')
  @ApiOkResponse({ description: 'Tarefa atualizada' })
  async update(@CurrentUser() user: CurrentUser, @Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateTaskDto) {
    const task = await this.tasksService.update(id, user.id, dto);
    return { data: task };
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'Tarefa removida' })
  async remove(@CurrentUser() user: CurrentUser, @Param('id', new ParseUUIDPipe()) id: string) {
    await this.tasksService.remove(id, user.id);
    return { data: { id, deleted: true } };
  }

  @Post(':id/complete')
  @ApiOkResponse({ description: 'Tarefa marcada como concluída' })
  async complete(@CurrentUser() user: CurrentUser, @Param('id', new ParseUUIDPipe()) id: string) {
    const task = await this.tasksService.complete(id, user.id);
    return { data: task };
  }

  @Get(':id/history')
  @ApiOkResponse({ description: 'Retorna o histórico da tarefa' })
  async history(@CurrentUser() user: CurrentUser, @Param('id', new ParseUUIDPipe()) id: string) {
    const history = await this.tasksService.getHistory(id, user.id);
    return { data: history };
  }
}
