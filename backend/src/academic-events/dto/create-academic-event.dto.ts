import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsObject,
  IsString,
} from 'class-validator';

export class CreateAcademicEventDto {
  @IsString()
  @IsNotEmpty()
  studentId!: string;

  @IsIn(['ENROLLMENT', 'COURSE_RESULT', 'PROGRAM_STATUS', 'CREDENTIAL_REQUEST'])
  type!:
    'ENROLLMENT' | 'COURSE_RESULT' | 'PROGRAM_STATUS' | 'CREDENTIAL_REQUEST';

  @IsString()
  @IsNotEmpty()
  term!: string;

  @IsDateString()
  occurredAt!: string;

  @IsObject()
  payload!: Record<string, unknown>;
}
