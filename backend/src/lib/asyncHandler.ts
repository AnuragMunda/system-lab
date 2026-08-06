/**
 * @file asyncHandler.ts
 *
 * @description Wraps an async Express route handler so that any rejected promise
 * is forwarded to the next middleware for centralized error handling. This lets
 * controllers use `throw` and `await` freely without try/catch boilerplate.
 */

import { NextFunction, Request, Response } from "express";

/** Signature of an Express route handler. */
type AsyncFn = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void | Response>;

export const asyncHandler =
  (fn: AsyncFn) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve()
      .then(() => fn(req, res, next))
      .catch(next);
  };
