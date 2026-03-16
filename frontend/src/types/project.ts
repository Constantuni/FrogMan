export interface ProjectResponse {
  id: string;
  name: string;
  description?: string | null;
  workspaceId: string;
  createdByUserId: string;
  createdAt: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string | null;
}