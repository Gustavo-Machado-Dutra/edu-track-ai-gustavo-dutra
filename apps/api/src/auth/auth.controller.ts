import { Body, Controller, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiCreatedResponse({ description: 'Usuário registrado' })
  async register(@Body() dto: RegisterDto) {
    const session = await this.authService.register(dto);
    return { data: session };
  }

  @Post('login')
  @ApiOkResponse({ description: 'Sessão criada' })
  async login(@Body() dto: LoginDto) {
    const session = await this.authService.login(dto);
    return { data: session };
  }

  @Post('refresh')
  @ApiOkResponse({ description: 'Access token renovado' })
  async refresh(@Body() dto: RefreshTokenDto) {
    const session = await this.authService.refresh(dto.refreshToken);
    return { data: session };
  }
}
