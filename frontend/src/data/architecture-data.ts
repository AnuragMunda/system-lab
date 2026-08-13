import type { Node, Edge } from "@xyflow/react";

export type NodeHealth = "healthy" | "degraded" | "critical";

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

export type SystemFlowEdge = Edge<{ health?: NodeHealth }, "flow">;

export const HEALTH_STYLES: Record<
  NodeHealth,
  { icon: string; value: string; dot: string; border: string; edgeVar: string }
> = {
  healthy: {
    icon: "text-success",
    value: "text-success",
    dot: "bg-success",
    border: "border-success/40",
    edgeVar: "var(--color-success)",
  },
  degraded: {
    icon: "text-accent",
    value: "text-accent",
    dot: "bg-accent",
    border: "border-accent/40",
    edgeVar: "var(--color-accent)",
  },
  critical: {
    icon: "text-danger",
    value: "text-danger",
    dot: "bg-danger",
    border: "border-danger/40",
    edgeVar: "var(--color-danger)",
  },
};

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
      latencyMs: 98,
      cpu: 84,
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
      health: "critical",
      rps: 1520,
      latencyMs: 460,
      cpu: 95,
      replicas: 3,
    },
  },
];

export const initialEdges: SystemFlowEdge[] = [
  { id: "e-gw-auth", source: "gateway", target: "svc-auth" },
  { id: "e-gw-orders", source: "gateway", target: "svc-orders" },
  { id: "e-auth-cache", source: "svc-auth", target: "cache" },
  { id: "e-orders-cache", source: "svc-orders", target: "cache" },
  { id: "e-cache-queue", source: "cache", target: "queue" },
  { id: "e-cache-db", source: "cache", target: "database" },
];
