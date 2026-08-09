import { verifyAccessToken } from "@/infrastructure/auth/jwt.js";
import { UnauthorizedError } from "@/lib/apiError.js";
import type { NextFunction, Request, Response } from "express";

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return next(UnauthorizedError("Authentication required."));
  }

  const token = authorization.substring(7);

  try {
    const payload = verifyAccessToken(token);

    req.user = {
      id: payload.sub,
      email: payload.email,
      sessionId: payload.sid,
    };

    next();
  } catch (err) {
    next(err);
  }
};
