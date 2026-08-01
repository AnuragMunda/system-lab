export type ScenarioEventType =
  | "traffic_spike"
  | "service_failure"
  | "service_recovery"
  | "network_latency"
  | "packet_loss";

export interface ScenarioEvent {
  id: string;
  timestampMs: number;
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
