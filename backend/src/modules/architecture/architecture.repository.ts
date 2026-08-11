/**
 * @file architecture.repository.ts
 *
 * @description Persistence layer for architectures. Owns all direct database
 * access (via Drizzle) and translates known DB errors into API errors.
 */

import db from "@/infrastructure/database/db.js";
import { architecturesTable } from "@/infrastructure/database/schema/architectures.js";
import { projectsTable } from "@/infrastructure/database/schema/projects.js";
import {
  CreateArchitectureRecord,
  UpdateArchitectureRecord,
} from "./architecture.dto.js";
import { InternalServerError, NotFoundError } from "@/lib/apiError.js";
import { and, count, desc, eq, inArray } from "drizzle-orm";
import { mapDbError } from "@/lib/index.js";

/** Data access for the architectures table. */
export class ArchitectureRepository {
  /** Inserts a new architecture and returns the created row. */
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

  /**
   * Returns a page of architectures, newest first. Restricted to the projects
   * owned by `ownerId`; an optional `projectId` filter narrows within that
   * scope. Reads are not wrapped because they don't mutate data.
   */
  async findPaginated(filters: {
    ownerId: string;
    projectId?: string;
    page: number;
    limit: number;
  }) {
    const offset = (filters.page - 1) * filters.limit;

    return db
      .select()
      .from(architecturesTable)
      .where(
        and(
          inArray(architecturesTable.projectId, this.ownedProjects(filters.ownerId)),
          filters.projectId
            ? eq(architecturesTable.projectId, filters.projectId)
            : undefined,
        ),
      )
      .orderBy(desc(architecturesTable.createdAt), desc(architecturesTable.id))
      .limit(filters.limit)
      .offset(offset);
  }

  /** Counts architectures, optionally scoped to a single project. */
  async count(filters: { ownerId: string; projectId?: string }): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(architecturesTable)
      .where(
        and(
          inArray(architecturesTable.projectId, this.ownedProjects(filters.ownerId)),
          filters.projectId
            ? eq(architecturesTable.projectId, filters.projectId)
            : undefined,
        ),
      );

    return Number(result?.count ?? 0);
  }

  /** Subquery selecting the ids of projects owned by the given user. */
  private ownedProjects(ownerId: string) {
    return db
      .select({ id: projectsTable.id })
      .from(projectsTable)
      .where(eq(projectsTable.ownerId, ownerId));
  }

  /** Finds a single architecture by id, throwing NotFoundError if missing. */
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

  /** Updates fields on an architecture, throwing NotFoundError if it lacks an id. */
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

  /** Deletes an architecture by id (cascades to its scenarios), throwing NotFoundError if missing. */
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
