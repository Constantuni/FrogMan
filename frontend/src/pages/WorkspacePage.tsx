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
import { useWorkspaceStore } from "../store/workspaceStore"; // Import workspace store
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

  // Extract the fetchMembers action from the workspace store
  const { fetchMembers } = useWorkspaceStore();

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
      } catch (err) {
        // Standardized Problem Details parsing
        const { title } = parseApiError(err);
        setWorkspaceError(title);
      } finally {
        setWorkspaceLoading(false);
      }
    };

    loadWorkspace();
    fetchProjectsByWorkspace(workspaceId);
    
    // Fire the API dispatch to populate the directory roster right on page load/refresh
    fetchMembers(workspaceId);
  }, [workspaceId, fetchProjectsByWorkspace, fetchMembers]); // Added fetchMembers to dependencies

  const handleCreateProject = async (payload: CreateProjectRequest) => {
    if (!workspaceId) return;
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
    if (!workspaceId) return;
    try {
      await editProject(workspaceId, projectId, payload);
    } catch (err) {
      // Handle update errors gracefully
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!workspaceId) return;
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
      {/* Standardized Workspace Fetch Error */}
      {workspaceError && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
          {workspaceError}
        </div>
      )}

      {/* TOP SECTION: Create Project Form stays full-width right on top */}
      {!workspaceError && !workspaceLoading && (
        <div className="mb-6">
          <CreateProjectForm onCreate={handleCreateProject} />
        </div>
      )}

      {/* BOTTOM SECTION: Two-column grid split for layout components */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 items-start">
        
        {/* LEFT SIDEBAR COLUMN: Compact Member Management with max-width defense */}
        <div className="lg:col-span-1 w-full max-w-md lg:sticky lg:top-6">
          {!workspaceError && !workspaceLoading && (
            <AddMemberForm workspaceId={workspaceId} />
          )}
        </div>

        {/* RIGHT MAIN COLUMN: Project Feed Index List */}
        <div className="lg:col-span-2">
          {isLoading && (
            <p className="text-slate-600 bg-white p-6 rounded-2xl border border-slate-200">
              Loading projects...
            </p>
          )}
          
          {!isLoading && error && (
            <div className="my-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
              {error}
            </div>
          )}

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
        </div>

      </div>
    </AppShell>
  );
};

export default WorkspacePage;