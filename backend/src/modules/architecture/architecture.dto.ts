/**
 * @file architecture.dto.ts
 *
 * @description Data-transfer types for the architecture module. `Dto` types are
 * inferred from the Zod request schemas, while `Record` types describe the
 * column shapes persisted to the database by the repository.
 */

import { ArchitectureNode } from "@/domain/architecture/component.types.js";
import { ArchitectureEdge } from "@/domain/architecture/connection.types.js";
import {
  architectureSchema,
  listArchitecturesQuerySchema,
  updateArchitectureSchema,
} from "./architecture.schema.js";
import { z } from "zod";

/** Payload accepted when creating an architecture. */
export type CreateArchitectureDto = z.infer<typeof architectureSchema>;
/** Payload accepted when updating an architecture. */
export type UpdateArchitectureDto = z.infer<typeof updateArchitectureSchema>;
/** Query params accepted when listing architectures. */
export type ListArchitecturesQueryDto = z.infer<
  typeof listArchitecturesQuerySchema
>;

/** Standard paginated result envelope returned by list operations. */
export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** Row shape persisted when creating an architecture (graph as JSONB). */
export interface CreateArchitectureRecord {
  projectId: string;
  name: string;
  description?: string;

  graph: {
    nodes: ArchitectureNode[];
    edges: ArchitectureEdge[];
  };
}

/** Partial row shape accepted when updating an architecture. */
export interface UpdateArchitectureRecord {
  name?: string;
  description?: string;

  graph?: {
    nodes: ArchitectureNode[];
    edges: ArchitectureEdge[];
  };
}
