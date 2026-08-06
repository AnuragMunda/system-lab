/**
 * @file metric.types.ts
 *
 * @description Domain types describing the performance metrics collected at a
 * point in time while a simulation is running. Metrics can be aggregated
 * globally or broken down per node.
 */

/** A snapshot of performance measurements at a given simulation timestamp. */
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
