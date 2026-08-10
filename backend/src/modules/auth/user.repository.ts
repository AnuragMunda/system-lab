/**
 * @file user.repository.ts
 *
 * @description Data access layer for the users table, mapping between persisted
 * rows and the domain User type used by the auth service.
 */

import db from "@/infrastructure/database/db.js";
import { UserRecord } from "./auth.dto.js";
import { usersTable } from "@/infrastructure/database/schema/users.js";
import { InternalServerError } from "@/lib/apiError.js";
import { eq } from "drizzle-orm";
import { User } from "@/domain/auth/user.types.js";
import { mapDbError } from "@/lib/utils.js";

/** Data access for the users table. */
export class UserRepository {
  constructor(private readonly database = db) {}

  /** Creates a user and returns the persisted row. */
  async createUser(data: UserRecord): Promise<User> {
    try {
      const [user] = await this.database
        .insert(usersTable)
        .values(data)
        .returning();

      if (!user) {
        throw InternalServerError("Failed to create user.");
      }

      return user;
    } catch (error) {
      throw mapDbError(error);
    }
  }

  /** Finds a user by email, or null when no match exists. */
  async findUserByEmail(email: string): Promise<User | null> {
    const [user] = await this.database
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    return user ?? null;
  }

  /** Finds a user by id, or null when no match exists. */
  async findUserById(id: string): Promise<User | null> {
    const [user] = await this.database
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id));

    return user ?? null;
  }
}
