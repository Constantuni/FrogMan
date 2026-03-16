import type { WorkspaceResponse } from "../../types/workspace";
import { useState } from "react";

interface Props {
  workspaces: WorkspaceResponse[];
  onOpen: (id: string) => void;
  onUpdate: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const WorkspaceList = ({ workspaces, onOpen, onUpdate, onDelete }: Props) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [error, setError] = useState("");

  const handleStartEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditingName(name);
    setError("");
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleSave = async (id: string) => {
    const trimmed = editingName.trim();
    if (!trimmed) {
      setError("Workspace name required");
      return;
    }

    await onUpdate(id, trimmed);

    setEditingId(null);
    setEditingName("");
  };

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
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-4 flex justify-between">
                  <span className="rounded-xl bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                    Workspace
                  </span>

                  {!isEditing && (
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleStartEdit(workspace.id, workspace.name)
                        }
                        className="text-xs border rounded px-3 py-1"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => onDelete(workspace.id)}
                        className="text-xs bg-red-500 text-white rounded px-3 py-1"
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
                      className="w-full border rounded px-3 py-2 mb-2"
                    />

                    {error && (
                      <p className="text-red-500 text-sm mb-2">{error}</p>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSave(workspace.id)}
                        className="bg-blue-600 text-white px-4 py-2 rounded text-sm"
                      >
                        Save
                      </button>

                      <button
                        onClick={handleCancel}
                        className="border px-4 py-2 rounded text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    className="w-full text-left"
                    onClick={() => onOpen(workspace.id)}
                  >
                    <h3 className="text-lg font-semibold text-slate-900">
                      {workspace.name}
                    </h3>

                    <p className="text-sm text-slate-500 mt-2">
                      Created at{" "}
                      {new Date(workspace.createdAt).toLocaleString()}
                    </p>

                    <div className="text-sm text-blue-600 mt-2">
                      Open workspace →
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