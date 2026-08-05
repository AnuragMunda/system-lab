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
