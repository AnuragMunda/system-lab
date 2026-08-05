import "dotenv/config";
import { execSync } from "node:child_process";
import { Pool } from "pg";

const TEST_DB_NAME = "systemlab_test";

export function getOriginalDatabaseUrl(): string {
  const url = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL (or TEST_DATABASE_URL) must be set for integration tests.",
    );
  }
  return url;
}

export function getTestDatabaseUrl(): string {
  const url = process.env.TEST_DATABASE_URL;
  if (url) {
    return url;
  }

  const parsed = new URL(process.env.DATABASE_URL!);
  const segments = parsed.pathname.split("/");
  segments[segments.length - 1] = TEST_DB_NAME;
  parsed.pathname = segments.join("/");
  return parsed.toString();
}

export async function isDbAvailable(url: string): Promise<boolean> {
  const pool = new Pool({ connectionString: url, connectionTimeoutMillis: 2000 });
  try {
    await pool.query("SELECT 1");
    return true;
  } catch {
    return false;
  } finally {
    await pool.end();
  }
}

export async function ensureTestDatabase(): Promise<void> {
  const pool = new Pool({ connectionString: getOriginalDatabaseUrl() });
  const client = await pool.connect();

  try {
    const result = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [
      TEST_DB_NAME,
    ]);

    if (result.rowCount === 0) {
      await client.query(`CREATE DATABASE ${TEST_DB_NAME}`);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

export function applyMigrations(testUrl: string): void {
  execSync("pnpm exec drizzle-kit migrate", {
    cwd: process.cwd(),
    env: {
      ...process.env,
      DATABASE_URL: testUrl,
    },
    stdio: "pipe",
  });
}

export function applySchema(testUrl: string): void {
  execSync("pnpm exec drizzle-kit push", {
    cwd: process.cwd(),
    env: {
      ...process.env,
      DATABASE_URL: testUrl,
    },
    stdio: "pipe",
  });
}

export async function resetDb(testUrl: string): Promise<void> {
  const pool = new Pool({ connectionString: testUrl });

  try {
    await pool.query(`
      TRUNCATE TABLE
        users,
        sessions,
        projects,
        architectures,
        scenarios,
        simulations,
        simulation_events,
        metrics
      RESTART IDENTITY CASCADE;
    `);
  } finally {
    await pool.end();
  }
}
