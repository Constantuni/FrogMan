import { create } from "zustand";
import {
  createProject,
  deleteProject,
  getProjectsByWorkspace,
  updateProject,
} from "../api/projects";
import type {
  CreateProjectRequest,
  ProjectResponse,
  UpdateProjectRequest,
} from "../types/project";

interface ProjectState {
  projects: ProjectResponse[];
  isLoading: boolean;
  error: string | null;
  fetchProjectsByWorkspace: (workspaceId: string) => Promise<void>;
  addProject: (workspaceId: string, payload: CreateProjectRequest) => Promise<void>;
  editProject: (
    workspaceId: string,
    projectId: string,
    payload: UpdateProjectRequest
  ) => Promise<void>;
  removeProject: (workspaceId: string, projectId: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  isLoading: false,
  error: null,

  fetchProjectsByWorkspace: async (workspaceId: string) => {
    set({ isLoading: true, error: null });

    try {
      const projects = await getProjectsByWorkspace(workspaceId);
      set({ projects, isLoading: false });
    } catch (error) {
      set({ error: "Failed to load projects.", isLoading: false });
    }
  },

  addProject: async (workspaceId, payload) => {
    set({ isLoading: true, error: null });

    try {
      const created = await createProject(workspaceId, payload);
      set((state) => ({
        projects: [created, ...state.projects],
        isLoading: false,
      }));
    } catch (error) {
      set({ error: "Failed to create project.", isLoading: false });
      throw error;
    }
  },

  editProject: async (workspaceId, projectId, payload) => {
    set({ isLoading: true, error: null });

    try {
      await updateProject(workspaceId, projectId, payload);

      set((state) => ({
        projects: state.projects.map((project) =>
          project.id === projectId
            ? {
                ...project,
                name: payload.name,
                description: payload.description ?? null,
              }
            : project
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: "Failed to update project.", isLoading: false });
      throw error;
    }
  },

  removeProject: async (workspaceId, projectId) => {
    set({ isLoading: true, error: null });

    try {
      await deleteProject(workspaceId, projectId);

      set((state) => ({
        projects: state.projects.filter((project) => project.id !== projectId),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: "Failed to delete project.", isLoading: false });
      throw error;
    }
  },
}));