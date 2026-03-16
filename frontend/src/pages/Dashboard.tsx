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
  } = useWorkspaceStore();

  const [workspaceName, setWorkspaceName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

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

          {isLoading && (
            <p className="text-slate-600">Loading workspaces...</p>
          )}

          {!isLoading && error && (
            <p className="text-red-500">{error}</p>
          )}

          {!isLoading && !error && workspaces.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
              No workspaces found.
            </div>
          )}

          {!isLoading && !error && workspaces.length > 0 && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {workspaces.map((workspace) => (
                <button
                  key={workspace.id}
                  onClick={() => handleOpenWorkspace(workspace.id)}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-blue-400 hover:shadow-md"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className="rounded-xl bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                      Workspace
                    </div>
                  </div>

                  <h3 className="mb-2 text-lg font-semibold text-slate-900 group-hover:text-blue-700">
                    {workspace.name}
                  </h3>

                  <p className="mb-4 text-sm text-slate-500">
                    Created at{" "}
                    {new Date(workspace.createdAt).toLocaleString()}
                  </p>

                  <div className="text-sm font-medium text-blue-600">
                    Open workspace →
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

export default Dashboard;