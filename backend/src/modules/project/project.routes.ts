/**
 * @file project.routes.ts
 *
 * @description Express router mounting the project module's endpoints under a
 * single router, composed into the app by the root router. All routes require
 * authentication; write routes additionally validate their request bodies.
 */

import { Router } from "express";
import {
  createProject,
  deleteProject,
  getProjectById,
  getProjects,
  updateProject,
} from "./project.controller.js";
import { validate } from "@/middlewares/validate.js";
import {
  authenticate,
  authenticateOptional,
} from "@/middlewares/authenticate.js";
import { createProjectSchema, updateProjectSchema } from "./project.schema.js";

const projectRouter: Router = Router();

projectRouter
  .route("/")
  .get(authenticate, getProjects)
  .post(authenticate, validate(createProjectSchema), createProject);

projectRouter
  .route("/:id")
  .get(authenticateOptional, getProjectById)
  .patch(authenticate, validate(updateProjectSchema), updateProject)
  .delete(authenticate, deleteProject);

export default projectRouter;