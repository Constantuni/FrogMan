import { create } from "zustand";
import {
  createWorkspace,
  deleteWorkspace,
  getWorkspaces,
  updateWorkspace,
} from "../api/workspaces";
import { parseApiError } from "../api/errorHelper"; // Import our helper
import type {
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest,
  WorkspaceResponse,
} from "../types/workspace";

interface WorkspaceState {
  workspaces: WorkspaceResponse[];
  isLoading: boolean;
  error: string | null;
  fetchWorkspaces: () => Promise<void>;
  addWorkspace: (name: string) => Promise<void>;
  editWorkspace: (id: string, payload: UpdateWorkspaceRequest) => Promise<void>;
  removeWorkspace: (id: string) => Promise<void>;
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
      // Parse the standardized backend error
      const { title } = parseApiError(error);
      set({ error: title, isLoading: false });
    }
  },

  addWorkspace: async (name: string) => {
    set({ isLoading: true, error: null });

    try {
      const payload: CreateWorkspaceRequest = { name };
      const created = await createWorkspace(payload);

      set((state) => ({
        workspaces: [created, ...state.workspaces],
        isLoading: false,
      }));
    } catch (error) {
      const { title } = parseApiError(error);
      set({ error: title, isLoading: false });
      throw error; // Propagate the error so the UI can handle local states
    }
  },

  editWorkspace: async (id, payload) => {
    set({ isLoading: true, error: null });

    try {
      await updateWorkspace(id, payload);

      set((state) => ({
        workspaces: state.workspaces.map((workspace) =>
          workspace.id === id
            ? {
                ...workspace,
                name: payload.name,
              }
            : workspace
        ),
        isLoading: false,
      }));
    } catch (error) {
      const { title } = parseApiError(error);
      set({ error: title, isLoading: false });
      throw error;
    }
  },

  removeWorkspace: async (id) => {
    set({ isLoading: true, error: null });

    try {
      await deleteWorkspace(id);

      set((state) => ({
        workspaces: state.workspaces.filter((workspace) => workspace.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      const { title } = parseApiError(error);
      set({ error: title, isLoading: false });
      throw error;
    }
  },
}));