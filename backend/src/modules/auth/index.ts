/**
 * @file index.ts
 *
 * @description Composition root for the auth module. Wires the repositories and
 * service into a singleton `authService` consumed by the controllers.
 */

import { AuthService } from "./auth.service.js";
import { SessionRepository } from "./session.repository.js";
import { UserRepository } from "./user.repository.js";

const userRepository = new UserRepository();
const sessionRepository = new SessionRepository();

/** Application-wide singleton AuthService instance. */
export const authService = new AuthService(
  userRepository,
  sessionRepository,
);
