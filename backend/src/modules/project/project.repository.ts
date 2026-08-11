/**
 * @file project.repository.ts
 *
 * @description Persistence layer for projects. Owns all direct database access
 * (via Drizzle) and translates known DB errors into API errors.
 */

import db from "@/infrastructure/database/db.js";
import { projectsTable } from "@/infrastructure/database/schema/projects.js";
import {
  CreateProjectRecord,
  UpdateProjectRecord,
} from "./project.dto.js";
import { InternalServerError, NotFoundError } from "@/lib/apiError.js";
import { count, desc, eq } from "drizzle-orm";
import { mapDbError } from "@/lib/index.js";

/** Data access for the projects table. */
export class ProjectRepository {
  /** Inserts a new project and returns the created row. */
  async create(data: CreateProjectRecord) {
    try {
      const [project] = await db
        .insert(projectsTable)
        .values(data)
        .returning();

      if (!project) {
        throw InternalServerError("Failed to create project.");
      }

      return project;
    } catch (error) {
      throw mapDbError(error);
    }
  }

  /** Finds a single project by id, throwing NotFoundError if missing. */
  async findById(id: string) {
    const [project] = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.id, id));

    if (!project) {
      throw NotFoundError();
    }

    return project;
  }

  /**
   * Returns a page of projects owned by a single user, newest first.
   * Reads are not wrapped because they don't mutate data.
   */
  async findPaginatedByOwner(filters: {
    ownerId: string;
    page: number;
    limit: number;
  }) {
    const offset = (filters.page - 1) * filters.limit;

    return db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.ownerId, filters.ownerId))
      .orderBy(desc(projectsTable.createdAt), desc(projectsTable.id))
      .limit(filters.limit)
      .offset(offset);
  }

  /** Counts projects owned by a single user. */
  async countByOwner(ownerId: string): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(projectsTable)
      .where(eq(projectsTable.ownerId, ownerId));

    return Number(result?.count ?? 0);
  }

  /** Updates fields on a project, throwing NotFoundError if it lacks an id. */
  async update(id: string, data: UpdateProjectRecord) {
    try {
      const [project] = await db
        .update(projectsTable)
        .set(data)
        .where(eq(projectsTable.id, id))
        .returning();

      if (!project) {
        throw NotFoundError();
      }

      return project;
    } catch (error) {
      throw mapDbError(error);
    }
  }

  /** Deletes a project by id (cascades to its architectures), throwing NotFoundError if missing. */
  async delete(id: string) {
    try {
      const [project] = await db
        .delete(projectsTable)
        .where(eq(projectsTable.id, id))
        .returning();

      if (!project) {
        throw NotFoundError();
      }

      return project;
    } catch (error) {
      throw mapDbError(error);
    }
  }
}