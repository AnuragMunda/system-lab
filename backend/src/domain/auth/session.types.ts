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
