import type { TapgEvent } from './tapg-event.types';

interface RawAcademicEventDocument {
  seq: number;
  eventId: number;
  type: string;
  occurredAt: Date | string;
  payload: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function requireString(value: unknown, field: string, eventId: number): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`Event ${eventId}: invalid ${field}`);
  }

  return value;
}

function requireNumber(value: unknown, field: string, eventId: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`Event ${eventId}: invalid ${field}`);
  }
  
  return value;
}

export function toTapgEvents(
  docs: readonly RawAcademicEventDocument[],
): TapgEvent[] {
  return [...docs]
    .sort((a, b) => a.seq - b.seq)
    .map((doc): TapgEvent => {
      if (!Number.isInteger(doc.seq)) {
        throw new Error(`Invalid seq on event ${doc.eventId}`);
      }

      if (!Number.isInteger(doc.eventId)) {
        throw new Error(`Invalid eventId: ${doc.eventId}`);
      }

      const occurredAt = new Date(doc.occurredAt);
      if (Number.isNaN(occurredAt.getTime())) {
        throw new Error(`Invalid occurredAt on event ${doc.eventId}`);
      }

      if (!isRecord(doc.payload)) {
        throw new Error(`Event ${doc.eventId}: payload must be an object`);
      }

      const p = doc.payload;

      switch (doc.type) {
        case 'ENROLLMENT':
          return {
            seq: doc.seq,
            eventId: doc.eventId,
            occurredAt,
            type: 'ENROLLMENT',
            payload: {
              program: requireString(p.program, 'payload.program', doc.eventId),
            },
          };

        case 'COURSE_RESULT':
          return {
            seq: doc.seq,
            eventId: doc.eventId,
            occurredAt,
            type: 'COURSE_RESULT',
            payload: {
              courseId: requireString(
                p.courseId,
                'payload.courseId',
                doc.eventId,
              ),
              grade: requireString(p.grade, 'payload.grade', doc.eventId),
              credits: requireNumber(p.credits, 'payload.credits', doc.eventId),
            },
          };

        case 'CERTIFICATE_SUBMITTED':
          return {
            seq: doc.seq,
            eventId: doc.eventId,
            occurredAt,
            type: 'CERTIFICATE_SUBMITTED',
            payload: {
              kind: requireString(p.kind, 'payload.kind', doc.eventId),
              issuer: requireString(p.issuer, 'payload.issuer', doc.eventId),
              ...(typeof p.score === 'string' ? { score: p.score } : {}),
              ...(typeof p.validUntil === 'string'
                ? { validUntil: p.validUntil }
                : {}),
            },
          };

        case 'PROGRAM_STATUS':
          return {
            seq: doc.seq,
            eventId: doc.eventId,
            occurredAt,
            type: 'PROGRAM_STATUS',
            payload: {
              status: requireString(p.status, 'payload.status', doc.eventId),
            },
          };

        case 'CREDENTIAL_REQUEST':
          return {
            seq: doc.seq,
            eventId: doc.eventId,
            occurredAt,
            type: 'CREDENTIAL_REQUEST',
            payload: {
              kind: requireString(p.kind, 'payload.kind', doc.eventId),
            },
          };

        default:
          throw new Error(
            `Unsupported academic event type "${doc.type}" ` +
              `for event ${doc.eventId}`,
          );
      }
    });
}
