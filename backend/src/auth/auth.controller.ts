import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import type { Request } from 'express';

import { AuthService } from './auth.service';
import { Public } from './auth.decorators';
import { LoginDto } from './dto/login.dto';
import { Roles } from './roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.username, loginDto.password);
  }

  @Roles('ADMIN')
  @Get('admin-probe')
  adminProbe(@Req() request: Request) {
    return {
      ok: true,
      who: request.user,
    };
  }
}
