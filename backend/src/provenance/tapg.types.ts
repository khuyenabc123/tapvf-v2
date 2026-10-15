import type { TapgEvent } from './tapg-event.types';

export interface TapgNode {
  key: string;
  kind: 'EVENT';
  type: TapgEvent['type'];
  label: string;
  eventId: number;
  occurredAt: string;
  check?: {
    eligible: boolean;
    violations: string[];
  };
}

export interface TapgEdge {
  from: string;
  to: string;
  kind: 'TEMPORAL' | 'PREREQUISITE';
}

export interface TapgGraph {
  studentId: string;
  policyVersion: string;
  nodes: TapgNode[];
  edges: TapgEdge[];
}
