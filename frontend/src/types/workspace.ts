export interface WorkspaceResponse {
  id: string;
  name: string;
  ownerUserId: string;
  createdAt: string;
}

export interface CreateWorkspaceRequest {
  name: string;
}

export interface UpdateWorkspaceRequest {
  name: string;
}

export interface WorkspaceMemberResponse {
  userId: string;
  name: string;
  email: string;
  role: string;
  joinedAt: string;
}