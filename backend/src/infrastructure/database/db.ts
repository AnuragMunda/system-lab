/**
 * @file db.ts
 *
 * @description Creates the shared PostgreSQL connection used by all repositories,
 * backed by Drizzle ORM. The single `db` instance is imported across the codebase.
 */

import { drizzle } from "drizzle-orm/node-postgres";
import { env } from "@/config/env.js";

const db = drizzle(env.DATABASE_URL);

export default db;