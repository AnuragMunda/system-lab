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

export const projectVisibilityEnum = pgEnum("project_visibility", [
  "PRIVATE",
  "PUBLIC",
  "UNLISTED",
]);

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
