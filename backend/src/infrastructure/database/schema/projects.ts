/**
 * @file projects.ts
 *
 * @description Drizzle schema for the "projects" table. Projects are the
 * top-level containers that own architectures.
 */

import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { usersTable } from "./users.js";

/** Who is allowed to see a project. */
export const projectVisibilityEnum = pgEnum("project_visibility", [
  "PRIVATE",
  "PUBLIC",
  "UNLISTED",
]);

/** Projects table. Each project belongs to a user and owns architectures. */
export const projectsTable = pgTable(
  "projects",
  {
    id: uuid().primaryKey().defaultRandom(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    name: varchar({ length: 150 }).notNull(),
    description: text("description"),
    visibility: projectVisibilityEnum("visibility")
      .notNull()
      .default("PRIVATE"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("projects_owner_id_idx").on(table.ownerId)],
);
