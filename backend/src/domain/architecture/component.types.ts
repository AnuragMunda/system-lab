/**
 * This file defines the types and interfaces related to architecture components in the system.
 */

export interface ArchitectureNode {
  id: string;
  type: componentType;
  name: string;
  position: {
    x: number;
    y: number;
  };
  config: ComponentConfig;
}

export type componentType =
  | "client"
  | "load_balancer"
  | "api"
  | "cache"
  | "database"
  | "queue"
  | "worker";

interface ComponentConfig {
  latencyMs?: number; // Average latency in milliseconds
  capacity?: number; // Maximum number of requests that can be processed simultaneously
  concurrency?: number; // Number of concurrent operations
  errorRate?: number; // Rate of errors occurring
}
