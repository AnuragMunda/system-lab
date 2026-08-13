import type { Node, Edge } from "@xyflow/react";

export type NodeHealth = "healthy" | "degraded";

export type SystemNodeKind =
  | "gateway"
  | "service"
  | "cache"
  | "queue"
  | "database";

export interface SystemNodeData extends Record<string, unknown> {
  label: string;
  kind: SystemNodeKind;
  health: NodeHealth;
  rps: number;
  latencyMs: number;
  cpu: number;
  replicas: number;
}

export type SystemFlowNode = Node<SystemNodeData, "systemNode">;

export const initialNodes: SystemFlowNode[] = [
  {
    id: "gateway",
    type: "systemNode",
    position: { x: 0, y: 160 },
    data: {
      label: "API Gateway",
      kind: "gateway",
      health: "healthy",
      rps: 4820,
      latencyMs: 8,
      cpu: 34,
      replicas: 3,
    },
  },
  {
    id: "svc-auth",
    type: "systemNode",
    position: { x: 260, y: 40 },
    data: {
      label: "Auth Service",
      kind: "service",
      health: "healthy",
      rps: 2110,
      latencyMs: 22,
      cpu: 41,
      replicas: 4,
    },
  },
  {
    id: "svc-orders",
    type: "systemNode",
    position: { x: 260, y: 280 },
    data: {
      label: "Orders Service",
      kind: "service",
      health: "degraded",
      rps: 1740,
      latencyMs: 96,
      cpu: 78,
      replicas: 6,
    },
  },
  {
    id: "cache",
    type: "systemNode",
    position: { x: 540, y: 160 },
    data: {
      label: "Redis Cache",
      kind: "cache",
      health: "healthy",
      rps: 6200,
      latencyMs: 2,
      cpu: 19,
      replicas: 3,
    },
  },
  {
    id: "queue",
    type: "systemNode",
    position: { x: 800, y: 40 },
    data: {
      label: "Event Queue",
      kind: "queue",
      health: "healthy",
      rps: 980,
      latencyMs: 4,
      cpu: 27,
      replicas: 2,
    },
  },
  {
    id: "database",
    type: "systemNode",
    position: { x: 800, y: 280 },
    data: {
      label: "Primary DB",
      kind: "database",
      health: "healthy",
      rps: 1520,
      latencyMs: 12,
      cpu: 52,
      replicas: 3,
    },
  },
];

export const initialEdges: Edge[] = [
  { id: "e-gw-auth", source: "gateway", target: "svc-auth" },
  { id: "e-gw-orders", source: "gateway", target: "svc-orders" },
  { id: "e-auth-cache", source: "svc-auth", target: "cache" },
  { id: "e-orders-cache", source: "svc-orders", target: "cache" },
  { id: "e-cache-queue", source: "cache", target: "queue" },
  { id: "e-cache-db", source: "cache", target: "database" },
];
