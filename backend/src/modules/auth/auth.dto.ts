import { z } from "zod";
import { loginSchema, registerSchema } from "./auth.schema.js";

export type RegisterDto = z.infer<typeof registerSchema>;

export type LoginDto = z.infer<typeof loginSchema>;

export interface UserResponseDto {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  emailVerified: boolean;
  createdAt: Date;
}

export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: UserResponseDto;
}

export interface UserRecord {
  name: string;
  email: string;
  passwordHash: string;
  avatarUrl?: string;
}

export interface SessionRecord {
  userId: string;
  refreshTokenHash: string;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: Date;
  lastUsedAt?: Date;
  revokedAt?: Date;
}
