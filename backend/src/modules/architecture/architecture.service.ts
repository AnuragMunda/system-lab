/**
 * @file architecture.service.ts
 *
 * @description Business logic layer for the architecture module. Maps callers'
 * DTOs into repository records and enforces rules the repository doesn't (e.g.
 * empty update payloads, graph merge behavior). Architectures inherit their
 * permissions from the parent project: writes require owning that project, and
 * reads mirror the project's visibility rules.
 */

import { ArchitectureRepository } from "./architecture.repository.js";
import { ProjectRepository } from "../project/project.repository.js";
import {
  CreateArchitectureDto,
  ListArchitecturesQueryDto,
  PaginatedResult,
  UpdateArchitectureDto,
} from "./architecture.dto.js";
import { Architecture } from "@/domain/architecture/architecture.types.js";
import { Project } from "@/domain/project/project.types.js";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "@/lib/apiError.js";

/** Coordinates architecture domain operations with the repository. */
export class ArchitectureService {
  constructor(
    private readonly repository: ArchitectureRepository,
    private readonly projectRepository: ProjectRepository,
  ) {}

  /** Creates an architecture, requiring the caller to own the target project. */
  async create(
    userId: string,
    data: CreateArchitectureDto,
  ): Promise<Architecture> {
    const project = await this.projectRepository.findById(data.projectId);

    this.assertOwner(project, userId);

    return this.repository.create({
      projectId: data.projectId,
      name: data.name,
      description: data.description,
      graph: {
        nodes: data.nodes,
        edges: data.edges,
      },
    });
  }

  /**
   * Returns a page of architectures in the caller's own projects, optionally
   * scoped to a single project, along with pagination metadata.
   */
  async getAllArchitectures(
    userId: string,
    query: ListArchitecturesQueryDto,
  ): Promise<PaginatedResult<Architecture>> {
    const { projectId, page, limit } = query;

    const [items, total] = await Promise.all([
      this.repository.findPaginated({ ownerId: userId, projectId, page, limit }),
      this.repository.count({ ownerId: userId, projectId }),
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
   * Fetches a single architecture. Access is inherited from the parent project:
   * PUBLIC and UNLISTED are viewable by anyone; PRIVATE only by its owner.
   * Non-owners are met with a 404 so the architecture's existence stays hidden.
   */
  async findById(id: string, userId?: string): Promise<Architecture> {
    const architecture = await this.repository.findById(id);
    const project = await this.projectRepository.findById(
      architecture.projectId,
    );

    this.assertCanRead(project, userId);

    return architecture;
  }

  /**
   * Updates an architecture. Rejects updates by anyone who doesn't own the
   * parent project, merges provided nodes/edges with the existing graph, and
   * rejects empty payloads.
   */
  async update(
    id: string,
    userId: string,
    data: UpdateArchitectureDto,
  ): Promise<Architecture> {
    const existing = await this.repository.findById(id);
    const project = await this.projectRepository.findById(existing.projectId);

    this.assertOwner(project, userId);

    const { nodes, edges, ...fields } = data;

    if (
      Object.keys(fields).length === 0 &&
      nodes === undefined &&
      edges === undefined
    ) {
      throw BadRequestError("No fields provided to update.");
    }

    const record = {
      ...fields,
      ...(nodes !== undefined || edges !== undefined
        ? {
            graph: {
              nodes: nodes ?? existing.graph.nodes,
              edges: edges ?? existing.graph.edges,
            },
          }
        : {}),
    };

    return this.repository.update(id, record);
  }

  /** Deletes an architecture, rejecting callers who don't own its project. */
  async delete(id: string, userId: string): Promise<Architecture> {
    const existing = await this.repository.findById(id);
    const project = await this.projectRepository.findById(existing.projectId);

    this.assertOwner(project, userId);

    return this.repository.delete(id);
  }

  /** Throws ForbiddenError unless the user owns the given project. */
  private assertOwner(project: Project, userId: string): void {
    if (project.ownerId !== userId) {
      throw ForbiddenError();
    }
  }

  /**
   * Throws NotFoundError when a non-owner tries to read an architecture whose
   * project is PRIVATE, so its existence is not revealed.
   */
  private assertCanRead(project: Project, userId?: string): void {
    if (project.ownerId !== userId && project.visibility === "PRIVATE") {
      throw NotFoundError();
    }
  }
}