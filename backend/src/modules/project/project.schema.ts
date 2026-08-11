/**
 * @file project.schema.ts
 *
 * @description Zod schemas for the project module. Used by controllers and the
 * validate middleware to check request bodies, path params, and query strings
 * before they reach the service layer.
 */

import { z } from "zod";
import { NAME_LENGTH } from "@/config/constants/index.js";

/** Validates the body for creating a project. */
export const createProjectSchema = z.object({
  name: z.string().min(1).max(NAME_LENGTH),
  description: z.string().max(1000).optional(),
  visibility: z.enum(["PRIVATE", "PUBLIC", "UNLISTED"]).default("PRIVATE"),
});

/** Validates the body for updating a project. All fields optional; ownerId is not updatable. */
export const updateProjectSchema = z
  .object({
    name: z.string().min(1).max(NAME_LENGTH),
    description: z.string().max(1000),
    visibility: z.enum(["PRIVATE", "PUBLIC", "UNLISTED"]),
  })
  .partial();

/** Validates the `:id` path param as a UUID. */
export const idParamSchema = z.object({
  id: z.uuid(),
});

/** Validates query params for listing a user's projects (pagination). */
export const listProjectsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
