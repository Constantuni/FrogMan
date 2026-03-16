import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getWorkspaceById } from "../api/workspaces";
import AppShell from "../components/layout/AppShell";
import CreateProjectForm from "../components/projects/CreateProjectForm";
import ProjectList from "../components/projects/ProjectList";
import { useProjectStore } from "../store/projectStore";
import type {
  CreateProjectRequest,
  UpdateProjectRequest,
} from "../types/project";
import type { WorkspaceResponse } from "../types/workspace";

const WorkspacePage = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();

  const {
    projects,
    isLoading,
    error,
    fetchProjectsByWorkspace,
    addProject,
    editProject,
    removeProject,
  } = useProjectStore();

  const [workspace, setWorkspace] = useState<WorkspaceResponse | null>(null);
  const [workspaceLoading, setWorkspaceLoading] = useState(true);
  const [workspaceError, setWorkspaceError] = useState("");

  useEffect(() => {
    if (!workspaceId) return;

    const loadWorkspace = async () => {
      setWorkspaceLoading(true);
      setWorkspaceError("");

      try {
        const data = await getWorkspaceById(workspaceId);
        setWorkspace(data);
      } catch (err: any) {
        setWorkspaceError(err.response?.data?.message || "Failed to load workspace");
      } finally {
        setWorkspaceLoading(false);
      }
    };

    loadWorkspace();
    fetchProjectsByWorkspace(workspaceId);
  }, [workspaceId, fetchProjectsByWorkspace]);

  const handleCreateProject = async (payload: CreateProjectRequest) => {
    if (!workspaceId) return;
    await addProject(workspaceId, payload);
  };

  const handleUpdateProject = async (
    projectId: string,
    payload: UpdateProjectRequest
  ) => {
    if (!workspaceId) return;
    await editProject(workspaceId, projectId, payload);
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!workspaceId) return;
    await removeProject(workspaceId, projectId);
  };

  if (!workspaceId) {
    return (
      <div className="min-h-screen bg-slate-100 p-8">
        <p className="text-red-500">Workspace id is missing.</p>
      </div>
    );
  }

  const title = workspaceLoading
    ? "Loading workspace..."
    : workspaceError
      ? "Failed to load workspace"
      : (workspace?.name ?? "Workspace");

  const subtitle = workspaceError ? undefined : "Workspace board";

  return (
    <AppShell
      title={title}
      subtitle={subtitle}
      backTo="/dashboard"
      backLabel="Back to Dashboard"
    >
      {workspaceError && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
          {workspaceError}
        </div>
      )}

      <CreateProjectForm onCreate={handleCreateProject} />

      {isLoading && <p className="text-slate-600">Loading projects...</p>}
      {!isLoading && error && <p className="text-red-500">{error}</p>}

      {!isLoading && !error && (
        <ProjectList
          projects={projects}
          onOpen={(projectId) =>
            navigate(`/workspaces/${workspaceId}/projects/${projectId}`)
          }
          onUpdate={handleUpdateProject}
          onDelete={handleDeleteProject}
        />
      )}
    </AppShell>
  );
};

export default WorkspacePage;