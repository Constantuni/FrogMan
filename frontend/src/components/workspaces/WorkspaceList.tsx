import type { WorkspaceResponse } from "../../types/workspace";
import { useState } from "react";

interface Props {
  workspaces: WorkspaceResponse[];
  onOpen: (id: string) => void;
  onUpdate: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const WorkspaceList = ({ workspaces = [], onOpen, onUpdate, onDelete }: Props) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [error, setError] = useState("");

  const handleStartEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditingName(name);
    setError(""); // Clear any previous errors
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingName("");
    setError("");
  };

  const handleSave = async (id: string) => {
    setError("");
    const trimmed = editingName.trim();

    // Client-side validation mirroring FluentValidation (CascadeMode.Stop)
    if (!trimmed) {
      setError("Workspace name is required.");
      return;
    } else if (trimmed.length > 150) {
      setError("Workspace name must not exceed 150 characters.");
      return;
    }

    try {
      await onUpdate(id, trimmed);
      // Only clear state if the update succeeds
      setEditingId(null);
      setEditingName("");
    } catch (err) {
      setError("Failed to update workspace. Please try again.");
    }
  };

  // Safety check to ensure it's an array before checking .length or .map()
  if (!Array.isArray(workspaces)) {
    console.error("WorkspaceList expected an array, but received:", workspaces);
    return null; 
  }

  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold text-slate-900">
        Workspaces
      </h2>

      {workspaces.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
          No workspaces found.
        </div>
      )}

      {workspaces.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {workspaces.map((workspace) => {
            const isEditing = editingId === workspace.id;

            return (
              <div
                key={workspace.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-xl bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                    Workspace
                  </span>

                  {!isEditing && (
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleStartEdit(workspace.id, workspace.name)
                        }
                        className="rounded border border-slate-300 px-3 py-1 text-xs text-slate-600 transition-colors hover:bg-slate-50"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => onDelete(workspace.id)}
                        className="rounded bg-red-500 px-3 py-1 text-xs text-white transition-colors hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <>
                    <input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      maxLength={150} // Hard limit at the keystroke level
                      autoFocus
                      className={`mb-2 w-full rounded border px-3 py-2 text-slate-900 outline-none transition-colors ${
                        error
                          ? "border-red-500 bg-red-50 focus:border-red-600"
                          : "border-slate-300 focus:border-blue-500"
                      }`}
                    />

                    {/* Inline Error State */}
                    {error && (
                      <p className="mb-3 text-xs text-red-500">{error}</p>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSave(workspace.id)}
                        className="rounded bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700"
                      >
                        Save
                      </button>

                      <button
                        onClick={handleCancel}
                        className="rounded border border-slate-300 px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    className="w-full text-left outline-none"
                    onClick={() => onOpen(workspace.id)}
                  >
                    <h3 className="truncate text-lg font-semibold text-slate-900">
                      {workspace.name}
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      Created at{" "}
                      {new Date(workspace.createdAt).toLocaleString()}
                    </p>

                    <div className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                      Open workspace &rarr;
                    </div>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default WorkspaceList;