import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTaskStore } from "../store/taskStore";
import { getProjectsByWorkspace } from "../api/projects";
import type { ProjectResponse } from "../types/project";
import type { CreateTaskRequest, TaskResponse } from "../types/task";

const statusColumns = ["ToDo", "InProgress", "Done"];

const priorityOptions = ["Low", "Medium", "High"];

const ProjectPage = () => {
  const { workspaceId, projectId } = useParams<{
    workspaceId: string;
    projectId: string;
  }>();
  const navigate = useNavigate();

  const { tasks, isLoading, error, fetchTasksByProject, addTask } = useTaskStore();

  const [project, setProject] = useState<ProjectResponse | null>(null);
  const [projectLoading, setProjectLoading] = useState(true);
  const [projectError, setProjectError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("ToDo");
  const [priority, setPriority] = useState("Medium");
  const [assignedToUserId, setAssignedToUserId] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  useEffect(() => {
    if (!workspaceId || !projectId) return;

    const loadProject = async () => {
      setProjectLoading(true);
      setProjectError("");

      try {
        const projects = await getProjectsByWorkspace(workspaceId);
        const foundProject = projects.find((p) => p.id === projectId) ?? null;

        if (!foundProject) {
          setProjectError("Project not found.");
          setProject(null);
        } else {
          setProject(foundProject);
        }
      } catch (err: any) {
        setProjectError(err.response?.data?.message || "Failed to load project");
      } finally {
        setProjectLoading(false);
      }
    };

    loadProject();
    fetchTasksByProject(projectId);
  }, [workspaceId, projectId, fetchTasksByProject]);

  const groupedTasks = useMemo(() => {
    const groups: Record<string, TaskResponse[]> = {
      ToDo: [],
      InProgress: [],
      Done: [],
    };

    for (const task of tasks) {
      if (groups[task.status]) {
        groups[task.status].push(task);
      } else {
        groups.ToDo.push(task);
      }
    }

    return groups;
  }, [tasks]);

  const handleCreateTask: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    if (!projectId) return;

    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    setCreateError("");
    setCreating(true);

    const payload: CreateTaskRequest = {
      title: trimmedTitle,
      description: description.trim() || null,
      status,
      priority,
      assignedToUserId: assignedToUserId.trim() || null,
      dueDate: dueDate || null,
    };

    try {
      await addTask(projectId, payload);
      setTitle("");
      setDescription("");
      setStatus("ToDo");
      setPriority("Medium");
      setAssignedToUserId("");
      setDueDate("");
    } catch (err: any) {
      setCreateError(err.response?.data?.message || "Failed to create task");
    } finally {
      setCreating(false);
    }
  };

  if (!workspaceId || !projectId) {
    return (
      <div className="min-h-screen bg-slate-100 p-8">
        <p className="text-red-500">Workspace id or project id is missing.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <button
              onClick={() => navigate(`/workspaces/${workspaceId}`)}
              className="mb-2 text-sm font-medium text-blue-600 hover:underline"
            >
              ← Back to Workspace
            </button>

            {projectLoading ? (
              <h1 className="text-2xl font-bold text-slate-900">Loading project...</h1>
            ) : projectError ? (
              <h1 className="text-2xl font-bold text-red-500">Failed to load project</h1>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-slate-900">
                  {project?.name}
                </h1>
                <p className="text-sm text-slate-500">
                  {project?.description || "No description provided."}
                </p>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {projectError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
            {projectError}
          </div>
        )}

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Create Task</h2>

          <form onSubmit={handleCreateTask} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Title
              </label>
              <input
                type="text"
                placeholder="Enter task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 outline-none transition focus:border-blue-500"
                required
              />
            </div>

            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Description
              </label>
              <textarea
                placeholder="Enter task description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[100px] w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 outline-none transition focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 outline-none transition focus:border-blue-500"
              >
                {statusColumns.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 outline-none transition focus:border-blue-500"
              >
                {priorityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Assigned User Id
              </label>
              <input
                type="text"
                placeholder="Optional user id"
                value={assignedToUserId}
                onChange={(e) => setAssignedToUserId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 outline-none transition focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Due Date
              </label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 outline-none transition focus:border-blue-500"
              />
            </div>

            <div className="lg:col-span-2">
              <button
                type="submit"
                disabled={creating}
                className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creating ? "Creating..." : "Create Task"}
              </button>
            </div>
          </form>

          {createError && (
            <p className="mt-3 text-sm text-red-500">{createError}</p>
          )}
        </section>

        <section>
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-slate-900">Board</h2>
          </div>

          {isLoading && <p className="text-slate-600">Loading tasks...</p>}

          {!isLoading && error && <p className="text-red-500">{error}</p>}

          {!isLoading && !error && (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              {statusColumns.map((column) => (
                <div
                  key={column}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-base font-semibold text-slate-900">
                      {column}
                    </h3>
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-500">
                      {groupedTasks[column]?.length ?? 0}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {(groupedTasks[column] ?? []).length === 0 && (
                      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-400">
                        No tasks
                      </div>
                    )}

                    {(groupedTasks[column] ?? []).map((task) => (
                      <div
                        key={task.id}
                        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                      >
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <h4 className="text-sm font-semibold text-slate-900">
                            {task.title}
                          </h4>
                          <span className="whitespace-nowrap rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
                            {task.priority}
                          </span>
                        </div>

                        <p className="mb-3 text-sm text-slate-600">
                          {task.description || "No description provided."}
                        </p>

                        <div className="space-y-1 text-xs text-slate-500">
                          <p>Status: {task.status}</p>
                          <p>Assigned: {task.assignedToUserId || "Unassigned"}</p>
                          <p>
                            Due:{" "}
                            {task.dueDate
                              ? new Date(task.dueDate).toLocaleString()
                              : "No due date"}
                          </p>
                          <p>Created: {new Date(task.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default ProjectPage;