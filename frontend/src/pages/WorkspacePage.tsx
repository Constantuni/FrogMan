// WorkspacePage.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getWorkspaceById } from "../api/workspaces";
import { parseApiError } from "../api/errorHelper";
import AppShell from "../components/layout/AppShell";
import CreateProjectForm from "../components/projects/CreateProjectForm";
import ProjectList from "../components/projects/ProjectList";
import { AddMemberForm } from "../components/workspaces/AddMemberForm";
import { useProjectStore } from "../store/projectStore";
import { useWorkspaceStore } from "../store/workspaceStore"; 
import { useAuthStore } from "../store/authStore"; 
import type {
  CreateProjectRequest,
  UpdateProjectRequest,
} from "../types/project";
import type { WorkspaceResponse } from "../types/workspace";

const WorkspacePage = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();

  // Project store actions
  const {
    projects,
    isLoading,
    error,
    fetchProjectsByWorkspace,
    addProject,
    editProject,
    removeProject,
  } = useProjectStore();

  // Extracted isLoadingMembers state to prevent early UI lockouts
  const { fetchMembers, currentMembers, isLoadingMembers } = useWorkspaceStore();
  const { user } = useAuthStore();

  const [workspace, setWorkspace] = useState<WorkspaceResponse | null>(null);
  const [workspaceLoading, setWorkspaceLoading] = useState(true);
  const [workspaceError, setWorkspaceError] = useState("");

  // Computed permission check
  const currentUserMembership = currentMembers?.find((m) => m.userId === user?.id);
  const currentUserRole = currentUserMembership?.role;
  const canManageProjects = currentUserRole === "Owner" || currentUserRole === "Admin";

  useEffect(() => {
    if (!workspaceId) return;

    const loadWorkspace = async () => {
      setWorkspaceLoading(true);
      setWorkspaceError("");

      try {
        const data = await getWorkspaceById(workspaceId);
        setWorkspace(data);
      } catch (err) {
        const { title } = parseApiError(err);
        setWorkspaceError(title);
      } finally {
        setWorkspaceLoading(false);
      }
    };

    loadWorkspace();
    fetchProjectsByWorkspace(workspaceId);
    fetchMembers(workspaceId);
  }, [workspaceId, fetchProjectsByWorkspace, fetchMembers]);

  const handleCreateProject = async (payload: CreateProjectRequest) => {
    if (!workspaceId || !canManageProjects) return;
    try {
      await addProject(workspaceId, payload);
    } catch (err) {
      // Handle creation errors gracefully
    }
  };

  const handleUpdateProject = async (
    projectId: string,
    payload: UpdateProjectRequest
  ) => {
    if (!workspaceId || !canManageProjects) return;
    try {
      await editProject(workspaceId, projectId, payload);
    } catch (err) {
      // Handle update errors gracefully
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!workspaceId || !canManageProjects) return;
    try {
      await removeProject(workspaceId, projectId);
    } catch (err) {
      // Handle delete errors gracefully
    }
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

      {/* Render CreateProjectForm unconditionally once base loading states clear, passing permission flag down */}
      {!workspaceError && !workspaceLoading && !isLoadingMembers && (
        <div className="mb-6">
          <CreateProjectForm onCreate={handleCreateProject} disabled={!canManageProjects} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 items-start">
        
        {/* LEFT SIDEBAR COLUMN */}
        <div className="lg:col-span-1 w-full max-w-md lg:sticky lg:top-6">
          {workspaceLoading || isLoadingMembers ? (
            <div className="p-6 bg-white rounded-2xl border border-slate-200 text-slate-400 italic text-sm animate-pulse">
              Loading workspace settings...
            </div>
          ) : (
            !workspaceError && <AddMemberForm workspaceId={workspaceId} />
          )}
        </div>

        {/* RIGHT MAIN COLUMN */}
        <div className="lg:col-span-2">
          {isLoading || isLoadingMembers ? (
            <p className="text-slate-600 bg-white p-6 rounded-2xl border border-slate-200">
              Loading projects...
            </p>
          ) : error ? (
            <div className="my-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
              {error}
            </div>
          ) : (
            <ProjectList
              projects={projects}
              onOpen={(projectId) =>
                navigate(`/workspaces/${workspaceId}/projects/${projectId}`)
              }
              onUpdate={handleUpdateProject}
              onDelete={handleDeleteProject}
              canManage={canManageProjects}
            />
          )}
        </div>

      </div>
    </AppShell>
  );
};

export default WorkspacePage;