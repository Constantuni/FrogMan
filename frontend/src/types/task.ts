import type { TaskStatus, TaskPriority } from "./taskEnums";

export interface TaskResponse {
  id: string;
  projectId: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  createdByUserId: string;
  assignedToUserId?: string | null;
  dueDate?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CreateTaskRequest {
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assignedToUserId?: string | null;
  dueDate?: string | null;
}

export interface UpdateTaskRequest {
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assignedToUserId?: string | null;
  dueDate?: string | null;
}