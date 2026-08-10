/**
 * @file auth.schema.ts
 *
 * @description Zod request schemas for the auth endpoints. Also the source of
 * truth for the request DTO types in auth.dto.ts.
 */

import { z } from "zod";

/** Payload accepted by POST /api/v1/auth/register. */
export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.email(),
  password: z.string().min(8).max(100),
  avatarUrl: z.url().optional(),
});

/** Payload accepted by POST /api/v1/auth/login. */
export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});
