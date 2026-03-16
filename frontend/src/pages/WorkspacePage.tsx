import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getWorkspaceById } from "../api/workspaces";
import { useProjectStore } from "../store/projectStore";
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
  } = useProjectStore();

  const [workspace, setWorkspace] = useState<WorkspaceResponse | null>(null);
  const [workspaceLoading, setWorkspaceLoading] = useState(true);
  const [workspaceError, setWorkspaceError] = useState("");

  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

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

  const handleCreateProject: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    if (!workspaceId) return;

    const trimmedName = projectName.trim();
    if (!trimmedName) return;

    setCreateError("");
    setCreating(true);

    try {
      await addProject(workspaceId, {
        name: trimmedName,
        description: projectDescription.trim() || null,
      });

      setProjectName("");
      setProjectDescription("");
    } catch (err: any) {
      setCreateError(err.response?.data?.message || "Failed to create project");
    } finally {
      setCreating(false);
    }
  };

  const handleOpenProject = (projectId: string) => {
    navigate(`/workspaces/${workspaceId}/projects/${projectId}`);
  };

  if (!workspaceId) {
    return (
      <div className="min-h-screen bg-slate-100 p-8">
        <p className="text-red-500">Workspace id is missing.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <button
              onClick={() => navigate("/dashboard")}
              className="mb-2 text-sm font-medium text-blue-600 hover:underline"
            >
              ← Back to Dashboard
            </button>

            {workspaceLoading ? (
              <h1 className="text-2xl font-bold text-slate-900">Loading workspace...</h1>
            ) : workspaceError ? (
              <h1 className="text-2xl font-bold text-red-500">Failed to load workspace</h1>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-slate-900">
                  {workspace?.name}
                </h1>
                <p className="text-sm text-slate-500">
                  Workspace board
                </p>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {workspaceError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
            {workspaceError}
          </div>
        )}

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Create Project
          </h2>

          <form onSubmit={handleCreateProject} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Project Name
              </label>
              <input
                type="text"
                placeholder="Enter project name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 outline-none transition focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Description
              </label>
              <textarea
                placeholder="Enter project description"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                className="min-h-[100px] w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 outline-none transition focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={creating}
              className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating ? "Creating..." : "Create Project"}
            </button>
          </form>

          {createError && (
            <p className="mt-3 text-sm text-red-500">{createError}</p>
          )}
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Projects</h2>
          </div>

          {isLoading && (
            <p className="text-slate-600">Loading projects...</p>
          )}

          {!isLoading && error && (
            <p className="text-red-500">{error}</p>
          )}

          {!isLoading && !error && projects.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
              No projects found in this workspace.
            </div>
          )}

          {!isLoading && !error && projects.length > 0 && (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => handleOpenProject(project.id)}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-blue-400 hover:shadow-md"
                >
                  <div className="mb-4">
                    <span className="rounded-xl bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
                      Project
                    </span>
                  </div>

                  <h3 className="mb-2 text-lg font-semibold text-slate-900 group-hover:text-blue-700">
                    {project.name}
                  </h3>

                  <p className="mb-4 min-h-[48px] text-sm text-slate-500">
                    {project.description || "No description provided."}
                  </p>

                  <p className="mb-4 text-xs text-slate-400">
                    Created at {new Date(project.createdAt).toLocaleString()}
                  </p>

                  <div className="text-sm font-medium text-blue-600">
                    Open project →
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default WorkspacePage;