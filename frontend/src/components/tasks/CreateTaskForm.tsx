import { useState } from "react";
import { useWorkspaceStore } from "../../store/workspaceStore";
import { parseApiError } from "../../api/errorHelper";
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
  const { currentMembers, isLoadingMembers } = useWorkspaceStore();

  // New state to toggle form visibility
  const [isOpen, setIsOpen] = useState(false);

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
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      });

      setTitle("");
      setDescription("");
      setStatus("ToDo");
      setPriority("Medium");
      setAssignedToUserId("");
      setDueDate("");
      setIsOpen(false); // Auto-collapse the accordion after a successful creation
    } catch (err: any) {
      const { title: errorTitle } = parseApiError(err);
      setError(errorTitle || "Failed to create task");
    } finally {
      setCreating(false);
    }
  };

  return (
    <section className="mb-6 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all duration-200">
      
      {/* ACCORDION TRIGGER HEADER */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-6 py-4 text-left outline-none hover:bg-slate-50/50"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <h2 className="text-base font-semibold text-slate-900">Create New Task</h2>
        </div>
        
        {/* Animated Chevron Indicator */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {/* COLLAPSIBLE FORM PANEL */}
      <div
        className={`transition-all duration-200 ease-in-out ${
          isOpen ? "max-h-[1000px] border-t border-slate-100 p-6 opacity-100" : "max-h-0 opacity-0 pointer-events-none"
        }`}
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
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
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
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
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
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
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
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
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Assignee
            </label>
            {isLoadingMembers ? (
              <div className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-sm text-slate-500 italic">
                Loading workspace members...
              </div>
            ) : (
              <select
                value={assignedToUserId}
                onChange={(e) => setAssignedToUserId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 outline-none transition focus:border-blue-500"
              >
                <option value="">Unassigned</option>
                {currentMembers && currentMembers.length > 0 ? (
                  currentMembers.map((member) => (
                    <option key={member.userId} value={member.userId}>
                      {member.name} ({member.email})
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    No workspace members found
                  </option>
                )}
              </select>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Due Date
            </label>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 outline-none transition focus:border-blue-500"
            />
          </div>

          <div className="lg:col-span-2 pt-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={creating}
              className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating ? "Creating..." : "Create Task"}
            </button>
            
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-lg border border-slate-300 bg-white px-5 py-2 font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Minimize
          </button>
          </div>
        </form>

        {error && <p className="mt-3 text-sm font-medium text-red-500">{error}</p>}
      </div>
    </section>
  );
};

export default CreateTaskForm;