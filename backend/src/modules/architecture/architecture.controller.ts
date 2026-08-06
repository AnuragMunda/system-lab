/**
 * @file architecture.controller.ts
 *
 * @description HTTP handlers for the architecture module. Each handler
 * validates its input with a Zod schema, delegates to the service, and sends a
 * standardized ApiResponse. Errors are thrown and handled by the global
 * middleware via asyncHandler.
 */

import { Request, Response } from "express";
import { ApiResponse, asyncHandler, BadRequestError } from "@/lib/index.js";
import {
  architectureSchema,
  idParamSchema,
  listArchitecturesQuerySchema,
  updateArchitectureSchema,
} from "./architecture.schema.js";
import { architectureService } from "./index.js";

/** POST /api/v1/architectures — creates a new architecture (201). */
export const createArchitecture = asyncHandler(
  async (req: Request, res: Response) => {
    const { success, error, data } = architectureSchema.safeParse(req.body);

    if (!success) {
      throw BadRequestError(error.message);
    }

    const architecture = await architectureService.create(data);

    return ApiResponse.created(
      res,
      architecture,
      "Architecture created successfully",
    );
  },
);

/** GET /api/v1/architectures — paginated list, optionally filtered by projectId. */
export const getAllArchitectures = asyncHandler(
  async (req: Request, res: Response) => {
    const query = listArchitecturesQuerySchema.safeParse(req.query);

    if (!query.success) {
      throw BadRequestError(query.error.message);
    }

    const result = await architectureService.getAllArchitectures(query.data);

    return ApiResponse.ok(res, result);
  },
);

/** GET /api/v1/architectures/:id — fetches a single architecture. */
export const getArchitectureById = asyncHandler(
  async (req: Request, res: Response) => {
    const params = idParamSchema.safeParse(req.params);

    if (!params.success) {
      throw BadRequestError(params.error.message);
    }

    const architecture = await architectureService.findById(params.data.id);

    return ApiResponse.ok(res, architecture);
  },
);

/** PATCH /api/v1/architectures/:id — partially updates an architecture. */
export const updateArchitecture = asyncHandler(
  async (req: Request, res: Response) => {
    const params = idParamSchema.safeParse(req.params);

    if (!params.success) {
      throw BadRequestError(params.error.message);
    }

    const body = updateArchitectureSchema.safeParse(req.body);

    if (!body.success) {
      throw BadRequestError(body.error.message);
    }

    const architecture = await architectureService.update(
      params.data.id,
      body.data,
    );

    return ApiResponse.ok(
      res,
      architecture,
      "Architecture updated successfully",
    );
  },
);

/** DELETE /api/v1/architectures/:id — deletes an architecture and its scenarios. */
export const deleteArchitecture = asyncHandler(
  async (req: Request, res: Response) => {
    const params = idParamSchema.safeParse(req.params);

    if (!params.success) {
      throw BadRequestError(params.error.message);
    }

    const architecture = await architectureService.delete(params.data.id);

    return ApiResponse.ok(
      res,
      architecture,
      "Architecture deleted successfully",
    );
  },
);
