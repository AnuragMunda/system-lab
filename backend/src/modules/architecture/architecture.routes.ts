import { Router } from "express";
import {
  createArchitecture,
  deleteArchitecture,
  getAllArchitectures,
  updateArchitecture,
} from "./architecture.controller.js";

const architectureRouter: Router = Router();

architectureRouter.route("/").get(getAllArchitectures).post(createArchitecture);
architectureRouter
  .route("/:id")
  .patch(updateArchitecture)
  .delete(deleteArchitecture);

export default architectureRouter;
