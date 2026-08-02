/**
 * This file defines the types and interfaces related to scenarios in the system.
 */

export type ScenarioEventType =
  | "traffic_spike"
  | "service_failure"
  | "service_recovery"
  | "network_latency"
  | "packet_loss";

export interface ScenarioEvent {
  id: string;
  timestampMs: number; // Time in milliseconds since the start of the scenario
  type: ScenarioEventType;
  targetNodeId?: string;
  payload?: Record<string, unknown>;
}

export interface Scenario {
  id: string;
  architectureId: string;

  name: string;

  events: ScenarioEvent[];
}
