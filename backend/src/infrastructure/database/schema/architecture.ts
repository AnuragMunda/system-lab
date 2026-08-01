import {
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { projectsTable } from "./project.js";

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
