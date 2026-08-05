/**
 * This file defines an asynchronous handler function for Express.js routes.
 * It wraps an asynchronous function and handles any errors that may occur during its execution.
 * If an error occurs, it passes the error to the next middleware for centralized error handling.
 */

import { NextFunction, Request, Response } from "express";

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
