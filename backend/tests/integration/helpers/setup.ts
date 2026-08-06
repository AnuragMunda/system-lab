/**
 * @file setup.ts
 *
 * @description Vitest global setup for integration tests. Detects whether
 * PostgreSQL is available, provisions the test database, applies schema, and
 * signals test files to skip when the database is unreachable.
 */

import {
  applyMigrations,
  applySchema,
  ensureTestDatabase,
  getOriginalDatabaseUrl,
  getTestDatabaseUrl,
  isDbAvailable,
} from "./db.js";

const testUrl = getTestDatabaseUrl();

if (!(await isDbAvailable(getOriginalDatabaseUrl()))) {
  if (process.env.CI) {
    throw new Error(
      `[integration] PostgreSQL is required in CI but is not reachable at "${getOriginalDatabaseUrl()}". ` +
        "Integration tests would be silently skipped otherwise.",
    );
  }

  process.env.TEST_DB_UNAVAILABLE = "1";
  console.warn(
    `\n[integration] PostgreSQL is not reachable at "${getOriginalDatabaseUrl()}".\n` +
      "Integration tests will be SKIPPED.\n" +
      "Start the database first, e.g. `docker compose up -d postgres` (or run a local Postgres),\n" +
      "then re-run `pnpm test:integration`.\n",
  );
} else {
  await ensureTestDatabase();

  try {
    applyMigrations(testUrl);
  } catch (error) {
    console.warn(
      "[integration] drizzle-kit migrate failed, applying schema via push...",
    );
    console.warn(error);
    applySchema(testUrl);
  }

  process.env.DATABASE_URL = testUrl;
}
