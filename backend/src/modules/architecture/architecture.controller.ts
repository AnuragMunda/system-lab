import { Request, Response } from "express";
import { ApiResponse, asyncHandler, BadRequestError } from "@/lib/index.js";
import { architectureSchema } from "./architecture.schema.js";
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
