import { Body, Controller, Post, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { AuditInterceptor } from '../common/interceptors/audit.interceptor.js';
import { Request } from 'express';

class LoginDto {
  email!: string;
  password!: string;
}

class RefreshDto {
  refreshToken!: string;
}

@Controller('auth')
@UseInterceptors(AuditInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: LoginDto) {
    const { email, password } = body;
    const result = await this.authService.login(email, password);
    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        orgId: result.user.orgId
      }
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  async refresh(@Req() req: Request, @Body() body: RefreshDto) {
    const userId = (req.user as { id: string }).id;
    const { refreshToken } = body;
    return this.authService.refresh(userId, refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: Request, @Body() body: RefreshDto) {
    const userId = (req.user as { id: string }).id;
    const { refreshToken } = body;
    await this.authService.logout(userId, refreshToken);
    return { success: true };
  }
}
