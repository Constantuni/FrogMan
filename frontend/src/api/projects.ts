import axiosInstance from "./axios";
import type { CreateProjectRequest, ProjectResponse } from "../types/project";

export async function getProjectsByWorkspace(
  workspaceId: string
): Promise<ProjectResponse[]> {
  const response = await axiosInstance.get<ProjectResponse[]>(
    `/workspaces/${workspaceId}/projects`
  );
  return response.data;
}

export async function getProjectById(
  workspaceId: string,
  projectId: string
): Promise<ProjectResponse> {
  const response = await axiosInstance.get<ProjectResponse>(
    `/workspaces/${workspaceId}/projects/${projectId}`
  );
  return response.data;
}

export async function createProject(
  workspaceId: string,
  payload: CreateProjectRequest
): Promise<ProjectResponse> {
  const response = await axiosInstance.post<ProjectResponse>(
    `/workspaces/${workspaceId}/projects`,
    payload
  );
  return response.data;
}

export async function updateProject(
  workspaceId: string,
  projectId: string,
  payload: CreateProjectRequest
): Promise<void> {
  await axiosInstance.put(
    `/workspaces/${workspaceId}/projects/${projectId}`,
    payload
  );
}

export async function deleteProject(
  workspaceId: string,
  projectId: string
): Promise<void> {
  await axiosInstance.delete(`/workspaces/${workspaceId}/projects/${projectId}`);
}