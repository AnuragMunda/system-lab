/**
 * @author Anurag Munda
 *
 * @file app.ts
 * @description Application instance responsible for defining routes, middlewares, and application logic.
 */

import express, { type Response } from "express";
import cors from "cors";
import { pinoHttp } from "pino-http";

import { logger } from "./lib/logger.js";
import router from "./routes/index.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";

const app = express();
const httpLogger = pinoHttp({ logger });

// Middlewares
app.use(express.json());
app.use(cors());
app.use(httpLogger);

// Version:1 Routes
app.use("/api/v1", router);

// Default routes
app.get("/", (_, res: Response) => {
  res.status(200).json({ message: "Welcome to the System Lab API!" });
});

app.get("/health", (_, res: Response) => {
  res.status(200).json({ status: "OK", message: "Server is healthy." });
});

/// Global Error Handler
app.use(errorMiddleware);

export default app;
