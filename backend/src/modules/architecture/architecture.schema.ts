/**
 * @file architecture.schema.ts
 *
 * @description Zod schemas for the architecture module. Used by controllers to
 * validate request bodies, path params, and query strings before they reach
 * the service layer.
 */

import { z } from "zod";

/** The supported kinds of architecture components. */
const componentTypeSchema = z.enum([
  "client",
  "load_balancer",
  "api",
  "cache",
  "database",
  "queue",
  "worker",
]);

/** X/Y canvas coordinates for a node. */
const positionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

/** Optional runtime tuning for a component node. */
const componentConfig = z.object({
  latencyMs: z.number().nonnegative().optional(),
  capacity: z.number().positive().optional(),
  concurrency: z.number().nonnegative().optional(),
  errorRate: z.number().min(0).max(1).optional(),
});

/** Optional runtime tuning for a connection edge. */
const connectionConfig = z.object({
  latencyMs: z.number().nonnegative().optional(),
  bandwidthMbps: z.number().positive().optional(),
  packetLossRate: z.number().min(0).max(1).optional(),
});

/** A single node in the architecture graph. */
const nodeSchema = z.object({
  id: z.string(),
  type: componentTypeSchema,
  name: z.string().min(1),
  position: positionSchema,
  config: componentConfig,
});

/** A single directed edge in the architecture graph. */
const edgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  config: connectionConfig,
});

/** Validates the body for creating a new architecture. */
export const architectureSchema = z.object({
  projectId: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  nodes: z.array(nodeSchema),
  edges: z.array(edgeSchema),
});

/** Validates the `:id` path param as a UUID. */
export const idParamSchema = z.object({
  id: z.uuid(),
});

/** Validates query params for listing architectures (optional project filter + pagination). */
export const listArchitecturesQuerySchema = z.object({
  projectId: z.uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

/** Validates the body for updating an architecture. All fields optional; projectId is not updatable. */
export const updateArchitectureSchema = architectureSchema
  .omit({ projectId: true })
  .partial();
