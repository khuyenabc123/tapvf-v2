import { Module } from '@nestjs/common';

import { DatabaseModule } from '../db/database.module';
import { AcademicEventsController } from './academic-events.controller';
import { AcademicEventsService } from './academic-events.service';

@Module({
  imports: [DatabaseModule],
  controllers: [AcademicEventsController],
  providers: [AcademicEventsService],
})
export class AcademicEventsModule {}
