import db from "@/infrastructure/database/db.js";
import { UserRecord } from "./auth.dto.js";
import { usersTable } from "@/infrastructure/database/schema/users.js";
import { InternalServerError } from "@/lib/apiError.js";
import { eq } from "drizzle-orm";
import { User } from "@/domain/auth/user.types.js";
import { mapDbError } from "@/lib/utils.js";

export class UserRepository {
  constructor(private readonly database = db) {}

  async createUser(data: UserRecord): Promise<User> {
    try {
      const [user] = await this.database
        .insert(usersTable)
        .values(data)
        .returning();

      if (!user) {
        throw InternalServerError("Failed to create architecture.");
      }

      return user;
    } catch (error) {
      throw mapDbError(error);
    }
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const [user] = await this.database
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    return user ?? null;
  }

  async findUserById(id: string): Promise<User | null> {
    const [user] = await this.database
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id));

    return user ?? null;
  }
}
