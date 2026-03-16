import axiosInstance from "./axios";
import type { CreateWorkspaceRequest, WorkspaceResponse } from "../types/workspace";

export async function getWorkspaces(): Promise<WorkspaceResponse[]> {
  const response = await axiosInstance.get<WorkspaceResponse[]>("/workspaces");
  return response.data;
}

export async function getWorkspaceById(id: string): Promise<WorkspaceResponse> {
  const response = await axiosInstance.get<WorkspaceResponse>(`/workspaces/${id}`);
  return response.data;
}

export async function createWorkspace(
  payload: CreateWorkspaceRequest
): Promise<WorkspaceResponse> {
  const response = await axiosInstance.post<WorkspaceResponse>("/workspaces", payload);
  return response.data;
}

export async function updateWorkspace(
  id: string,
  payload: CreateWorkspaceRequest
): Promise<void> {
  await axiosInstance.put(`/workspaces/${id}`, payload);
}

export async function deleteWorkspace(id: string): Promise<void> {
  await axiosInstance.delete(`/workspaces/${id}`);
}