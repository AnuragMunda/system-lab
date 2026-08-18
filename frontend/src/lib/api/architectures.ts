// Architecture API surface — list/create/delete against `/api/v1/architectures`.
// Architectures belong to a project; the graph (nodes + edges) is stored as JSONB.
import { apiFetch } from "./http";

// Raw architecture as returned by the backend (ISO date strings over JSON).
// `graph.nodes` is the source of truth for the architecture's component count.
export interface BackendArchitecture {
  id: string;
  projectId: string;
  name: string;
  description: string | null;
  graph: { nodes: unknown[]; edges: unknown[] };
  createdAt: string;
  updatedAt: string;
}

// Payload accepted by POST /api/v1/architectures. The backend requires nodes/edges
// arrays (they may be empty for a blank architecture) and a name.
export interface CreateArchitectureInput {
  projectId: string;
  name: string;
  description?: string;
  nodes?: unknown[];
  edges?: unknown[];
}

// Envelope returned by GET /api/v1/architectures (paginated).
interface PaginatedArchitectures {
  items: BackendArchitecture[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

// Fetches the caller's architectures for a project. A single large page is
// requested so the workspace can render every card without paging.
export async function listArchitecturesApi(
  projectId: string,
): Promise<BackendArchitecture[]> {
  const data = await apiFetch<PaginatedArchitectures>(
    `/api/v1/architectures?projectId=${encodeURIComponent(projectId)}&page=1&limit=100`,
  );
  return data.items;
}

// Creates a new architecture owned by the authenticated user.
export async function createArchitectureApi(
  input: CreateArchitectureInput,
): Promise<BackendArchitecture> {
  return apiFetch<BackendArchitecture>("/api/v1/architectures", {
    method: "POST",
    body: JSON.stringify({
      projectId: input.projectId,
      name: input.name,
      description: input.description,
      nodes: input.nodes ?? [],
      edges: input.edges ?? [],
    }),
  });
}

// Deletes an architecture owned by the user.
export async function deleteArchitectureApi(id: string): Promise<BackendArchitecture> {
  return apiFetch<BackendArchitecture>(`/api/v1/architectures/${id}`, {
    method: "DELETE",
  });
}
