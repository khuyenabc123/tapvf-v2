import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  getHello(): object {
    return {
      status: 'ok',
      service: 'tapvf',
      node: process.version,
      checkAt: new Date().toISOString(),
    };
  }
}
