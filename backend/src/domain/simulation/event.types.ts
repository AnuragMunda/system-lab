/**
 * This file defines the types and interfaces related to simulation events in the system.
 */

export type SimulationEventType =
  | "request.created"
  | "request.routed"
  | "request.completed"
  | "request.failed"
  | "cache.hit"
  | "cache.miss"
  | "database.request"
  | "queue.enqueue"
  | "queue.dequeue"
  | "worker.started"
  | "worker.completed"
  | "component.failed"
  | "component.recovered";

export interface SimulationEvent {
  id: string;
  simulationId: string;

  timestampMs: number;

  type: SimulationEventType;

  sourceNodeId?: string;
  targetNodeId?: string;

  payload?: Record<string, unknown>; // Additional data related to the event
}
