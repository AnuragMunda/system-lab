/**
 * @file validate.ts
 *
 * @description Express middleware factory that validates a request body against
 * a Zod schema, replacing `req.body` with the parsed data or forwarding a
 * BadRequestError.
 */

import { BadRequestError } from "@/lib/apiError.js";
import type { RequestHandler } from "express";
import type { ZodType } from "zod";

export const validate = (schema: ZodType): RequestHandler => {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      throw BadRequestError(
        result.error.issues.map((issue) => issue.message).join(", "),
      );
    }

    req.body = result.data;

    next();
  };
};
