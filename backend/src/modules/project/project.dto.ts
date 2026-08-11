/**
 * @file project.dto.ts
 *
 * @description Data-transfer types for the project module. `Dto` types are
 * inferred from the Zod request schemas, while `Record` types describe the
 * column shapes persisted to the database by the repository.
 */

import { z } from "zod";
import {
  createProjectSchema,
  listProjectsQuerySchema,
  updateProjectSchema,
} from "./project.schema.js";
import { ProjectVisibility } from "@/domain/project/project.types.js";

/** Payload accepted when creating a project. */
export type CreateProjectDto = z.infer<typeof createProjectSchema>;
/** Payload accepted when updating a project. */
export type UpdateProjectDto = z.infer<typeof updateProjectSchema>;
/** Query params accepted when listing projects. */
export type ListProjectsQueryDto = z.infer<typeof listProjectsQuerySchema>;

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

/** Row shape persisted when creating a project. */
export interface CreateProjectRecord {
  ownerId: string;
  name: string;
  description?: string;
  visibility: ProjectVisibility;
}

/** Partial row shape accepted when updating a project. */
export type UpdateProjectRecord = Partial<
  Omit<CreateProjectRecord, "ownerId">
>;