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
  latencyMs?: number;
  capacity?: number;
  concurrency?: number;
  errorRate?: number;
}
