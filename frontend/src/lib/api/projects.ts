// Project API surface — list + create against `/api/v1/projects`.
// Returns the backend `Project` shape; callers map it to the dashboard view model.
import { apiFetch } from "./http";

// Raw project as returned by the backend (ISO date strings over JSON).
export interface BackendProject {
  id: string;
  ownerId: string;
  name: string;
  description: string | null;
  visibility: "PRIVATE" | "PUBLIC" | "UNLISTED";
  createdAt: string;
  updatedAt: string;
}

// Payload accepted by POST /api/v1/projects.
export interface CreateProjectInput {
  name: string;
  description?: string;
  visibility: "PRIVATE" | "PUBLIC" | "UNLISTED";
}

// Payload accepted by PATCH /api/v1/projects/:id — all fields optional.
export type UpdateProjectInput = Partial<CreateProjectInput>;

// Paginated envelope returned by GET /api/v1/projects.
interface PaginatedProjects {
  items: BackendProject[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

// Fetches the authenticated user's projects. A single large page is requested so
// the client-side toolbar can search/sort/filter without refetching.
export async function listProjectsApi(): Promise<BackendProject[]> {
  const data = await apiFetch<PaginatedProjects>(
    "/api/v1/projects?page=1&limit=100",
  );
  return data.items;
}

// Creates a new project owned by the authenticated user.
export async function createProjectApi(
  input: CreateProjectInput,
): Promise<BackendProject> {
  return apiFetch<BackendProject>("/api/v1/projects", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// Updates an existing project (name/description/visibility) owned by the user.
export async function updateProjectApi(
  id: string,
  input: UpdateProjectInput,
): Promise<BackendProject> {
  return apiFetch<BackendProject>(`/api/v1/projects/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

// Deletes a project owned by the user. Returns the deleted project (ignored caller-side).
export async function deleteProjectApi(id: string): Promise<BackendProject> {
  return apiFetch<BackendProject>(`/api/v1/projects/${id}`, {
    method: "DELETE",
  });
}

// Fetches a single project by id (used by the project workspace header).
export async function getProjectApi(id: string): Promise<BackendProject> {
  return apiFetch<BackendProject>(`/api/v1/projects/${id}`);
}
