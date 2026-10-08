export type AcademicEventType =
  'ENROLLMENT' | 'COURSE_RESULT' | 'PROGRAM_STATUS' | 'CREDENTIAL_REQUEST';

export interface CourseResultPayload {
  courseId: string;
  grade: number;
  credits: number;
}

export type AcademicEventPayload =
  CourseResultPayload | Record<string, unknown>;

export interface AcademicEventDocument {
  id: number;
  studentId: string;
  seq: number;
  type: AcademicEventType;
  term: string;
  occurredAt: Date;
  recordedAt: Date;
  recordedBy: string;
  payload: AcademicEventPayload;
}
