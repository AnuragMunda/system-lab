import { ArchitectureNode } from "../../../../domain/architecture/component.types.js";
import { ArchitectureEdge } from "../../../../domain/architecture/connection.types.js";

export interface ArchitectureGraph {
  // Nodes and edges of the architecture graph.
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
}

export interface SimulationConfig {
  // Total simulation duration.
  durationSeconds: number;

  // Initial requests generated per second.
  requestsPerSecond: number;

  /**
   * Simulation playback speed.
   * 1 = real-time
   * 2 = 2x
   * 5 = 5x
   */
  simulationSpeed: number;

  // Random seed for deterministic simulations.
  // Same architecture + config + seed => same result.
  randomSeed?: number;

  // Maximum number of events processed in one simulation tick.
  // Prevents runaway simulations.
  maxEventsPerTick?: number;

  // Whether metrics should be collected.
  collectMetrics: boolean;

  // Emit simulation events for replay and visualization.
  emitEvents: boolean;
}

//------------- Scenario Events -------------//

export type ScenarioEvent =
  | TrafficSpikeEvent
  | ServiceFailureEvent
  | ServiceRecoveryEvent
  | NetworkLatencyEvent
  | PacketLossEvent;

interface BaseScenarioEvent {
  id: string;

  /**
   * Time (in ms) after simulation start
   * when this event should execute.
   */
  timestampMs: number;
}

export interface TrafficSpikeEvent extends BaseScenarioEvent {
  type: "traffic_spike";
  requestsPerSecond: number;
}

export interface ServiceFailureEvent extends BaseScenarioEvent {
  type: "service_failure";
  targetNodeId: string;
}

export interface ServiceRecoveryEvent extends BaseScenarioEvent {
  type: "service_recovery";
  targetNodeId: string;
}

export interface NetworkLatencyEvent extends BaseScenarioEvent {
  type: "network_latency";
  targetEdgeId: string;
  latencyMs: number;
}

export interface PacketLossEvent extends BaseScenarioEvent {
  type: "packet_loss";
  targetEdgeId: string;
  packetLossRate: number;
}
