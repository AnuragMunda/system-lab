/**
 * @file user.types.ts
 *
 * @description Domain type for an application user as stored in the database.
 */

/** A persisted application user. */
export interface User {
  id: string;
  name: string;

  email: string;
  passwordHash: string;

  avatarUrl?: string | null;
  emailVerified: boolean;

  createdAt: Date;
  updatedAt: Date;
}
