import { Router } from "express";
import {
  createArchitecture,
  getAllArchitectures,
} from "./architecture.controller.js";

const architectureRouter: Router = Router();

architectureRouter.route("/").get(getAllArchitectures).post(createArchitecture);

export default architectureRouter;
