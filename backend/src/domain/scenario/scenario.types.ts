/**
 * @file scenario.types.ts
 *
 * @description Domain types describing a scenario: a test plan that runs a
 * sequence of events (traffic spikes, failures, etc.) against an architecture
 * during a simulation to observe how the system behaves under load.
 */

/** The kinds of disruptions a scenario event can inject. */
export type ScenarioEventType =
  | "traffic_spike"
  | "service_failure"
  | "service_recovery"
  | "network_latency"
  | "packet_loss";

/** A single scheduled disruption within a scenario, fired at a given time. */
export interface ScenarioEvent {
  id: string;
  timestampMs: number; // Time in milliseconds since the start of the scenario
  type: ScenarioEventType;
  targetNodeId?: string;
  payload?: Record<string, unknown>;
}

/**
 * A scenario ties a set of events to a specific architecture so that the same
 * architecture can be stress-tested under different synthetic conditions.
 */
export interface Scenario {
  id: string;
  architectureId: string;

  name: string;

  events: ScenarioEvent[];
}
