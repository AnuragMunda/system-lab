import { ArchitectureNode } from "./component.types.js";
import { ArchitectureEdge } from "./connection.types.js";

/**
 * An architecture represents the structure of a software system, including its components (nodes) and the connections (edges) between them.
 * It is associated with a specific project and contains metadata.
 */
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
