/**
 * @file project.controller.ts
 *
 * @description HTTP handlers for the project module. Each handler parses input,
 * guards on the authenticated `req.user`, delegates to the service, and sends a
 * standardized ApiResponse. Errors are thrown and handled by the global
 * middleware via asyncHandler.
 */

import { Request, Response } from "express";
import {
  ApiResponse,
  UnauthorizedError,
  asyncHandler,
  BadRequestError,
} from "@/lib/index.js";
import { idParamSchema, listProjectsQuerySchema } from "./project.schema.js";
import { projectService } from "./index.js";

/** Returns the authenticated user's identity or throws. */
const requireUser = (req: Request) => {
  if (!req.user) {
    throw UnauthorizedError();
  }

  return req.user;
};

/** POST /api/v1/projects — creates a new project owned by the caller (201). */
export const createProject = asyncHandler(
  async (req: Request, res: Response) => {
    const user = requireUser(req);

    const project = await projectService.create(user.id, req.body);

    return ApiResponse.created(res, project, "Project created successfully");
  },
);

/** GET /api/v1/projects — paginated list of the caller's projects. */
export const getProjects = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);

  const query = listProjectsQuerySchema.safeParse(req.query);

  if (!query.success) {
    throw BadRequestError(query.error.message);
  }

  const result = await projectService.getPaginated(user.id, query.data);

  return ApiResponse.ok(res, result);
});

/** GET /api/v1/projects/:id — fetches a single project. Access is governed by visibility. */
export const getProjectById = asyncHandler(
  async (req: Request, res: Response) => {
    const params = idParamSchema.safeParse(req.params);

    if (!params.success) {
      throw BadRequestError(params.error.message);
    }

    const project = await projectService.findById(params.data.id, req.user?.id);

    return ApiResponse.ok(res, project);
  },
);

/** PATCH /api/v1/projects/:id — partially updates a project. */
export const updateProject = asyncHandler(
  async (req: Request, res: Response) => {
    const user = requireUser(req);

    const params = idParamSchema.safeParse(req.params);

    if (!params.success) {
      throw BadRequestError(params.error.message);
    }

    const project = await projectService.update(
      params.data.id,
      user.id,
      req.body,
    );

    return ApiResponse.ok(res, project, "Project updated successfully");
  },
);

/** DELETE /api/v1/projects/:id — deletes a project and its architectures. */
export const deleteProject = asyncHandler(
  async (req: Request, res: Response) => {
    const user = requireUser(req);

    const params = idParamSchema.safeParse(req.params);

    if (!params.success) {
      throw BadRequestError(params.error.message);
    }

    const project = await projectService.delete(params.data.id, user.id);

    return ApiResponse.ok(res, project, "Project deleted successfully");
  },
);
