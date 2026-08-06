/**
 * @file errorMiddleware.ts
 *
 * @description Global error handler registered last in the Express pipeline.
 * Converts any thrown error into a JSON response. ApiErrors keep their status
 * code and code; anything else becomes a 500. Stack traces are only included
 * in development.
 */

import type { Request, Response, NextFunction } from "express";
import { HttpStatus, ApiMessages } from "@/config/constants/index.js";
import { ApiError } from "@/lib/index.js";

export const errorMiddleware = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR;
  let message = ApiMessages.SERVER_ERROR.INTERNAL_ERROR;
  let code: string | undefined;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code;
  }

  console.error("ERROR:", err);

  res.status(statusCode).json({
    success: false,
    message,
    code,
    stack:
      process.env.NODE_ENV === "development"
        ? err instanceof Error
          ? err.stack
          : String(err)
        : undefined,
  });
};
