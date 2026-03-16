import { useState } from "react";
import type { CreateTaskRequest } from "../../types/task";
import {
  TaskPriorities,
  TaskStatuses,
  type TaskPriority,
  type TaskStatus,
} from "../../types/taskEnums";

interface Props {
  onCreate: (payload: CreateTaskRequest) => Promise<void>;
}

const CreateTaskForm = ({ onCreate }: Props) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("ToDo");
  const [priority, setPriority] = useState<TaskPriority>("Medium");
  const [assignedToUserId, setAssignedToUserId] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    setError("");
    setCreating(true);

    try {
      await onCreate({
        title: trimmedTitle,
        description: description.trim() || null,
        status,
        priority,
        assignedToUserId: assignedToUserId.trim() || null,
        dueDate: dueDate || null,
      });

      setTitle("");
      setDescription("");
      setStatus("ToDo");
      setPriority("Medium");
      setAssignedToUserId("");
      setDueDate("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create task");
    } finally {
      setCreating(false);
    }
  };

  return (
    <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">Create Task</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
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

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
    </section>
  );
};

export default CreateTaskForm;