import { ApiMessages, HttpStatus } from "@/config/constants/index.js";

class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code?: string;
  public readonly isOperational?: boolean; // Indicates if the error is operational (expected) or a programming error (unexpected)
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
    code: string,
    details?: unknown,
  ) {
    super(message);

    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const BadRequestError = (details?: unknown) =>
  new ApiError(
    ApiMessages.CLIENT_ERROR.BAD_REQUEST,
    HttpStatus.BAD_REQUEST,
    "BAD_REQUEST",
    details,
  );

export const UnauthorizedError = () =>
  new ApiError(
    ApiMessages.CLIENT_ERROR.UNAUTHORIZED,
    HttpStatus.UNAUTHORIZED,
    "UNAUTHORIZED",
  );

export const ForbiddenError = () =>
  new ApiError(
    ApiMessages.CLIENT_ERROR.FORBIDDEN,
    HttpStatus.FORBIDDEN,
    "FORBIDDEN",
  );

export const NotFoundError = () =>
  new ApiError(
    ApiMessages.CLIENT_ERROR.NOT_FOUND,
    HttpStatus.NOT_FOUND,
    "NOT_FOUND",
  );

export const ConflictError = () =>
  new ApiError(
    ApiMessages.CLIENT_ERROR.CONFLICT,
    HttpStatus.CONFLICT,
    "CONFLICT",
  );

export const InternalServerError = (
  message: string = ApiMessages.SERVER_ERROR.INTERNAL_ERROR,
) => new ApiError(message, HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR");

export { ApiError };
