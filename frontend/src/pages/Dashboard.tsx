import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useWorkspaceStore } from "../store/workspaceStore";

const Dashboard = () => {
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const {
    workspaces,
    isLoading,
    error,
    fetchWorkspaces,
    addWorkspace,
    editWorkspace,
    removeWorkspace,
  } = useWorkspaceStore();

  const [workspaceName, setWorkspaceName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const [editingWorkspaceId, setEditingWorkspaceId] = useState<string | null>(null);
  const [editingWorkspaceName, setEditingWorkspaceName] = useState("");
  const [editingError, setEditingError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleCreateWorkspace: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    const trimmedName = workspaceName.trim();
    if (!trimmedName) return;

    setCreateError("");
    setCreating(true);

    try {
      await addWorkspace(trimmedName);
      setWorkspaceName("");
    } catch (err: any) {
      setCreateError(err.response?.data?.message || "Failed to create workspace");
    } finally {
      setCreating(false);
    }
  };

  const handleOpenWorkspace = (workspaceId: string) => {
    navigate(`/workspaces/${workspaceId}`);
  };

  const handleStartEdit = (workspaceId: string, currentName: string) => {
    setEditingWorkspaceId(workspaceId);
    setEditingWorkspaceName(currentName);
    setEditingError("");
  };

  const handleCancelEdit = () => {
    setEditingWorkspaceId(null);
    setEditingWorkspaceName("");
    setEditingError("");
  };

  const handleUpdateWorkspace = async (workspaceId: string) => {
    const trimmedName = editingWorkspaceName.trim();
    if (!trimmedName) {
      setEditingError("Workspace name is required.");
      return;
    }

    setEditingError("");
    setUpdatingId(workspaceId);

    try {
      await editWorkspace(workspaceId, { name: trimmedName });
      setEditingWorkspaceId(null);
      setEditingWorkspaceName("");
    } catch (err: any) {
      setEditingError(err.response?.data?.message || "Failed to update workspace");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteWorkspace = async (workspaceId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this workspace?"
    );

    if (!confirmed) return;

    setDeletingId(workspaceId);

    try {
      await removeWorkspace(workspaceId);
    } catch (err: any) {
      window.alert(err.response?.data?.message || "Failed to delete workspace");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-sm text-slate-600">
              Welcome, {user?.username ?? "User"}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Create Workspace
          </h2>

          <form
            onSubmit={handleCreateWorkspace}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <input
              type="text"
              placeholder="Enter workspace name"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-slate-900 outline-none transition focus:border-blue-500"
              required
            />

            <button
              type="submit"
              disabled={creating}
              className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating ? "Creating..." : "Create"}
            </button>
          </form>

          {createError && (
            <p className="mt-3 text-sm text-red-500">{createError}</p>
          )}
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Workspaces</h2>
          </div>

          {isLoading && <p className="text-slate-600">Loading workspaces...</p>}

          {!isLoading && error && <p className="text-red-500">{error}</p>}

          {!isLoading && !error && workspaces.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
              No workspaces found.
            </div>
          )}

          {!isLoading && !error && workspaces.length > 0 && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {workspaces.map((workspace) => {
                const isEditing = editingWorkspaceId === workspace.id;
                const isUpdating = updatingId === workspace.id;
                const isDeleting = deletingId === workspace.id;

                return (
                  <div
                    key={workspace.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="rounded-xl bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                        Workspace
                      </div>

                      {!isEditing && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(workspace.id, workspace.name)}
                            className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteWorkspace(workspace.id)}
                            disabled={isDeleting}
                            className="rounded-lg bg-red-500 px-3 py-1 text-xs font-medium text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isDeleting ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editingWorkspaceName}
                          onChange={(e) => setEditingWorkspaceName(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 outline-none transition focus:border-blue-500"
                        />

                        {editingError && (
                          <p className="text-sm text-red-500">{editingError}</p>
                        )}

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleUpdateWorkspace(workspace.id)}
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
                        <button
                          type="button"
                          onClick={() => handleOpenWorkspace(workspace.id)}
                          className="w-full text-left"
                        >
                          <h3 className="mb-2 text-lg font-semibold text-slate-900 hover:text-blue-700">
                            {workspace.name}
                          </h3>

                          <p className="mb-4 text-sm text-slate-500">
                            Created at {new Date(workspace.createdAt).toLocaleString()}
                          </p>

                          <div className="text-sm font-medium text-blue-600">
                            Open workspace →
                          </div>
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;