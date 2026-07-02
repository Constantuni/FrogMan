// Dashboard.tsx
import { useEffect, useState } from "react";
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

  const [updateError, setUpdateError] = useState<string | null>(null);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  const handleUpdateWorkspace = async (id: string, name: string) => {
    setUpdateError(null); 
    const trimmedName = name.trim();

    if (!trimmedName) {
      setUpdateError("Workspace name is required.");
      return;
    } 
    else if (trimmedName.length > 150) {
      setUpdateError("Workspace name must not exceed 150 characters.");
      return;
    }

    try {
      await editWorkspace(id, { name: trimmedName });
    } catch (err) {
      setUpdateError("Failed to update workspace.");
    }
  };

  return (
    <AppShell
      title="Dashboard"
      subtitle={`Welcome, ${user?.username ?? "User"}`}
    >
      {/* Workspace Creation Form remains unlocked for everyone to build new clusters */}
      <CreateWorkspaceForm onCreate={addWorkspace} />

      {updateError && (
        <div className="my-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {updateError}
        </div>
      )}

      {isLoading && <p className="text-slate-600">Loading workspaces...</p>}
      
      {error && <p className="text-red-500">{error}</p>}

      {!isLoading && !error && (
        <WorkspaceList
          workspaces={workspaces}
          onOpen={(id) => navigate(`/workspaces/${id}`)}
          onUpdate={handleUpdateWorkspace}
          onDelete={removeWorkspace}
          currentUserId={user?.id} // Pass down the logged-in user id for card evaluation
        />
      )}
    </AppShell>
  );
};

export default Dashboard;