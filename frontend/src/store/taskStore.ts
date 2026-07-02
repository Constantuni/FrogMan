import { create } from "zustand";
import {
  createTask,
  deleteTask,
  getTasksByProject,
  updateTask,
} from "../api/tasks";
import { parseApiError } from "../api/errorHelper";
import type {
  CreateTaskRequest,
  TaskResponse,
  UpdateTaskRequest,
} from "../types/task";

interface TaskState {
  tasks: TaskResponse[];
  isLoading: boolean;
  error: string | null;
  fetchTasksByProject: (projectId: string) => Promise<void>;
  addTask: (projectId: string, payload: CreateTaskRequest) => Promise<void>;
  editTask: (taskId: string, payload: UpdateTaskRequest) => Promise<void>;
  removeTask: (taskId: string) => Promise<void>;
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
      const { title } = parseApiError(error);
      set({ error: title, isLoading: false });
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
      const { title } = parseApiError(error);
      set({ error: title, isLoading: false });
      throw error;
    }
  },

  editTask: async (taskId, payload) => {
    set({ isLoading: true, error: null });

    try {
      await updateTask(taskId, payload);

      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                title: payload.title,
                description: payload.description ?? null,
                status: payload.status,
                priority: payload.priority,
                assignedToUserId: payload.assignedToUserId ?? null,
                dueDate: payload.dueDate ?? null,
                updatedAt: new Date().toISOString(),
              }
            : task
        ),
        isLoading: false,
      }));
    } catch (error) {
      const { title } = parseApiError(error);
      set({ error: title, isLoading: false });
      throw error;
    }
  },

  removeTask: async (taskId) => {
    set({ isLoading: true, error: null });

    try {
      await deleteTask(taskId);

      set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== taskId),
        isLoading: false,
      }));
    } catch (error) {
      const { title } = parseApiError(error);
      set({ error: title, isLoading: false });
      throw error;
    }
  },
}));