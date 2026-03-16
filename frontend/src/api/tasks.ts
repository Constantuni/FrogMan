import axiosInstance from "./axios";
import type { CreateTaskRequest, TaskResponse } from "../types/task";

export async function getTasksByProject(projectId: string): Promise<TaskResponse[]> {
  const response = await axiosInstance.get<TaskResponse[]>(`/projects/${projectId}/tasks`);
  return response.data;
}

export async function createTask(
  projectId: string,
  payload: CreateTaskRequest
): Promise<TaskResponse> {
  const normalizedPayload = {
    ...payload,
    assignedToUserId: payload.assignedToUserId === "" ? null : payload.assignedToUserId,
    dueDate: payload.dueDate === "" ? null : payload.dueDate,
  };

  const response = await axiosInstance.post<TaskResponse>(
    `/projects/${projectId}/tasks`,
    normalizedPayload
  );
  return response.data;
}