import { ArchitectureRepository } from "./architecture.repository.js";
import {
  CreateArchitectureDto,
  UpdateArchitectureDto,
} from "./architecture.dto.js";
import { Architecture } from "@/domain/architecture/architecture.types.js";
import { BadRequestError } from "@/lib/apiError.js";

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

  async update(id: string, data: UpdateArchitectureDto): Promise<Architecture> {
    const existing = await this.repository.findById(id);

    const { nodes, edges, ...fields } = data;

    if (Object.keys(fields).length === 0 && nodes === undefined && edges === undefined) {
      throw BadRequestError("No fields provided to update.");
    }

    const record = {
      ...fields,
      ...(nodes !== undefined || edges !== undefined
        ? {
            graph: {
              nodes: nodes ?? existing.graph.nodes,
              edges: edges ?? existing.graph.edges,
            },
          }
        : {}),
    };

    return this.repository.update(id, record);
  }

  async delete(id: string): Promise<Architecture> {
    return this.repository.delete(id);
  }
}
