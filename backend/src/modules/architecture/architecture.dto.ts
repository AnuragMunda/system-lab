import { ArchitectureNode } from "@/domain/architecture/component.types.js";
import { ArchitectureEdge } from "@/domain/architecture/connection.types.js";
import {
  architectureSchema,
  updateArchitectureSchema,
} from "./architecture.schema.js";
import { z } from "zod";

export type CreateArchitectureDto = z.infer<typeof architectureSchema>;
export type UpdateArchitectureDto = z.infer<typeof updateArchitectureSchema>;

export interface CreateArchitectureRecord {
  projectId: string;
  name: string;
  description?: string;

  graph: {
    nodes: ArchitectureNode[];
    edges: ArchitectureEdge[];
  };
}

export interface UpdateArchitectureRecord {
  name?: string;
  description?: string;

  graph?: {
    nodes: ArchitectureNode[];
    edges: ArchitectureEdge[];
  };
}
