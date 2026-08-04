import { ArchitectureRepository } from "./architecture.repository.js";
import { CreateArchitectureDto } from "./architecture.dto.js";
import { Architecture } from "@/domain/architecture/architecture.types.js";

export class ArchitectureService {
  constructor(private readonly repository: ArchitectureRepository) {}

  async create(data: CreateArchitectureDto): Promise<Architecture> {
    const architecture = this.repository.create({
      projectId: data.projectId,
      name: data.name,
      description: data.description,
      graph: {
        nodes: data.nodes,
        edges: data.edges,
      },
    });

    return architecture;
  }

  async getAllArchitectures(): Promise<Architecture[]> {
    return this.repository.findAll();
  }
}
