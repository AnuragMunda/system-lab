import {
  bigserial,
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const projectVisibilityEnum = pgEnum("project_visibility", [
  "PRIVATE",
  "PUBLIC",
  "UNLISTED",
]);

export const simulationStatusEnum = pgEnum("simulation_status", [
  "QUEUED",
  "RUNNING",
  "COMPLETED",
  "FAILED",
  "STOPPED",
]);

export const usersTable = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar({ length: 100 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password_hash: text("password_hash").notNull(),
  avatar_url: text("avatar_url"),
  emailVerified: boolean("email_verified").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const sessionsTable = pgTable("sessions", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id),
  refreshTokenHash: text("refresh_token_hash").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  revokedAt: timestamp("revoked_at"),
});

export const projectsTable = pgTable("projects", {
  id: uuid().primaryKey().defaultRandom(),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => usersTable.id),
  name: varchar({ length: 150 }).notNull(),
  description: text("description"),
  visibility: projectVisibilityEnum("visibility").notNull().default("PRIVATE"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const architecturesTable = pgTable("architectures", {
  id: uuid().primaryKey().defaultRandom(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projectsTable.id),
  name: varchar({ length: 150 }).notNull(),
  graph: jsonb("graph").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const architectureVersionsTable = pgTable("architecture_versions", {
  id: uuid().primaryKey().defaultRandom(),
  architectureId: uuid("architecture_id")
    .notNull()
    .references(() => architecturesTable.id),
  version: integer("version").notNull(),
  graph: jsonb("graph").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const simulationsTable = pgTable("simulations", {
  id: uuid().primaryKey().defaultRandom(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projectsTable.id),
  architectureId: uuid("architecture_id")
    .notNull()
    .references(() => architecturesTable.id),
  status: simulationStatusEnum("status").notNull().default("QUEUED"),
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

export const scenariosTable = pgTable("scenarios", {
  id: uuid().primaryKey().defaultRandom(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projectsTable.id),
  name: varchar({ length: 150 }).notNull(),
  events: jsonb("events").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
