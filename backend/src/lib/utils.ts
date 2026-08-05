import { ConflictError } from "./apiError.js";

export const mapDbError = (error: unknown) => {
  if (isUniqueViolation(error)) {
    return ConflictError();
  }

  return error;
};

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
