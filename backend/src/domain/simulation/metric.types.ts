/**
 * This file defines the types and interfaces related to simulation metrics in the system.
 */

export interface SimulationMetric {
  id: string;
  simulationId: string;
  timestampMs: number; // Time in milliseconds since the start of the simulation

  nodeId?: string;

  requestsPerSecond?: number;
  latencyMs?: number; // Average latency in milliseconds
  errorRate?: number;
  queueDepth?: number; // Number of requests waiting in the queue
  cacheHitRate?: number; // Ratio of cache hits to total cache requests
  activeConnections?: number;
}
