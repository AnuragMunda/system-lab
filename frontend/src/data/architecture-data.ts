// Mock/seed data for the architecture canvas: a small system topology (nodes +
// edges) and the styling map used to colour nodes/edges by health.
// Shapes: SystemNodeKind (node category) and SystemFlowNode (React Flow node with
// SystemNodeData: label, kind, health, rps, latencyMs, cpu, replicas).
// initialNodes / initialEdges are the seed graph; HEALTH_STYLES maps NodeHealth → tokens.
import type { Node, Edge } from "@xyflow/react";
import { HEALTH_STYLES, type Health } from "@/lib/health";

export type NodeHealth = Health;

// The category/kind of a system node, used to pick iconography and layout.
export type SystemNodeKind =
  | "gateway"
  | "service"
  | "cache"
  | "queue"
  | "database";

interface SystemNodeData extends Record<string, unknown> {
  label: string;
  kind: SystemNodeKind;
  health: NodeHealth;
  rps: number;
  latencyMs: number;
  cpu: number;
  replicas: number;
}

// A React Flow node carrying SystemNodeData, keyed by the custom "systemNode" type.
export type SystemFlowNode = Node<SystemNodeData, "systemNode">;

type SystemFlowEdge = Edge<{ health?: NodeHealth }, "flow">;

// HEALTH_STYLES ties each NodeHealth to the styling tokens used across the
// landing diagram: icon colour, metric value colour, health dot, node border,
// and the animated edge colour (edgeVar). Source of truth lives in @/lib/health.
export { HEALTH_STYLES };

// Seed graph nodes: a gateway → services → cache → queue/db topology with health/metrics.
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

// Seed graph edges connecting the initialNodes by source/target id.
export const initialEdges: SystemFlowEdge[] = [
  { id: "e-gw-auth", source: "gateway", target: "svc-auth" },
  { id: "e-gw-orders", source: "gateway", target: "svc-orders" },
  { id: "e-auth-cache", source: "svc-auth", target: "cache" },
  { id: "e-orders-cache", source: "svc-orders", target: "cache" },
  { id: "e-cache-queue", source: "cache", target: "queue" },
  { id: "e-cache-db", source: "cache", target: "database" },
];
