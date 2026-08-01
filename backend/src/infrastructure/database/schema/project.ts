import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { usersTable } from "./user.js";

export const projectVisibilityEnum = pgEnum("project_visibility", [
  "PRIVATE",
  "PUBLIC",
  "UNLISTED",
]);

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
