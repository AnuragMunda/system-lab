/**
 * @file architecture.service.ts
 *
 * @description Business logic layer for the architecture module. Maps callers'
 * DTOs into repository records and enforces rules the repository doesn't (e.g.
 * empty update payloads, graph merge behavior).
 */

import { ArchitectureRepository } from "./architecture.repository.js";
import {
  CreateArchitectureDto,
  ListArchitecturesQueryDto,
  PaginatedResult,
  UpdateArchitectureDto,
} from "./architecture.dto.js";
import { Architecture } from "@/domain/architecture/architecture.types.js";
import { BadRequestError } from "@/lib/apiError.js";

/** Coordinates architecture domain operations with the repository. */
export class ArchitectureService {
  constructor(private readonly repository: ArchitectureRepository) {}

  /** Creates an architecture, grouping node/edge data into a single graph. */
  async create(data: CreateArchitectureDto): Promise<Architecture> {
    const architecture = this.repository.create({
      projectId: data.projectId,
      name: data.name,
      description: data.description,
      graph: {
        nodes: data.nodes,
        edges: data.edges,
      },
    });

    return architecture;
  }

  /**
   * Returns a page of architectures, optionally filtered by project, along with
   * pagination metadata.
   */
  async getAllArchitectures(
    query: ListArchitecturesQueryDto,
  ): Promise<PaginatedResult<Architecture>> {
    const { projectId, page, limit } = query;

    const [items, total] = await Promise.all([
      this.repository.findPaginated({ projectId, page, limit }),
      this.repository.count({ projectId }),
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

  /** Fetches a single architecture, propagating NotFoundError when missing. */
  async findById(id: string): Promise<Architecture> {
    return this.repository.findById(id);
  }

  /**
   * Updates an architecture. Merges provided nodes/edges with the existing
   * graph, and rejects empty payloads.
   */
  async update(id: string, data: UpdateArchitectureDto): Promise<Architecture> {
    const existing = await this.repository.findById(id);

    const { nodes, edges, ...fields } = data;

    if (Object.keys(fields).length === 0 && nodes === undefined && edges === undefined) {
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

  /** Deletes an architecture, propagating NotFoundError when missing. */
  async delete(id: string): Promise<Architecture> {
    return this.repository.delete(id);
  }
}
