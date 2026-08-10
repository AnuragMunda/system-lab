/**
 * @file auth.dto.ts
 *
 * @description Data-transfer types for the auth module. `Dto` types are inferred
 * from the Zod request schemas, while `Record` types describe the column shapes
 * persisted to the database by the repositories.
 */

import { z } from "zod";
import { loginSchema, registerSchema } from "./auth.schema.js";

/** Payload accepted when registering a user. */
export type RegisterDto = z.infer<typeof registerSchema>;

/** Payload accepted when logging in. */
export type LoginDto = z.infer<typeof loginSchema>;

/** User profile returned to clients. */
export interface UserResponseDto {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  emailVerified: boolean;
  createdAt: Date;
}

/** Tokens plus user profile returned on login/registration flows. */
export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: UserResponseDto;
}

/** Row shape persisted when creating a user. */
export interface UserRecord {
  name: string;
  email: string;
  passwordHash: string;
  avatarUrl?: string;
}

/** Row shape persisted when creating a session. */
export interface SessionRecord {
  userId: string;
  refreshTokenHash: string;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: Date;
  lastUsedAt?: Date;
  revokedAt?: Date;
}
