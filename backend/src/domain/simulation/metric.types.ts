export interface SimulationMetric {
  id: string;
  simulationId: string;
  timestampMs: number;

  nodeId?: string;

  requestsPerSecond?: number;
  latencyMs?: number;
  errorRate?: number;
  queueDepth?: number;
  cacheHitRate?: number;
  activeConnections?: number;
}
