import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';

import { Roles } from '../auth/roles.decorator';
import { CreateAcademicEventDto } from './dto/create-academic-event.dto';
import { AcademicEventsService } from './academic-events.service';

@Controller('academic-events')
export class AcademicEventsController {
  constructor(private readonly academicEventsService: AcademicEventsService) {}

  @Roles('ADMIN', 'TEACHER')
  @Post()
  create(@Body() dto: CreateAcademicEventDto, @Req() request: Request) {
    return this.academicEventsService.create(
      dto.studentId,
      dto,
      request.user!.username,
    );
  }

  @Roles('ADMIN', 'TEACHER', 'PRESIDENT')
  @Get('student/:studentId')
  findByStudent(@Param('studentId') studentId: string) {
    return this.academicEventsService.findByStudent(studentId);
  }

  @Roles('ADMIN', 'TEACHER', 'PRESIDENT')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.academicEventsService.findOne(id);
  }
}
