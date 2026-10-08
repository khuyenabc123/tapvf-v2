import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service';
import { DatabaseService } from './db/database.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly db: DatabaseService,
  ) {}

  @Get('health')
  async getHealth(): Promise<object> {
    return {
      status: 'ok',
      service: 'tapvf',
      node: process.version,
      db: (await this.db.ping()) ? 'up' : 'down',
      checkAt: new Date().toISOString(),
    };
  }
}
