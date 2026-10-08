import {
  ConflictException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { Collection, MongoServerError } from 'mongodb';

import { DatabaseService } from '../db/database.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentDocument } from './students.types';

interface CounterDocument {
  name: string;
  seq: number;
}

@Injectable()
export class StudentsService implements OnModuleInit {
  private students!: Collection<StudentDocument>;
  private counters!: Collection<CounterDocument>;

  constructor(private readonly database: DatabaseService) {}

  async onModuleInit(): Promise<void> {
    this.students = this.database.collection<StudentDocument>('students');

    this.counters = this.database.collection<CounterDocument>('counters');

    await this.students.createIndex({ studentId: 1 }, { unique: true });

    await this.students.createIndex({
      lastName: 1,
      firstName: 1,
    });
  }

  private async nextStudentId(): Promise<number> {
    const result = await this.counters.findOneAndUpdate(
      { name: 'students' },
      { $inc: { seq: 1 } },
      {
        upsert: true,
        returnDocument: 'after',
      },
    );

    if (!result) {
      throw new Error('Failed to generate student id');
    }

    return result.seq;
  }

  async create(dto: CreateStudentDto): Promise<StudentDocument> {
    const student: StudentDocument = {
      id: await this.nextStudentId(),
      studentId: dto.studentId,
      firstName: dto.firstName,
      middleName: dto.middleName,
      lastName: dto.lastName,
      email: dto.email,
      phone: dto.phone,
      majors: dto.majors,
      createdAt: new Date(),
    };

    try {
      await this.students.insertOne(student);
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000) {
        throw new ConflictException(
          `Student ID "${dto.studentId}" already exists`,
        );
      }

      throw error;
    }

    return student;
  }

  async findAll(q?: string): Promise<StudentDocument[]> {
    const filter: Record<string, unknown> = {};

    if (q?.trim()) {
      const search = q.trim();

      filter.$or = [
        {
          studentId: {
            $regex: search,
            $options: 'i',
          },
        },
        {
          firstName: {
            $regex: search,
            $options: 'i',
          },
        },
        {
          middleName: {
            $regex: search,
            $options: 'i',
          },
        },
        {
          lastName: {
            $regex: search,
            $options: 'i',
          },
        },
      ];
    }

    return this.students.find(filter).sort({ id: 1 }).toArray();
  }

  async findOne(studentId: string): Promise<StudentDocument> {
    const student = await this.students.findOne({ studentId });

    if (!student) {
      throw new NotFoundException(
        `Student with studentId "${studentId}" not found`,
      );
    }

    return student;
  }

  async update(
    studentId: string,
    dto: UpdateStudentDto,
  ): Promise<StudentDocument> {
    const updateData: Partial<StudentDocument> = {
      ...dto,
      updatedAt: new Date(),
    };

    try {
      const result = await this.students.findOneAndUpdate(
        { studentId },
        { $set: updateData },
        {
          returnDocument: 'after',
        },
      );

      if (!result) {
        throw new NotFoundException(
          `Student with studentId "${studentId}" not found`,
        );
      }

      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof MongoServerError && error.code === 11000) {
        throw new ConflictException('Student ID already exists');
      }

      throw error;
    }
  }

  async remove(studentId: string): Promise<{ deleted: true }> {
    const result = await this.students.deleteOne({
      studentId,
    });

    if (result.deletedCount === 0) {
      throw new NotFoundException(
        `Student with studentId "${studentId}" not found`,
      );
    }

    return { deleted: true };
  }
}
