/**
 * @file auth.routes.ts
 *
 * @description Express router for auth endpoints. Token-issuing endpoints
 * (register/login/refresh) are public; session endpoints are protected by the
 * `authenticate` middleware.
 */

import { Router } from "express";

import {
  registerUser,
  login,
  refresh,
  logout,
  logoutAll,
  me,
} from "./auth.controller.js";

import { authenticate } from "@/middlewares/authenticate.js";
import { loginSchema, registerSchema } from "./auth.schema.js";
import { validate } from "@/middlewares/validate.js";

/** Router wiring the auth controllers, validators, and auth middleware. */
const authRouter: Router = Router();

authRouter.post("/register", validate(registerSchema), registerUser);
authRouter.post("/login", validate(loginSchema), login);
authRouter.post("/refresh", refresh);

authRouter.post("/logout", authenticate, logout);
authRouter.post("/logout-all", authenticate, logoutAll);

authRouter.get("/me", authenticate, me);

export default authRouter;
