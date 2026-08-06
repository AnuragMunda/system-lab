/**
 * @file simulations.ts
 *
 * @description Drizzle schemas for the "simulations", "simulation_events", and
 * "metrics" tables. Simulations track a run against an architecture, while
 * events and metrics capture what happened during the run.
 */

import {
  bigserial,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  real,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { architecturesTable } from "./architectures.js";
import { ArchitectureGraph, SimulationConfig } from "./types/types.js";

/** The lifecycle states a simulation can be in, stored in the database. */
export const simulationStatusEnum = pgEnum("simulation_status", [
  "PENDING",
  "RUNNING",
  "PAUSED",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
]);

/** Simulations table. A simulation belongs to an architecture and records config + status. */
export const simulationsTable = pgTable(
  "simulations",
  {
    id: uuid().primaryKey().defaultRandom(),
    architectureId: uuid("architecture_id")
      .notNull()
      .references(() => architecturesTable.id, { onDelete: "cascade" }),
    status: simulationStatusEnum("status").notNull().default("PENDING"),
    config: jsonb("config").$type<SimulationConfig>(),
    snapshot: jsonb("snapshot").$type<ArchitectureGraph>(),
    startedAt: timestamp("started_at"),
    completedAt: timestamp("completed_at"),
  },
  (table) => [
    index("simulations_architecture_id_idx").on(table.architectureId),
  ],
);

/** Events emitted during a simulation, stored for replay and visualization. */
export const simulationEventsTable = pgTable(
  "simulation_events",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    simulationId: uuid("simulation_id")
      .notNull()
      .references(() => simulationsTable.id, { onDelete: "cascade" }),
    timestampMs: integer("timestamp_ms").notNull(),
    eventType: varchar("event_type").notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
  },
  (table) => [
    index("simulation_events_simulation_timestamp_idx").on(
      table.simulationId,
      table.timestampMs,
    ),
  ],
);

/** Performance metrics sampled during a simulation, indexed by time. */
export const metricsTable = pgTable(
  "metrics",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    simulationId: uuid("simulation_id")
      .notNull()
      .references(() => simulationsTable.id, { onDelete: "cascade" }),
    timestampMs: integer("timestamp_ms").notNull(),
    requestsPerSec: real("requests_per_sec").notNull(),
    avgLatencyMs: real("avg_latency_ms").notNull(),
    errorRate: real("error_rate").notNull(),
    queueDepth: integer("queue_depth").notNull(),
    cacheHitRate: real("cache_hit_rate").notNull(),
  },
  (table) => [
    index("metrics_simulation_timestamp_idx").on(
      table.simulationId,
      table.timestampMs,
    ),
  ],
);
