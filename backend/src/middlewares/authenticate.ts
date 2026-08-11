/**
 * @file authenticate.ts
 *
 * @description Express middleware that authenticates requests by parsing the
 * Bearer access token, verifying its signature, and populating `req.user` for
 * downstream handlers. `authenticate` rejects requests without a token, while
 * `authenticateOptional` lets them through as anonymous. Authentication failures
 * (invalid tokens) are forwarded via `next` in both cases.
 */

import { verifyAccessToken } from "@/infrastructure/auth/jwt.js";
import { UnauthorizedError } from "@/lib/apiError.js";
import type { NextFunction, Request, Response } from "express";

/** Populates `req.user` from the request's Bearer token, or returns false. */
const resolveUser = (req: Request): boolean => {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return false;
  }

  const token = authorization.substring(7);
  const payload = verifyAccessToken(token);

  req.user = {
    id: payload.sub,
    email: payload.email,
    sessionId: payload.sid,
  };

  return true;
};

/** Requires a valid token; rejects requests without one. */
export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    if (!resolveUser(req)) {
      return next(UnauthorizedError("Authentication required."));
    }

    next();
  } catch (err) {
    next(err);
  }
};

/** Authenticates when a token is supplied; otherwise proceeds as anonymous. */
export const authenticateOptional = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    resolveUser(req);
    next();
  } catch (err) {
    next(err);
  }
};
