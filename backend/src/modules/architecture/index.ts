/**
 * @file index.ts
 *
 * @description Wires the architecture module's dependencies together (manual
 * DI): repository instances are constructed and injected into the service.
 * Controllers import the ready-to-use singleton service from here.
 */

import { ArchitectureRepository } from "./architecture.repository.js";
import { ArchitectureService } from "./architecture.service.js";
import { ProjectRepository } from "../project/project.repository.js";

const repository = new ArchitectureRepository();
const projectRepository = new ProjectRepository();
export const architectureService = new ArchitectureService(
  repository,
  projectRepository,
);