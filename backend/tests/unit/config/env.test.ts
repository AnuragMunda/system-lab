/**
 * @file env.test.ts
 *
 * @description Unit tests for env configuration parsing, verifying defaults,
 * required variables, and validation failures for invalid values.
 */

import { describe, it, expect, afterEach, vi } from "vitest";

const MISSING_ENV_FILE = "/tmp/opencode/nonexistent-dotenv.env";

const VALID_AUTH_ENV = {
  JWT_ACCESS_SECRET: "A".repeat(32),
  JWT_REFRESH_SECRET: "B".repeat(32),
  REFRESH_TOKEN_COOKIE_NAME: "refreshToken",
  REFRESH_TOKEN_MAX_AGE: "2592000000",
};

async function expectInvalidEnv(
  overrides: Record<string, string>,
  expectedPattern: RegExp,
) {
  const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

  await expect(loadEnv(overrides)).rejects.toThrow();

  expect(errorSpy).toHaveBeenCalledTimes(1);
  expect(JSON.stringify(errorSpy.mock.calls[0]?.[1])).toMatch(expectedPattern);
}

afterEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();
});

/**
 * Loads the env module in isolation with a controlled set of environment
 * variables, restoring the original process.env afterwards.
 */
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
      ...VALID_AUTH_ENV,
    });

    expect(env).toMatchObject({
      PORT: "3000",
      NODE_ENV: "development",
      DATABASE_URL: "postgres://localhost:5432/systemlab",
      REDIS_URL: "redis://localhost:6379",
    });
  });

  it("throws when DATABASE_URL is missing", async () => {
    await expectInvalidEnv(
      { REDIS_URL: "redis://localhost:6379", ...VALID_AUTH_ENV },
      /DATABASE_URL/,
    );
  });

  it("throws for an invalid NODE_ENV", async () => {
    await expectInvalidEnv(
      {
        DATABASE_URL: "postgres://localhost:5432/systemlab",
        NODE_ENV: "staging",
        ...VALID_AUTH_ENV,
      },
      /NODE_ENV/,
    );
  });
});
