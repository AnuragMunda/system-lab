/**
 * @file env.ts
 *
 * @description Loads and validates environment variables at startup using Zod.
 * If any required variable is missing or malformed, the server fails fast
 * with a clear error rather than running with undefined configuration.
 */

import "dotenv/config";
import { SignOptions } from "jsonwebtoken";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.string().default("3000"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  DATABASE_URL: z.url(),
  REDIS_URL: z.url().optional(),

  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.custom<SignOptions["expiresIn"]>().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.custom<SignOptions["expiresIn"]>().default("30d"),

  BCRYPT_SALT_ROUNDS: z.coerce.number().int().positive().default(12),

  REFRESH_TOKEN_COOKIE_NAME: z.string().min(2),
  REFRESH_TOKEN_MAX_AGE: z.coerce.number().int().positive(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(
    "❌ Invalid environment variables:\n",
    parsedEnv.error.format(),
  );

  process.exit(1);
}

export const env = parsedEnv.data;
