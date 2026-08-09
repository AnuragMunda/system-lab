/**
 * @file scenarios.ts
 *
 * @description Drizzle schema for the "scenarios" table. A scenario holds a
 * list of events that are replayed against an architecture during a simulation.
 */

import { jsonb, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { ScenarioEvent } from "./types/types.js";
import { architecturesTable } from "./architectures.js";
import { NAME_LENGTH } from "@/config/constants/index.js";

/** Scenarios table. Deleting an architecture cascades to its scenarios. */
export const scenariosTable = pgTable("scenarios", {
  id: uuid().primaryKey().defaultRandom(),
  architectureId: uuid("architecture_id")
    .notNull()
    .references(() => architecturesTable.id, { onDelete: "cascade" }),
  name: varchar({ length: NAME_LENGTH }).notNull(),
  events: jsonb("events").$type<ScenarioEvent[]>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});
