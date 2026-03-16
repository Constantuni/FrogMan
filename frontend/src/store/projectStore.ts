import { create } from "zustand";
import { createProject, getProjectsByWorkspace } from "../api/projects";
import type { ProjectResponse } from "../types/project";

interface ProjectState {
  projects: ProjectResponse[];
  isLoading: boolean;
  error: string | null;
  fetchProjectsByWorkspace: (workspaceId: string) => Promise<void>;
  addProject: (
    workspaceId: string,
    payload: { name: string; description?: string | null }
  ) => Promise<void>;
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
}));