/**
 * @file architecture.routes.ts
 *
 * @description Express router mounting the architecture module's endpoints
 * under a single router, composed into the app by the root router.
 */

import { Router } from "express";
import {
  createArchitecture,
  deleteArchitecture,
  getAllArchitectures,
  getArchitectureById,
  updateArchitecture,
} from "./architecture.controller.js";
import { validate } from "@/middlewares/validate.js";
import { authenticate } from "@/middlewares/authenticate.js";
import {
  architectureSchema,
  updateArchitectureSchema,
} from "./architecture.schema.js";

const architectureRouter: Router = Router();

architectureRouter
  .route("/")
  .get(getAllArchitectures)
  .post(authenticate, validate(architectureSchema), createArchitecture);

architectureRouter
  .route("/:id")
  .get(getArchitectureById)
  .patch(authenticate, validate(updateArchitectureSchema), updateArchitecture)
  .delete(authenticate, deleteArchitecture);

export default architectureRouter;
