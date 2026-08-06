/**
 * @file component.types.ts
 * 
 * @description This file defines the types and interfaces related to architecture components in the system.
 */

/**
 * A node in an architecture graph. Each node represents one deployable
 * component (e.g. an API gateway, cache, database) and its configuration.
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

/** The supported kinds of architecture components. */
export type componentType =
  | "client"
  | "load_balancer"
  | "api"
  | "cache"
  | "database"
  | "queue"
  | "worker";

/** Runtime tuning knobs for a component, used during simulation. All fields are optional. */
interface ComponentConfig {
  latencyMs?: number; // Average latency in milliseconds
  capacity?: number; // Maximum number of requests that can be processed simultaneously
  concurrency?: number; // Number of concurrent operations
  errorRate?: number; // Rate of errors occurring
}
