/**
 * @file utils.ts
 *
 * @description Small shared helpers used across repositories and services.
 * Currently provides database-error translation.
 */

import { ConflictError } from "./apiError.js";

/**
 * Translates known database errors into API errors. Unknown errors are passed
 * through unchanged so they surface as unexpected failures.
 */
export const mapDbError = (error: unknown) => {
  if (isUniqueViolation(error)) {
    return ConflictError();
  }

  return error;
};

/**
 * Checks whether an error is a PostgreSQL unique constraint violation
 * (SQLSTATE 23505). Walks nested `cause` chains to support wrapped drivers.
 */
const isUniqueViolation = (error: unknown): boolean => {
  let current: unknown = error;

  while (typeof current === "object" && current !== null) {
    const candidate = current as { code?: unknown; cause?: unknown };

    if (candidate.code === "23505") {
      return true;
    }

    current = candidate.cause;
  }

  return false;
};
