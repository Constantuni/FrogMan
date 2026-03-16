import axiosInstance from "./axios";
import type { CreateProjectRequest, ProjectResponse } from "../types/project";

export async function getProjectsByWorkspace(workspaceId: string): Promise<ProjectResponse[]> {
  const response = await axiosInstance.get<ProjectResponse[]>(
    `/workspaces/${workspaceId}/projects`
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