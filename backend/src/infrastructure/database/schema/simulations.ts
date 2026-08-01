import {
  bigserial,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  real,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { projectsTable } from "./project.js";
import { architecturesTable } from "./architecture.js";

export const simulationStatusEnum = pgEnum("simulation_status", [
  "PENDING",
  "RUNNING",
  "PAUSED",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
]);

export const simulationsTable = pgTable("simulations", {
  id: uuid().primaryKey().defaultRandom(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projectsTable.id),
  architectureId: uuid("architecture_id")
    .notNull()
    .references(() => architecturesTable.id),
  status: simulationStatusEnum("status").notNull().default("PENDING"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  durationMs: integer("duration_ms"),
  config: jsonb("config"),
  snapshot: jsonb("snapshot"),
});

export const simulationEventsTable = pgTable("simulation_events", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  simulationId: uuid("simulation_id")
    .notNull()
    .references(() => simulationsTable.id),
  timestampMs: integer("timestamp_ms").notNull(),
  eventType: varchar("event_type").notNull(),
  payload: jsonb("payload").notNull(),
});

export const metricsTable = pgTable("metrics", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  simulationId: uuid("simulation_id")
    .notNull()
    .references(() => simulationsTable.id),
  requestsPerSec: integer("requests_per_sec").notNull(),
  avgLatencyMs: real("avg_latency_ms").notNull(),
  errorRate: real("error_rate").notNull(),
  queueDepth: integer("queue_depth").notNull(),
  cacheHitRate: real("cache_hit_rate").notNull(),
});
