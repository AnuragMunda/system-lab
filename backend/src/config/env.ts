/**
 * @file env.ts
 *
 * @description Loads and validates environment variables at startup using Zod.
 * If any required variable is missing or malformed, the server fails fast
 * with a clear error rather than running with undefined configuration.
 */

import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.string().default("3000"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  DATABASE_URL: z.string(),
  REDIS_URL: z.string().optional(),
});

export const env = envSchema.parse(process.env);
