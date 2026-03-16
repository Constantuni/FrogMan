import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import CreateWorkspaceForm from "../components/workspaces/CreateWorkspaceForm";
import WorkspaceList from "../components/workspaces/WorkspaceList";
import { useAuthStore } from "../store/authStore";
import { useWorkspaceStore } from "../store/workspaceStore";

const Dashboard = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const {
    workspaces,
    isLoading,
    error,
    fetchWorkspaces,
    addWorkspace,
    editWorkspace,
    removeWorkspace,
  } = useWorkspaceStore();

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  return (
    <AppShell
      title="Dashboard"
      subtitle={`Welcome, ${user?.username ?? "User"}`}
    >
      <CreateWorkspaceForm onCreate={addWorkspace} />

      {isLoading && <p className="text-slate-600">Loading workspaces...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!isLoading && !error && (
        <WorkspaceList
          workspaces={workspaces}
          onOpen={(id) => navigate(`/workspaces/${id}`)}
          onUpdate={(id, name) => editWorkspace(id, { name })}
          onDelete={removeWorkspace}
        />
      )}
    </AppShell>
  );
};

export default Dashboard;