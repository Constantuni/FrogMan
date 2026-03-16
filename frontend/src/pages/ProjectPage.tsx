import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProjectById } from "../api/projects";
import { useTaskStore } from "../store/taskStore";
import type { ProjectResponse } from "../types/project";
import type { CreateTaskRequest, TaskResponse } from "../types/task";
import {
  TaskPriorities,
  TaskStatuses,
  type TaskPriority,
  type TaskStatus,
} from "../types/taskEnums";

const ProjectPage = () => {
  const { workspaceId, projectId } = useParams<{
    workspaceId: string;
    projectId: string;
  }>();
  const navigate = useNavigate();

  const {
    tasks,
    isLoading,
    error,
    fetchTasksByProject,
    addTask,
    editTask,
    removeTask,
  } = useTaskStore();

  const [project, setProject] = useState<ProjectResponse | null>(null);
  const [projectLoading, setProjectLoading] = useState(true);
  const [projectError, setProjectError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("ToDo");
  const [priority, setPriority] = useState<TaskPriority>("Medium");
  const [assignedToUserId, setAssignedToUserId] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [editingStatus, setEditingStatus] = useState<TaskStatus>("ToDo");
  const [editingPriority, setEditingPriority] = useState<TaskPriority>("Medium");
  const [editingAssignedToUserId, setEditingAssignedToUserId] = useState("");
  const [editingDueDate, setEditingDueDate] = useState("");
  const [editingError, setEditingError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!workspaceId || !projectId) return;

    const loadProject = async () => {
      setProjectLoading(true);
      setProjectError("");

      try {
        const data = await getProjectById(workspaceId, projectId);
        setProject(data);
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
    const groups: Record<TaskStatus, TaskResponse[]> = {
      ToDo: [],
      InProgress: [],
      Done: [],
    };

    for (const task of tasks) {
      if (task.status in groups) {
        groups[task.status as TaskStatus].push(task);
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

  const handleStartEdit = (task: TaskResponse) => {
    setEditingTaskId(task.id);
    setEditingTitle(task.title);
    setEditingDescription(task.description ?? "");
    setEditingStatus(task.status);
    setEditingPriority(task.priority);
    setEditingAssignedToUserId(task.assignedToUserId ?? "");
    setEditingDueDate(task.dueDate ? toDateTimeLocalValue(task.dueDate) : "");
    setEditingError("");
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditingTitle("");
    setEditingDescription("");
    setEditingStatus("ToDo");
    setEditingPriority("Medium");
    setEditingAssignedToUserId("");
    setEditingDueDate("");
    setEditingError("");
  };

  const handleUpdateTask = async (taskId: string) => {
    const trimmedTitle = editingTitle.trim();
    if (!trimmedTitle) {
      setEditingError("Task title is required.");
      return;
    }

    setEditingError("");
    setUpdatingId(taskId);

    try {
      await editTask(taskId, {
        title: trimmedTitle,
        description: editingDescription.trim() || null,
        status: editingStatus,
        priority: editingPriority,
        assignedToUserId: editingAssignedToUserId.trim() || null,
        dueDate: editingDueDate || null,
      });

      handleCancelEdit();
    } catch (err: any) {
      setEditingError(err.response?.data?.message || "Failed to update task");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this task?");
    if (!confirmed) return;

    setDeletingId(taskId);

    try {
      await removeTask(taskId);
    } catch (err: any) {
      window.alert(err.response?.data?.message || "Failed to delete task");
    } finally {
      setDeletingId(null);
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
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 outline-none transition focus:border-blue-500"
              >
                {TaskStatuses.map((option) => (
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
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 outline-none transition focus:border-blue-500"
              >
                {TaskPriorities.map((option) => (
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
              {TaskStatuses.map((column) => (
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

                    {(groupedTasks[column] ?? []).map((task) => {
                      const isEditing = editingTaskId === task.id;
                      const isUpdating = updatingId === task.id;
                      const isDeleting = deletingId === task.id;

                      return (
                        <div
                          key={task.id}
                          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                        >
                          {isEditing ? (
                            <div className="space-y-3">
                              <input
                                type="text"
                                value={editingTitle}
                                onChange={(e) => setEditingTitle(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500"
                              />

                              <textarea
                                value={editingDescription}
                                onChange={(e) => setEditingDescription(e.target.value)}
                                className="min-h-[90px] w-full rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500"
                              />

                              <select
                                value={editingStatus}
                                onChange={(e) =>
                                  setEditingStatus(e.target.value as TaskStatus)
                                }
                                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500"
                              >
                                {TaskStatuses.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>

                              <select
                                value={editingPriority}
                                onChange={(e) =>
                                  setEditingPriority(e.target.value as TaskPriority)
                                }
                                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500"
                              >
                                {TaskPriorities.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>

                              <input
                                type="text"
                                placeholder="Optional user id"
                                value={editingAssignedToUserId}
                                onChange={(e) =>
                                  setEditingAssignedToUserId(e.target.value)
                                }
                                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500"
                              />

                              <input
                                type="datetime-local"
                                value={editingDueDate}
                                onChange={(e) => setEditingDueDate(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500"
                              />

                              {editingError && (
                                <p className="text-sm text-red-500">{editingError}</p>
                              )}

                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateTask(task.id)}
                                  disabled={isUpdating}
                                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {isUpdating ? "Saving..." : "Save"}
                                </button>

                                <button
                                  type="button"
                                  onClick={handleCancelEdit}
                                  disabled={isUpdating}
                                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="mb-3 flex items-start justify-between gap-3">
                                <h4 className="text-sm font-semibold text-slate-900">
                                  {task.title}
                                </h4>

                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleStartEdit(task)}
                                    className="rounded-lg border border-slate-300 px-2.5 py-1 text-[11px] font-medium text-slate-700 transition hover:bg-slate-100"
                                  >
                                    Edit
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleDeleteTask(task.id)}
                                    disabled={isDeleting}
                                    className="rounded-lg bg-red-500 px-2.5 py-1 text-[11px] font-medium text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    {isDeleting ? "Deleting..." : "Delete"}
                                  </button>
                                </div>
                              </div>

                              <p className="mb-3 text-sm text-slate-600">
                                {task.description || "No description provided."}
                              </p>

                              <div className="space-y-1 text-xs text-slate-500">
                                <p>
                                  <span className="font-medium">Status:</span> {task.status}
                                </p>
                                <p>
                                  <span className="font-medium">Priority:</span> {task.priority}
                                </p>
                                <p>
                                  <span className="font-medium">Assigned:</span>{" "}
                                  {task.assignedToUserId || "Unassigned"}
                                </p>
                                <p>
                                  <span className="font-medium">Due:</span>{" "}
                                  {task.dueDate
                                    ? new Date(task.dueDate).toLocaleString()
                                    : "No due date"}
                                </p>
                                <p>
                                  <span className="font-medium">Created:</span>{" "}
                                  {new Date(task.createdAt).toLocaleString()}
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
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

function toDateTimeLocalValue(value: string): string {
  const date = new Date(value);

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default ProjectPage;