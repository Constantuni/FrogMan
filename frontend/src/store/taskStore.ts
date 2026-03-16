// taskStore.ts
import { create } from "zustand";
import { createTask, getTasksByProject } from "../api/tasks";
import type { TaskResponse, CreateTaskRequest } from "../types/task";

interface TaskState {
  tasks: TaskResponse[];
  isLoading: boolean;
  error: string | null;
  fetchTasksByProject: (projectId: string) => Promise<void>;
  addTask: (projectId: string, payload: CreateTaskRequest) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  isLoading: false,
  error: null,

  fetchTasksByProject: async (projectId: string) => {
    set({ isLoading: true, error: null });

    try {
      const tasks = await getTasksByProject(projectId);
      set({ tasks, isLoading: false });
    } catch (error) {
      set({ error: "Failed to load tasks.", isLoading: false });
    }
  },

  addTask: async (projectId, payload) => {
    set({ isLoading: true, error: null });

    try {
      const created = await createTask(projectId, payload);
      set((state) => ({
        tasks: [created, ...state.tasks],
        isLoading: false,
      }));
    } catch (error) {
      set({ error: "Failed to create task.", isLoading: false });
      throw error;
    }
  },
}));