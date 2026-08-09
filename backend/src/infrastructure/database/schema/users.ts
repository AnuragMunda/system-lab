/**
 * @file users.ts
 *
 * @description Drizzle schema for the "users" table, storing account
 * information for people who use the platform.
 */

import { EMAIL_LENGTH, NAME_LENGTH } from "@/config/constants/index.js";
import {
  boolean,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

/** User accounts table. Emails are unique and used for authentication. */
export const usersTable = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar({ length: NAME_LENGTH }).notNull(),
  email: varchar({ length: EMAIL_LENGTH }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  avatarUrl: text("avatar_url"),
  emailVerified: boolean("email_verified").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});
