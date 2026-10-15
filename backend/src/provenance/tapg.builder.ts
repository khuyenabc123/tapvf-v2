import { compareString } from 'src/utils/common';
import {
  CourseRequirement,
  CURRICULUM_POLICY,
  CurriculumPolicy,
  PASSING_GRADES,
} from './curriculum.policy';
import { TapgEdge, TapgGraph, TapgNode } from './tapg.types';
import { TapgEvent } from './tapg-event.types';

const DAY_MS = 24 * 60 * 60 * 1000;

const ACADEMIC_YEAR_MS = 365.25 * DAY_MS;

export type TapgPolicy = typeof CURRICULUM_POLICY;

function timeOf(event: TapgEvent): number {
  return event.occurredAt.getTime();
}

function isPassing(event: TapgEvent): boolean {
  return (
    event.type === 'COURSE_RESULT' &&
    (PASSING_GRADES as readonly string[]).includes(event.payload.grade)
  );
}

function passingResultsBefore(
  courseId: string,
  beforeTime: number,
  events: readonly TapgEvent[],
): Extract<TapgEvent, { type: 'COURSE_RESULT' }>[] {
  return events
    .filter(
      (event): event is Extract<TapgEvent, { type: 'COURSE_RESULT' }> =>
        event.type === 'COURSE_RESULT' &&
        event.payload.courseId === courseId &&
        isPassing(event) &&
        timeOf(event) < beforeTime,
    )
    .sort((a, b) => timeOf(a) - timeOf(b) || a.seq - b.seq);
}

function requirementCourses(requirement: CourseRequirement): readonly string[] {
  return typeof requirement === 'string' ? [requirement] : requirement.anyOf;
}

function satisfyingResult(
  requirement: CourseRequirement,
  beforeTime: number,
  events: readonly TapgEvent[],
): Extract<TapgEvent, { type: 'COURSE_RESULT' }> | undefined {
  for (const courseId of requirementCourses(requirement)) {
    const result = passingResultsBefore(courseId, beforeTime, events)[0];

    if (result) return result;
  }

  return undefined;
}

function createNode(event: TapgEvent): TapgNode {
  let label = '';

  switch (event.type) {
    case 'COURSE_RESULT': {
      label = `${event.type} · ${event.payload.courseId} · ${event.payload.grade}`;

      break;
    }

    case 'ENROLLMENT': {
      label = `${event.type} · ${event.payload.program}`;

      break;
    }

    case 'PROGRAM_STATUS': {
      label = `${event.type} · ${event.payload.status}`;

      break;
    }

    // CERTIFICATE_SUBMITTED & CREDENTIAL_REQUEST
    default: {
      label = `${event.type} · ${event.payload.kind}`;

      break;
    }
  }

  return {
    key: `e${event.seq}`,
    kind: 'EVENT',
    type: event.type,
    label,
    eventId: event.eventId,
    occurredAt: event.occurredAt.toISOString(),
  };
}

export function buildGraph(
  studentId: string,
  events: readonly TapgEvent[],
  policy: CurriculumPolicy = CURRICULUM_POLICY,
): TapgGraph {
  const sortedEvents = [...events].sort((a, b) => a.seq - b.seq);

  const nodes: TapgNode[] = sortedEvents.map(createNode);

  const edges: TapgEdge[] = [];

  const enrollment = sortedEvents.find((event) => event.type === 'ENROLLMENT');

  const enrollmentAt = enrollment ? timeOf(enrollment) : undefined;

  const rulesByCourse = new Map(
    policy.rules.map((rule) => [rule.course, rule]),
  );

  for (let i = 0; i < sortedEvents.length - 1; i++) {
    edges.push({
      from: `e${sortedEvents[i].seq}`,
      to: `e${sortedEvents[i + 1].seq}`,
      kind: 'TEMPORAL',
    });
  }

  for (const event of sortedEvents) {
    if (event.type !== 'COURSE_RESULT') continue;

    const currentTime = timeOf(event);

    const courseId = event.payload.courseId;

    const rule = rulesByCourse.get(courseId);

    const violations: string[] = [];

    if (rule?.requires) {
      for (const requirement of rule.requires) {
        const result = satisfyingResult(requirement, currentTime, sortedEvents);

        if (result) {
          edges.push({
            from: `e${result.seq}`,
            to: `e${event.seq}`,
            kind: 'PREREQUISITE',
          });
        } else if (typeof requirement === 'string') {
          violations.push(`requires ${requirement} (not passed before)`);
        } else {
          violations.push(
            `requires one of ${requirement.anyOf.join(', ')} (none passed)`,
          );
        }
      }
    }

    if (rule?.minYear !== undefined) {
      if (enrollmentAt === undefined) {
        violations.push(
          'requires an ENROLLMENT event to calculate academic year',
        );
      } else {
        const year =
          Math.floor((currentTime - enrollmentAt) / ACADEMIC_YEAR_MS) + 1;

        if (year < rule.minYear) {
          violations.push(
            `requires year ≥ ${rule.minYear}, year ${year} at ` +
              event.occurredAt.toISOString(),
          );
        }
      }
    }

    if (rule?.minCreditsEarned !== undefined) {
      const creditsBefore = sortedEvents.reduce((total, prior) => {
        if (
          prior.type !== 'COURSE_RESULT' ||
          !isPassing(prior) ||
          timeOf(prior) >= currentTime
        ) {
          return total;
        }

        return total + prior.payload.credits;
      }, 0);

      if (creditsBefore < rule.minCreditsEarned) {
        violations.push(
          `requires at least ${rule.minCreditsEarned} credits before this event; ` +
            `found ${creditsBefore}`,
        );
      }
    }

    const node = nodes.find((candidate) => candidate.key === `e${event.seq}`);

    if (node) {
      node.check = {
        eligible: violations.length === 0,
        violations,
      };
    }
  }

  nodes.sort((a, b) => compareString(a.key, b.key));

  edges.sort(
    (a, b) =>
      compareString(a.from, b.from) ||
      compareString(a.to, b.to) ||
      compareString(a.kind, b.kind),
  );

  return {
    studentId,
    policyVersion: policy.version,
    nodes,
    edges,
  };
}
