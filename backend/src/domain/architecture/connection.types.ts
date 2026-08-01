export interface ArchitectureEdge {
  id: string;

  source: string;
  target: string;

  config: ConnectionConfig;
}

interface ConnectionConfig {
  latencyMs: number;
  bandwidthMbps?: number;
  packetLossRate?: number;
}
