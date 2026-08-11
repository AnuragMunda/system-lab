/**
 * @file index.ts
 *
 * @description Wires the project module's dependencies together (manual DI): a
 * repository instance is constructed and injected into the service. Controllers
 * import the ready-to-use singleton service from here.
 */

import { ProjectRepository } from "./project.repository.js";
import { ProjectService } from "./project.service.js";

const repository = new ProjectRepository();
export const projectService = new ProjectService(repository);
