/**
 * @file session.types.ts
 *
 * @description Domain type for a refresh-token session as stored in the database.
 */

/** A persisted authentication session tied to a refresh token. */
export interface Session {
  id: string;
  userId: string;

  refreshTokenHash: string;
  userAgent?: string | null;
  ipAddress?: string | null;

  expiresAt: Date;
  lastUsedAt?: Date | null;
  revokedAt?: Date | null;
  createdAt: Date;
}
