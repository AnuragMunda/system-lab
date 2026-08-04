export const ApiMessages = Object.freeze({
  SUCCESS: {
    OK: "Request successful",
    CREATED: "Resource created successfully",
    UPDATED: "Resource updated successfully",
    DELETED: "Resource deleted successfully",
    FETCHED: "Resource fetched successfully",
  },

  CLIENT_ERROR: {
    BAD_REQUEST: "Invalid request data",
    UNAUTHORIZED: "Authentication required",
    FORBIDDEN: "You do not have permission to access this resource",
    NOT_FOUND: "Resource not found",
    CONFLICT: "Resource already exists",
    VALIDATION_FAILED: "Validation failed",
  },

  SERVER_ERROR: {
    INTERNAL_ERROR: "Something went wrong on the server",
    NOT_IMPLEMENTED: "Feature not implemented",
    SERVICE_UNAVAILABLE: "Service temporarily unavailable",
    DATABASE_ERROR: "Database operation failed",
  },
});
