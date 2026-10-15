export type TapgEvent = {
  seq: number;
  eventId: number;
  occurredAt: Date;
} & (
  | {
      type: 'ENROLLMENT';
      payload: { program: string };
    }
  | {
      type: 'COURSE_RESULT';
      payload: {
        courseId: string;
        grade: string;
        credits: number;
      };
    }
  | {
      type: 'CERTIFICATE_SUBMITTED';
      payload: {
        kind: string;
        score?: string;
        issuer: string;
        validUntil?: string;
      };
    }
  | {
      type: 'PROGRAM_STATUS';
      payload: { status: string };
    }
  | {
      type: 'CREDENTIAL_REQUEST';
      payload: { kind: string };
    }
);
