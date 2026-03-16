import axiosInstance from "./axios";
import type {
  CreateTaskRequest,
  TaskResponse,
  UpdateTaskRequest,
} from "../types/task";

function normalizeDueDate(dueDate?: string | null): string | null {
  if (!dueDate || dueDate.trim() === "") {
    return null;
  }

  return new Date(dueDate).toISOString();
}

export async function getTasksByProject(projectId: string): Promise<TaskResponse[]> {
  const response = await axiosInstance.get<TaskResponse[]>(
    `/projects/${projectId}/tasks`
  );
  return response.data;
}

export async function getTaskById(taskId: string): Promise<TaskResponse> {
  const response = await axiosInstance.get<TaskResponse>(`/tasks/${taskId}`);
  return response.data;
}

export async function createTask(
  projectId: string,
  payload: CreateTaskRequest
): Promise<TaskResponse> {
  const normalizedPayload = {
    ...payload,
    assignedToUserId:
      payload.assignedToUserId === "" ? null : payload.assignedToUserId,
    dueDate: normalizeDueDate(payload.dueDate),
  };

  const response = await axiosInstance.post<TaskResponse>(
    `/projects/${projectId}/tasks`,
    normalizedPayload
  );

  return response.data;
}

export async function updateTask(
  taskId: string,
  payload: UpdateTaskRequest
): Promise<void> {
  const normalizedPayload = {
    ...payload,
    assignedToUserId:
      payload.assignedToUserId === "" ? null : payload.assignedToUserId,
    dueDate: normalizeDueDate(payload.dueDate),
  };

  await axiosInstance.put(`/tasks/${taskId}`, normalizedPayload);
}

export async function deleteTask(taskId: string): Promise<void> {
  await axiosInstance.delete(`/tasks/${taskId}`);
}