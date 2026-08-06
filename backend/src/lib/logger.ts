/**
 * @file logger.ts
 *
 * @description Configures the application-wide logger using Pino, with
 * human-friendly output via the pino-pretty transport during development.
 */

import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: {
    target: "pino-pretty",
  },
});
