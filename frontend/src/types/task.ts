export interface TaskResponse {
  id: string;
  projectId: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  createdByUserId: string;
  assignedToUserId?: string | null;
  dueDate?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CreateTaskRequest {
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  assignedToUserId?: string | null;
  dueDate?: string | null;
}