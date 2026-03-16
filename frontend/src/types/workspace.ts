export interface WorkspaceResponse {
  id: string;
  name: string;
  ownerUserId: string;
  createdAt: string;
}

export interface CreateWorkspaceRequest {
  name: string;
}