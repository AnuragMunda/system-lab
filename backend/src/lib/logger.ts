/**
 * This file sets up a logger using the Pino logging library.
 */

import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: {
    target: "pino-pretty",
  },
});
