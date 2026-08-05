import { Request, Response } from "express";
import { ApiResponse, asyncHandler, BadRequestError } from "@/lib/index.js";
import {
  architectureSchema,
  idParamSchema,
  updateArchitectureSchema,
} from "./architecture.schema.js";
import { architectureService } from "./index.js";

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

export const getAllArchitectures = asyncHandler(
  async (_req: Request, res: Response) => {
    const architectures = await architectureService.getAllArchitectures();

    return ApiResponse.ok(res, architectures);
  },
);

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
