/**
 * This file defines the database schema for the "scenarios" table.
 * The table stores information about different scenarios associated with architectures.
 */

import {
  jsonb,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { ScenarioEvent } from "./types/types.js";
import { architecturesTable } from "./architectures.js";

export const scenariosTable = pgTable("scenarios", {
  id: uuid().primaryKey().defaultRandom(),
  architectureId: uuid("architecture_id")
    .notNull()
    .references(() => architecturesTable.id, { onDelete: "cascade" }),
  name: varchar({ length: 150 }).notNull(),
  events: jsonb("events").$type<ScenarioEvent[]>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});
