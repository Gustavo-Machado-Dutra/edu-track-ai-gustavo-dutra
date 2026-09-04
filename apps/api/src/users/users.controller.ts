import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateUserSettingsDto } from './dto/update-user-settings.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOkResponse({ description: 'Retorna dados do usuário' })
  async getUser(@CurrentUser() userContext: CurrentUser) {
    const user = await this.usersService.findById(userContext.id);
    return { data: user };
  }

  @Patch('me/settings')
  @ApiOkResponse({ description: 'Preferências do usuário atualizadas' })
  async updateSettings(
    @CurrentUser() userContext: CurrentUser,
    @Body() dto: UpdateUserSettingsDto,
  ) {
    const user = await this.usersService.updateSettings(userContext.id, dto);
    return { data: user };
  }
}
