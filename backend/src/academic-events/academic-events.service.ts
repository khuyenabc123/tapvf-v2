import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { Collection, MongoServerError } from 'mongodb';
import { AcademicEventDocument } from './academic-event.types';
import { CreateAcademicEventDto } from './dto/create-academic-event.dto';
import { DatabaseService } from 'src/db/database.service';

interface CounterDocument {
  name: string;
  seq: number;
}

@Injectable()
export class AcademicEventsService implements OnModuleInit {
  private academicEvents!: Collection<AcademicEventDocument>;

  private counters!: Collection<CounterDocument>;

  constructor(private readonly database: DatabaseService) {}

  async onModuleInit(): Promise<void> {
    this.academicEvents =
      this.database.collection<AcademicEventDocument>('academic_events');

    this.counters = this.database.collection<CounterDocument>('counters');

    await this.academicEvents.createIndex(
      { studentId: 1, seq: 1 },
      { unique: true },
    );

    await this.academicEvents.createIndex({
      studentId: 1,
      occurredAt: 1,
    });
  }

  private async nextEventId(): Promise<number> {
    const result = await this.counters.findOneAndUpdate(
      { name: 'academic_events' },
      { $inc: { seq: 1 } },
      {
        upsert: true,
        returnDocument: 'after',
      },
    );

    if (!result) {
      throw new Error('Failed to generate academic event id');
    }

    return result.seq;
  }

  private async nextSeq(studentId: string): Promise<number> {
    const count = await this.academicEvents.countDocuments({
      studentId,
    });

    return count + 1;
  }

  async create(
    studentId: string,
    dto: CreateAcademicEventDto,
    recordedBy: string,
  ): Promise<AcademicEventDocument> {
    let seq = await this.nextSeq(studentId);

    for (let attempt = 0; attempt < 2; attempt++) {
      const event: AcademicEventDocument = {
        id: await this.nextEventId(),
        studentId,
        seq,
        type: dto.type,
        term: dto.term,
        occurredAt: new Date(dto.occurredAt),
        recordedAt: new Date(),
        recordedBy,
        payload: dto.payload,
      };

      try {
        await this.academicEvents.insertOne(event);
        return event;
      } catch (error) {
        if (error instanceof MongoServerError && error.code === 11000) {
          if (attempt === 0) {
            seq = await this.nextSeq(studentId);
            continue;
          }
        }

        throw error;
      }
    }

    throw new Error('Failed to create academic event');
  }

  async findByStudent(studentId: string): Promise<AcademicEventDocument[]> {
    return this.academicEvents.find({ studentId }).sort({ seq: 1 }).toArray();
  }

  async findOne(id: number): Promise<AcademicEventDocument> {
    const event = await this.academicEvents.findOne({ id });

    if (!event) {
      throw new NotFoundException(`Academic event with id "${id}" not found`);
    }

    return event;
  }
}
