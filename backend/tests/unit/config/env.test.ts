import { describe, it, expect, afterEach, vi } from "vitest";

const MISSING_ENV_FILE = "/tmp/opencode/nonexistent-dotenv.env";

afterEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();
});

async function loadEnv(overrides: Record<string, string | undefined>) {
  const saved = { ...process.env };

  Object.keys(process.env).forEach((key) => {
    if (
      key.startsWith("NODE_ENV") ||
      key.startsWith("PORT") ||
      key.startsWith("DATABASE_URL") ||
      key.startsWith("REDIS_URL") ||
      key.startsWith("DOTENV_CONFIG_PATH")
    ) {
      delete process.env[key];
    }
  });

  Object.entries(overrides).forEach(([key, value]) => {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  });
  process.env.DOTENV_CONFIG_PATH = MISSING_ENV_FILE;

  const module = await import("../../../src/config/env.js");

  Object.assign(process.env, saved);

  return module.env;
}

describe("env", () => {
  it("parses a valid environment with defaults", async () => {
    const env = await loadEnv({
      DATABASE_URL: "postgres://localhost:5432/systemlab",
      REDIS_URL: "redis://localhost:6379",
    });

    expect(env).toMatchObject({
      PORT: "3000",
      NODE_ENV: "development",
      DATABASE_URL: "postgres://localhost:5432/systemlab",
      REDIS_URL: "redis://localhost:6379",
    });
  });

  it("throws when DATABASE_URL is missing", async () => {
    await expect(
      loadEnv({ REDIS_URL: "redis://localhost:6379" }),
    ).rejects.toThrow(/DATABASE_URL/);
  });

  it("throws for an invalid NODE_ENV", async () => {
    await expect(
      loadEnv({
        DATABASE_URL: "postgres://localhost:5432/systemlab",
        NODE_ENV: "staging",
      }),
    ).rejects.toThrow(/NODE_ENV/);
  });
});
