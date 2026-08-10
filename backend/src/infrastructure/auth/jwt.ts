/**
 * @file jwt.ts
 *
 * @description Access and refresh token signing/verification. Refresh tokens
 * carry a unique `jti` so every issuance is distinct, which keeps rotation
 * effective even when tokens are signed within the same second.
 */

import { randomUUID } from "node:crypto";
import jwt, { type Secret, type SignOptions } from "jsonwebtoken";

import { env } from "@/config/env.js";
import { UnauthorizedError } from "@/lib/apiError.js";
import z from "zod";

/** Claims embedded in every signed token. */
export interface CustomJwtPayload {
  sub: string;
  email: string;
  sid: string;
}

const jwtConfig = {
  access: {
    secret: env.JWT_ACCESS_SECRET,
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  },
  refresh: {
    secret: env.JWT_REFRESH_SECRET,
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  },
} as const;

/**
 * Access Token
 */

/** Signs a short-lived access token. */
export const signAccessToken = (payload: CustomJwtPayload): string => {
  return signToken(payload, jwtConfig.access.secret, {
    expiresIn: jwtConfig.access.expiresIn,
  });
};

/** Verifies an access token, throwing UnauthorizedError when invalid. */
export const verifyAccessToken = (token: string): CustomJwtPayload => {
  return verifyToken(
    token,
    jwtConfig.access.secret,
    "Invalid or expired access token.",
  );
};

/**
 * Refresh Token
 */

/**
 * Signs a refresh token with a unique `jti`, guaranteeing two tokens issued in
 * the same second (same iat) still differ.
 */
export const signRefreshToken = (payload: CustomJwtPayload): string => {
  return signToken(payload, jwtConfig.refresh.secret, {
    expiresIn: jwtConfig.refresh.expiresIn,
    jwtid: randomUUID(),
  });
};

/** Verifies a refresh token, throwing UnauthorizedError when invalid. */
export const verifyRefreshToken = (token: string): CustomJwtPayload => {
  return verifyToken(
    token,
    jwtConfig.refresh.secret,
    "Invalid or expired refresh token.",
  );
};

/**
 * Helper Functions
 */

const jwtPayloadSchema = z.object({
  sub: z.string(),
  email: z.email(),
  sid: z.string(),
});

/** Low-level signing helper shared by access and refresh tokens. */
function signToken(
  payload: CustomJwtPayload,
  secret: Secret,
  options: SignOptions,
): string {
  return jwt.sign(payload, secret, options);
}

/**
 * Verifies a token's signature and shape, mapping expired/invalid/parse errors
 * to an UnauthorizedError.
 */
function verifyToken(
  token: string,
  secret: Secret,
  errorMsg: string,
): CustomJwtPayload {
  try {
    const decoded = jwt.verify(token, secret);
    return jwtPayloadSchema.parse(decoded);
  } catch (error) {
    if (
      error instanceof jwt.TokenExpiredError ||
      error instanceof jwt.JsonWebTokenError ||
      error instanceof z.ZodError
    ) {
      throw UnauthorizedError(errorMsg);
    }

    throw error;
  }
}
