// Projects store: holds the current user's projects fetched from the backend and
// supports creating new ones. The backend `Project` is mapped to the dashboard
// view model, which the backend doesn't yet populate (architectures/metrics/health).
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { Project, ProjectVisibility } from "@/data/dashboard-data";
import {
  createProjectApi,
  deleteProjectApi,
  listProjectsApi,
  updateProjectApi,
  type BackendProject,
  type CreateProjectInput,
  type UpdateProjectInput,
} from "@/lib/api/projects";
import { formatRelativeTime } from "@/lib/utils";
import type { RootState } from "./index";

// Load state for the projects collection.
export type ProjectsStatus = "idle" | "loading" | "succeeded" | "failed";

// Slice state: the list of projects plus request status/error.
interface ProjectsState {
  items: Project[];
  status: ProjectsStatus;
  error: string | null;
}

const initialState: ProjectsState = {
  items: [],
  status: "idle",
  error: null,
};

// Maps a backend project to the dashboard view model. `ownerName` comes from the
// authenticated user, since the backend only returns the owner id.
function toProjectView(raw: BackendProject, ownerName: string): Project {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description ?? "",
    health: "healthy",
    architectures: [],
    componentCount: 0,
    simulationCount: 0,
    experimentCount: 0,
    owner: ownerName,
    lastActivity: formatRelativeTime(raw.updatedAt),
    activityRank: -new Date(raw.updatedAt).getTime(),
    visibility: raw.visibility.toLowerCase() as ProjectVisibility,
  };
}

// Loads the user's projects from the backend.
export const fetchProjects = createAsyncThunk<Project[], void>(
  "projects/fetch",
  async (_, { getState }) => {
    const raw = await listProjectsApi();
    const user = (getState() as RootState).auth.user;
    const ownerName = user?.name ?? "You";
    return raw.map((project) => toProjectView(project, ownerName));
  },
);

// Creates a project and prepends the mapped result to the list.
export const createProject = createAsyncThunk<Project, CreateProjectInput>(
  "projects/create",
  async (input, { getState }) => {
    const raw = await createProjectApi(input);
    const user = (getState() as RootState).auth.user;
    const ownerName = user?.name ?? "You";
    return toProjectView(raw, ownerName);
  },
);

// Updates a project's name/description/visibility and replaces the stored item.
export const updateProject = createAsyncThunk<
  Project,
  { id: string; input: UpdateProjectInput }
>("projects/update", async ({ id, input }, { getState }) => {
  const raw = await updateProjectApi(id, input);
  const user = (getState() as RootState).auth.user;
  const ownerName = user?.name ?? "You";
  return toProjectView(raw, ownerName);
});

// Deletes a project owned by the user; the fulfilled case removes it from the list.
export const deleteProject = createAsyncThunk<void, string>(
  "projects/delete",
  async (id) => {
    await deleteProjectApi(id);
  },
);

const projectsSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Failed to load projects.";
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.items = [action.payload, ...state.items];
        state.status = "succeeded";
      })
      .addCase(createProject.rejected, (state, action) => {
        state.error = action.error.message ?? "Failed to create project.";
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        const index = state.items.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
        state.status = "succeeded";
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.error = action.error.message ?? "Failed to update project.";
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p.id !== action.meta.arg);
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.error = action.error.message ?? "Failed to delete project.";
      });
  },
});

export default projectsSlice.reducer;
