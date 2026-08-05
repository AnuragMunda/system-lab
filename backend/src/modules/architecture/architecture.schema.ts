import { z } from "zod";

const componentTypeSchema = z.enum([
  "client",
  "load_balancer",
  "api",
  "cache",
  "database",
  "queue",
  "worker",
]);

const positionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

const componentConfig = z.object({
  latencyMs: z.number().nonnegative().optional(),
  capacity: z.number().positive().optional(),
  concurrency: z.number().nonnegative().optional(),
  errorRate: z.number().min(0).max(1).optional(),
});

const connectionConfig = z.object({
  latencyMs: z.number().nonnegative().optional(),
  bandwidthMbps: z.number().positive().optional(),
  packetLossRate: z.number().min(0).max(1).optional(),
});

const nodeSchema = z.object({
  id: z.string(),
  type: componentTypeSchema,
  name: z.string().min(1),
  position: positionSchema,
  config: componentConfig,
});

const edgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  config: connectionConfig,
});

export const architectureSchema = z.object({
  projectId: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  nodes: z.array(nodeSchema),
  edges: z.array(edgeSchema),
});

export const idParamSchema = z.object({
  id: z.uuid(),
});

export const updateArchitectureSchema = architectureSchema
  .omit({ projectId: true })
  .partial();
