import db from "@/infrastructure/database/db.js";
import { architecturesTable } from "@/infrastructure/database/schema/architectures.js";
import {
  CreateArchitectureRecord,
  UpdateArchitectureRecord,
} from "./architecture.dto.js";
import { InternalServerError, NotFoundError } from "@/lib/apiError.js";
import { count, desc, eq } from "drizzle-orm";
import { mapDbError } from "@/lib/index.js";

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

  async findPaginated(filters: {
    projectId?: string;
    page: number;
    limit: number;
  }) {
    const offset = (filters.page - 1) * filters.limit;

    return db
      .select()
      .from(architecturesTable)
      .where(
        filters.projectId
          ? eq(architecturesTable.projectId, filters.projectId)
          : undefined,
      )
      .orderBy(desc(architecturesTable.createdAt), desc(architecturesTable.id))
      .limit(filters.limit)
      .offset(offset);
  }

  async count(filters: { projectId?: string }): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(architecturesTable)
      .where(
        filters.projectId
          ? eq(architecturesTable.projectId, filters.projectId)
          : undefined,
      );

    return Number(result?.count ?? 0);
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
