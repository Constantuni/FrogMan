// WorkspaceList.tsx
import type { WorkspaceResponse } from "../../types/workspace";
import { useState } from "react";

interface Props {
  workspaces: WorkspaceResponse[];
  onOpen: (id: string) => void;
  onUpdate: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  currentUserId?: string; // Prop to compare with workspace.ownerUserId
}

const WorkspaceList = ({ workspaces = [], onOpen, onUpdate, onDelete, currentUserId }: Props) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [error, setError] = useState("");

  const handleStartEdit = (id: string, name: string, canManage: boolean) => {
    if (!canManage) return; // Fail-safe structural block
    setEditingId(id);
    setEditingName(name);
    setError(""); 
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingName("");
    setError("");
  };

  const handleSave = async (id: string, canManage: boolean) => {
    if (!canManage) return; 
    setError("");
    const trimmed = editingName.trim();

    if (!trimmed) {
      setError("Workspace name is required.");
      return;
    } else if (trimmed.length > 150) {
      setError("Workspace name must not exceed 150 characters.");
      return;
    }

    try {
      await onUpdate(id, trimmed);
      setEditingId(null);
      setEditingName("");
    } catch (err) {
      setError("Failed to update workspace. Please try again.");
    }
  };

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
            
            // Check ownership: True if the logged-in user matches the workspace's OwnerUserId
            const canManageWorkspace = workspace.ownerUserId === currentUserId;

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
                      {/* EDIT BUTTON (Grayed out for Admins & Members) */}
                      <button
                        onClick={() =>
                          handleStartEdit(workspace.id, workspace.name, canManageWorkspace)
                        }
                        disabled={!canManageWorkspace}
                        className="rounded border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
                      >
                        Edit
                      </button>

                      {/* DELETE BUTTON (Grayed out for Admins & Members) */}
                      <button
                        onClick={() => {
                          if (window.confirm("Are you sure you want to delete this workspace?")) {
                            onDelete(workspace.id);
                          }
                        }}
                        disabled={!canManageWorkspace}
                        className="rounded bg-red-500 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-40 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
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
                      maxLength={150}
                      autoFocus
                      disabled={!canManageWorkspace}
                      className={`mb-2 w-full rounded border px-3 py-2 text-slate-900 outline-none transition-colors ${
                        error
                          ? "border-red-500 bg-red-50 focus:border-red-600"
                          : "border-slate-300 focus:border-blue-500"
                      } disabled:bg-slate-50 disabled:text-slate-400`}
                    />

                    {error && (
                      <p className="mb-3 text-xs text-red-500">{error}</p>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSave(workspace.id, canManageWorkspace)}
                        disabled={!canManageWorkspace}
                        className="rounded bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
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