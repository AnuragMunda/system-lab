/**
 * @file project.service.ts
 *
 * @description Business logic layer for the project module. Implements the
 * authorization rules the repository doesn't: writes are owner-scoped, while
 * reads honor the project's visibility (PRIVATE is owner-only, PUBLIC and
 * UNLISTED are viewable by any authenticated user).
 */

import { ProjectRepository } from "./project.repository.js";
import {
  CreateProjectDto,
  ListProjectsQueryDto,
  PaginatedResult,
  UpdateProjectDto,
} from "./project.dto.js";
import { Project } from "@/domain/project/project.types.js";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "@/lib/apiError.js";

/** Coordinates project domain operations with the repository. */
export class ProjectService {
  constructor(private readonly repository: ProjectRepository) {}

  /** Creates a project owned by the given user. */
  async create(ownerId: string, data: CreateProjectDto): Promise<Project> {
    return this.repository.create({
      ownerId,
      name: data.name,
      description: data.description,
      visibility: data.visibility,
    });
  }

  /**
   * Returns a page of projects owned by the given user, along with pagination
   * metadata.
   */
  async getPaginated(
    ownerId: string,
    query: ListProjectsQueryDto,
  ): Promise<PaginatedResult<Project>> {
    const { page, limit } = query;

    const [items, total] = await Promise.all([
      this.repository.findPaginatedByOwner({ ownerId, page, limit }),
      this.repository.countByOwner(ownerId),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Fetches a single project. PUBLIC and UNLISTED projects are viewable by
   * anyone; PRIVATE projects are only viewable by their owner. Non-owners are
   * met with a 404 so the project's existence stays hidden.
   */
  async findById(id: string, userId?: string): Promise<Project> {
    const project = await this.repository.findById(id);

    this.assertCanRead(project, userId);

    return project;
  }

  /**
   * Updates a project. Rejects updates to projects the caller doesn't own and
   * rejects empty payloads.
   */
  async update(
    id: string,
    userId: string,
    data: UpdateProjectDto,
  ): Promise<Project> {
    const existing = await this.repository.findById(id);

    this.assertOwner(existing, userId);

    if (Object.keys(data).length === 0) {
      throw BadRequestError("No fields provided to update.");
    }

    return this.repository.update(id, data);
  }

  /** Deletes a project, rejecting any the caller doesn't own. */
  async delete(id: string, userId: string): Promise<Project> {
    const existing = await this.repository.findById(id);

    this.assertOwner(existing, userId);

    return this.repository.delete(id);
  }

  /** Throws ForbiddenError unless the user is the project's owner. */
  private assertOwner(project: Project, userId: string): void {
    if (project.ownerId !== userId) {
      throw ForbiddenError();
    }
  }

  /**
   * Throws NotFoundError when a non-owner tries to read a PRIVATE project, so
   * its existence is not revealed through the public endpoint.
   */
  private assertCanRead(project: Project, userId?: string): void {
    if (project.ownerId !== userId && project.visibility === "PRIVATE") {
      throw NotFoundError();
    }
  }
}
