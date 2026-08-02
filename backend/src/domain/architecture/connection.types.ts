/**
 * This file defines the types and interfaces related to architecture connections in the system.
 */

export interface ArchitectureEdge {
  id: string;

  source: string;
  target: string;

  config: ConnectionConfig;
}

interface ConnectionConfig {
  latencyMs: number; // Average latency in milliseconds
  bandwidthMbps?: number; // Maximum bandwidth in megabits per second
  packetLossRate?: number; // Rate of packet loss occurring
}
