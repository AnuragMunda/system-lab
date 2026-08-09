/**
 * @file architectures.ts
 *
 * @description Drizzle schema for the "architectures" table. An architecture
 * stores a project's software system graph (nodes and edges) as JSONB.
 */

import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { projectsTable } from "./projects.js";
import { ArchitectureGraph } from "./types/types.js";
import { NAME_LENGTH } from "@/config/constants/index.js";

/**
 * Architectures table. A (projectId, name) pair is unique; deleting a project
 * cascades to its architectures.
 */
export const architecturesTable = pgTable(
  "architectures",
  {
    id: uuid().primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projectsTable.id, { onDelete: "cascade" }),
    name: varchar({ length: NAME_LENGTH }).notNull(),
    description: text("description"),
    graph: jsonb("graph").$type<ArchitectureGraph>().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("architectures_project_id_idx").on(table.projectId),
    unique("architectures_project_id_name_unique").on(
      table.projectId,
      table.name,
    ),
  ],
);
