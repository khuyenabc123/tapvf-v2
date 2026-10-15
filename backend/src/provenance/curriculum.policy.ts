export interface CurriculumPolicy {
  version: string;
  rules: readonly CourseRule[];
}

export const PASSING_GRADES = [
  'A+',
  'A',
  'B+',
  'B',
  'C+',
  'C',
  'D+',
  'D',
] as const;

export type CourseRequirement = string | { anyOf: readonly string[] };

export interface CourseRule {
  course: string;
  requires?: readonly CourseRequirement[];
  minYear?: number;
  minCreditsEarned?: number;
}

/**
 * AND-outer / OR-inner only, no nested booleans — deliberate.
 *
 * Every entry in `requires` must be satisfied.
 * A string requires one specific course.
 * An `anyOf` entry requires at least one course in its list.
 * Nested boolean expressions are intentionally unsupported.
 *
 * Confirm every rule against the student's applicable curriculum cohort.
 */
export const CURRICULUM_POLICY = {
  version: 'dtu-v1',
  rules: [
    {
      course: 'CMU-CS 316',
      requires: ['CMU-CS 303'],
    },
    {
      course: 'CMU-CS 311',
      requires: ['CS 211'],
    },

    // Software engineering foundations
    {
      course: 'CMU-SE 214',
      minYear: 2,
    },
    {
      course: 'CMU-SE 303',
      requires: ['CMU-CS 303'],
    },
    {
      course: 'CMU-SE 403',
      requires: ['CMU-CS 311', 'CMU-SE 214'],
    },
    {
      course: 'CMU-SE 433',
      requires: ['CMU-IS 432'],
    },

    // Information systems and related courses
    {
      course: 'CMU-IS 432',
      minYear: 2,
    },
    {
      course: 'CMU-CS 462',
      requires: ['CMU-IS 432'],
    },
    {
      course: 'IS 301',
      requires: ['CS 101'],
    },
    {
      course: 'CMU-IS 401',
      requires: ['IS 301'],
    },
    {
      course: 'IS 384',
      requires: ['CS 211'],
    },

    // Elective and application courses
    {
      course: 'CMU-CS 445',
      requires: ['CS 211', 'CMU-CS 316'],
    },
    {
      course: 'CR 424',
      requires: ['CMU-CS 303'],
    },
    {
      course: 'CS 366',
      requires: ['CMU-CS 303', 'IS 301'],
    },
    {
      course: 'CS 414',
      requires: ['CMU-CS 303', 'IS 301'],
    },

    // Graduation project progression
    {
      course: 'CMU-CS 447',
      requires: ['CMU-CS 297'],
    },
    {
      course: 'CMU-SE 450',
      requires: [
        'CMU-SE 214',
        'CMU-IS 432',
        'CMU-CS 316',
        {
          anyOf: ['CMU-SE 303', 'CMU-CS 462'],
        },
      ],
    },
    {
      course: 'CMU-SE 451',
      requires: ['CMU-SE 450'],
    },
  ],
} as const satisfies CurriculumPolicy;
