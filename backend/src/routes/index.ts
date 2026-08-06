/**
 * @file index.ts
 *
 * @description Root API router. Collects every module router and mounts it
 * under its base path; the app serves this router at `/api/v1`.
 */

import architectureRouter from "@/modules/architecture/architecture.routes.js";
import { Router } from "express";

const router = Router();

router.use("/architectures", architectureRouter);

export default router;
