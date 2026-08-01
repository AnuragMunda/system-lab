import { jsonb, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { projectsTable } from "./project.js";

export const scenariosTable = pgTable("scenarios", {
  id: uuid().primaryKey().defaultRandom(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projectsTable.id),
  name: varchar({ length: 150 }).notNull(),
  events: jsonb("events").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
