import { Router } from "express";
import {
  createArchitecture,
  deleteArchitecture,
  getAllArchitectures,
  getArchitectureById,
  updateArchitecture,
} from "./architecture.controller.js";

const architectureRouter: Router = Router();

architectureRouter.route("/").get(getAllArchitectures).post(createArchitecture);
architectureRouter
  .route("/:id")
  .get(getArchitectureById)
  .patch(updateArchitecture)
  .delete(deleteArchitecture);

export default architectureRouter;
