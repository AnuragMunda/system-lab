/**
 * @file session.repository.ts
 *
 * @description Data access layer for the sessions table, managing refresh-token
 * sessions: creation, lookup, hash rotation, and revocation.
 */

import db from "@/infrastructure/database/db.js";
import { InternalServerError, NotFoundError } from "@/lib/apiError.js";
import { eq, lt } from "drizzle-orm";
import { sessionsTable } from "@/infrastructure/database/schema/sessions.js";
import { SessionRecord } from "./auth.dto.js";
import { Session } from "@/domain/auth/session.types.js";
import { mapDbError } from "@/lib/utils.js";

/** Data access for the sessions table. */
export class SessionRepository {
  constructor(private readonly database = db) {}

  /** Creates a session and returns the persisted row. */
  async createSession(data: SessionRecord): Promise<Session> {
    try {
      const [session] = await this.database
        .insert(sessionsTable)
        .values(data)
        .returning();

      if (!session) {
        throw InternalServerError("Failed to create session.");
      }

      return session;
    } catch (error) {
      throw mapDbError(error);
    }
  }

  /** Finds a session by id, or null when no match exists. */
  async findSessionById(id: string): Promise<Session | null> {
    const [session] = await this.database
      .select()
      .from(sessionsTable)
      .where(eq(sessionsTable.id, id));

    return session ?? null;
  }

  /** Updates session fields, returning the persisted row. */
  async updateSession(
    id: string,
    data: Partial<SessionRecord>,
  ): Promise<Session> {
    try {
      const [session] = await this.database
        .update(sessionsTable)
        .set(data)
        .where(eq(sessionsTable.id, id))
        .returning();

      if (!session) {
        throw NotFoundError();
      }

      return session;
    } catch (error) {
      throw mapDbError(error);
    }
  }

  /** Marks a single session as revoked. */
  async revokeSession(id: string) {
    try {
      await this.database
        .update(sessionsTable)
        .set({ revokedAt: new Date() })
        .where(eq(sessionsTable.id, id));
    } catch (error) {
      throw mapDbError(error);
    }
  }

  /** Marks every session belonging to a user as revoked (logout-all). */
  async revokeAllUserSessions(userId: string) {
    try {
      await this.database
        .update(sessionsTable)
        .set({
          revokedAt: new Date(),
        })
        .where(eq(sessionsTable.userId, userId));
    } catch (error) {
      throw mapDbError(error);
    }
  }

  /** Deletes sessions whose expiry has passed. */
  async deleteExpiredSessions() {
    try {
      await this.database
        .delete(sessionsTable)
        .where(lt(sessionsTable.expiresAt, new Date()));
    } catch (error) {
      throw mapDbError(error);
    }
  }
}
