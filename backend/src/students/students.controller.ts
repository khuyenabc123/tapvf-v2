import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { Roles } from '../auth/roles.decorator';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentsService } from './students.service';

@Roles('ADMIN', 'TEACHER', 'PRESIDENT')
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  findAll(@Query('q') q?: string) {
    return this.studentsService.findAll(q);
  }

  @Get(':studentId')
  findOne(@Param('studentId') studentId: string) {
    return this.studentsService.findOne(studentId);
  }

  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateStudentDto) {
    return this.studentsService.create(dto);
  }

  @Roles('ADMIN')
  @Patch(':studentId')
  update(@Param('studentId') studentId: string, @Body() dto: UpdateStudentDto) {
    return this.studentsService.update(studentId, dto);
  }

  @Roles('ADMIN')
  @Delete(':studentId')
  remove(@Param('studentId') studentId: string) {
    return this.studentsService.remove(studentId);
  }
}
