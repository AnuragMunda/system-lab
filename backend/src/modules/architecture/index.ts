/**
 * @file index.ts
 *
 * @description Wires the architecture module's dependencies together (manual
 * DI): a repository instance is constructed and injected into the service.
 * Controllers import the ready-to-use singleton service from here.
 */

import { ArchitectureRepository } from "./architecture.repository.js";
import { ArchitectureService } from "./architecture.service.js";

const repository = new ArchitectureRepository();
export const architectureService = new ArchitectureService(repository);
