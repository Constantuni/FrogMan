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

  // Local state to catch validation errors for updates
  const [updateError, setUpdateError] = useState<string | null>(null);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  // Client-side validation mirroring UpdateWorkspaceRequestValidator
  const handleUpdateWorkspace = async (id: string, name: string) => {
    setUpdateError(null); // Reset previous errors
    const trimmedName = name.trim();

    // 1. Must not be null/whitespace
    if (!trimmedName) {
      setUpdateError("Workspace name is required.");
      return;
    } 
    // 2. Must not exceed 150 characters
    else if (trimmedName.length > 150) {
      setUpdateError("Workspace name must not exceed 150 characters.");
      return;
    }

    // If valid, pass the sanitized name to the store
    try {
      await editWorkspace(id, { name: trimmedName });
    } catch (err) {
      // Fallback if the backend catches something else
      setUpdateError("Failed to update workspace.");
    }
  };

  return (
    <AppShell
      title="Dashboard"
      subtitle={`Welcome, ${user?.username ?? "User"}`}
    >
      <CreateWorkspaceForm onCreate={addWorkspace} />

      {/* Display workspace update validation errors */}
      {updateError && (
        <div className="my-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {updateError}
        </div>
      )}

      {isLoading && <p className="text-slate-600">Loading workspaces...</p>}
      
      {/* General store errors (e.g., fetch failures) */}
      {error && <p className="text-red-500">{error}</p>}

      {!isLoading && !error && (
        <WorkspaceList
          workspaces={workspaces}
          onOpen={(id) => navigate(`/workspaces/${id}`)}
          onUpdate={handleUpdateWorkspace}
          onDelete={removeWorkspace}
        />
      )}
    </AppShell>
  );
};

export default Dashboard;