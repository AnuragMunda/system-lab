import db from "@/infrastructure/database/db.js";
import { architecturesTable } from "@/infrastructure/database/schema/architectures.js";
import {
  CreateArchitectureRecord,
  UpdateArchitectureRecord,
} from "./architecture.dto.js";
import { InternalServerError, NotFoundError } from "@/lib/apiError.js";
import { eq } from "drizzle-orm";
import { mapDbError } from "@/lib/utils.js";

export class ArchitectureRepository {
  async create(data: CreateArchitectureRecord) {
    // Implementation for saving architecture
    try {
      const [architecture] = await db
        .insert(architecturesTable)
        .values(data)
        .returning();

      if (!architecture) {
        throw InternalServerError("Failed to create architecture.");
      }

      return architecture;
    } catch (error) {
      throw mapDbError(error);
    }
  }

  async findAll() {
    return db.select().from(architecturesTable);
  }

  async findById(id: string) {
    const [architecture] = await db
      .select()
      .from(architecturesTable)
      .where(eq(architecturesTable.id, id));

    if (!architecture) {
      throw NotFoundError();
    }

    return architecture;
  }

  async update(id: string, data: UpdateArchitectureRecord) {
    try {
      const [architecture] = await db
        .update(architecturesTable)
        .set(data)
        .where(eq(architecturesTable.id, id))
        .returning();

      if (!architecture) {
        throw NotFoundError();
      }

      return architecture;
    } catch (error) {
      throw mapDbError(error);
    }
  }

  async delete(id: string) {
    try {
      const [architecture] = await db
        .delete(architecturesTable)
        .where(eq(architecturesTable.id, id))
        .returning();

      if (!architecture) {
        throw NotFoundError();
      }

      return architecture;
    } catch (error) {
      throw mapDbError(error);
    }
  }
}
