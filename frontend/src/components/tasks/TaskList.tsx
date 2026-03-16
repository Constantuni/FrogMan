import { useMemo, useState } from "react";
import type { TaskResponse, UpdateTaskRequest } from "../../types/task";
import {
  TaskPriorities,
  TaskStatuses,
  type TaskPriority,
  type TaskStatus,
} from "../../types/taskEnums";

interface Props {
  tasks: TaskResponse[];
  onUpdate: (taskId: string, payload: UpdateTaskRequest) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
}

const TaskList = ({ tasks, onUpdate, onDelete }: Props) => {
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
      await onUpdate(taskId, {
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
      await onDelete(taskId);
    } catch (err: any) {
      window.alert(err.response?.data?.message || "Failed to delete task");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-slate-900">Board</h2>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {TaskStatuses.map((column) => (
          <div
            key={column}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">{column}</h3>
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
                          onChange={(e) => setEditingAssignedToUserId(e.target.value)}
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
    </section>
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

export default TaskList;