import { create } from "zustand";
import { createWorkspace, getWorkspaces } from "../api/workspaces";
import type { WorkspaceResponse } from "../types/workspace";

interface WorkspaceState {
  workspaces: WorkspaceResponse[];
  isLoading: boolean;
  error: string | null;
  fetchWorkspaces: () => Promise<void>;
  addWorkspace: (name: string) => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  workspaces: [],
  isLoading: false,
  error: null,

  fetchWorkspaces: async () => {
    set({ isLoading: true, error: null });

    try {
      const workspaces = await getWorkspaces();
      set({ workspaces, isLoading: false });
    } catch (error) {
      set({ error: "Failed to load workspaces.", isLoading: false });
    }
  },

  addWorkspace: async (name: string) => {
    set({ isLoading: true, error: null });

    try {
      const created = await createWorkspace({ name });
      set((state) => ({
        workspaces: [created, ...state.workspaces],
        isLoading: false,
      }));
    } catch (error) {
      set({ error: "Failed to create workspace.", isLoading: false });
      throw error;
    }
  },
}));