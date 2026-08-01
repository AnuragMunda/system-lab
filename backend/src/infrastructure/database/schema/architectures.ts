import {
  index,
  integer,
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

export const architecturesTable = pgTable(
  "architectures",
  {
    id: uuid().primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projectsTable.id, { onDelete: "cascade" }),
    name: varchar({ length: 150 }).notNull(),
    description: text("description"),
    graph: jsonb("graph").$type<ArchitectureGraph>().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("architectures_project_id_idx").on(table.projectId)],
);
