// index.ts

import { ArchitectureRepository } from "./architecture.repository.js";
import { ArchitectureService } from "./architecture.service.js";

const repository = new ArchitectureRepository();
export const architectureService = new ArchitectureService(repository);
