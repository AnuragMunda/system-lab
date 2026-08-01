import { ArchitectureNode } from "./component.types.js";
import { ArchitectureEdge } from "./connection.types.js";

export interface Architecture {
  id: string;
  projectId: string;

  name: string;
  description?: string;

  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];

  createdAt: Date;
  updatedAt: Date;
}
