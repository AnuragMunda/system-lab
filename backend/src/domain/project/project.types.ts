/**
 * @file project.types.ts
 *
 * @description A project is a top-level container owned by a single user that
 * groups related architectures together. Its visibility controls who may view
 * it.
 */

/** Who is allowed to see a project. */
export type ProjectVisibility = "PRIVATE" | "PUBLIC" | "UNLISTED";

export interface Project {
  id: string;
  ownerId: string;

  name: string;
  description?: string | null;

  visibility: ProjectVisibility;

  createdAt: Date;
  updatedAt: Date;
}
