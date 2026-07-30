import express, { type Response } from "express";
import cors from "cors";
import pinoHttp from "pino-http";

import { logger } from "./lib/logger.js";

const app = express();
const httpLogger = pinoHttp({ logger });

// Middlewares
app.use(express.json());
app.use(cors());
app.use(httpLogger);

// Routes
app.get("/", (req, res: Response) => {
  res.status(200).json({ message: "Welcome to the System Lab API!" });
});

app.get("/health", (_, res: Response) => {
  res.status(200).json({ status: "OK", message: "Server is healthy." });
});

export default app;
