import architectureRouter from "@/modules/architecture/architecture.routes.js";
import { Router } from "express";

const router = Router();

router.use("/architectures", architectureRouter);

export default router;
