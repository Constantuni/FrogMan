// ProjectPage.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProjectById } from "../api/projects";
import { parseApiError } from "../api/errorHelper"; // Import standard error parser
import AppShell from "../components/layout/AppShell";
import CreateTaskForm from "../components/tasks/CreateTaskForm";
import TaskList from "../components/tasks/TaskList";
import { useTaskStore } from "../store/taskStore";
import type { ProjectResponse } from "../types/project";
import type { CreateTaskRequest, UpdateTaskRequest } from "../types/task";

const ProjectPage = () => {
  const { workspaceId, projectId } = useParams<{
    workspaceId: string;
    projectId: string;
  }>();

  const {
    tasks,
    isLoading,
    error, // This comes from Zustand
    fetchTasksByProject,
    addTask,
    editTask,
    removeTask,
  } = useTaskStore();

  const [project, setProject] = useState<ProjectResponse | null>(null);
  const [projectLoading, setProjectLoading] = useState(true);
  const [projectError, setProjectError] = useState("");

  useEffect(() => {
    if (!workspaceId || !projectId) return;

    const loadProject = async () => {
      setProjectLoading(true);
      setProjectError("");

      try {
        const data = await getProjectById(workspaceId, projectId);
        setProject(data);
      } catch (err) {
        // Standardized Problem Details parsing
        const { title } = parseApiError(err);
        setProjectError(title);
      } finally {
        setProjectLoading(false);
      }
    };

    loadProject();
    fetchTasksByProject(projectId);
  }, [workspaceId, projectId, fetchTasksByProject]);

  const handleCreateTask = async (payload: CreateTaskRequest) => {
    if (!projectId) return;
    try {
      await addTask(projectId, payload);
    } catch (err) {
      // If your store throws the error, you can catch and display it here
      // const { title } = parseApiError(err);
      // alert(title); // Or use a toast/snackbar
    }
  };

  const handleUpdateTask = async (
    taskId: string,
    payload: UpdateTaskRequest
  ) => {
    try {
      await editTask(taskId, payload);
    } catch (err) {
      // Handle update errors gracefully
    }
  };

  if (!workspaceId || !projectId) {
    return (
      <div className="min-h-screen bg-slate-100 p-8">
        <p className="text-red-500">Workspace id or project id is missing.</p>
      </div>
    );
  }

  const title = projectLoading
    ? "Loading project..."
    : projectError
      ? "Failed to load project"
      : (project?.name ?? "Project");

  const subtitle = projectError
    ? undefined
    : (project?.description || "No description provided.");

  return (
    <AppShell
      title={title}
      subtitle={subtitle}
      backTo={`/workspaces/${workspaceId}`}
      backLabel="Back to Workspace"
    >
      {/* Standardized Project Fetch Error */}
      {projectError && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
          {projectError}
        </div>
      )}

      <CreateTaskForm onCreate={handleCreateTask} />

      {/* Standardized Task Store Error */}
      {isLoading && <p className="text-slate-600">Loading tasks...</p>}
      {!isLoading && error && (
        <div className="my-4 rounded border border-red-200 bg-red-50 p-3 text-red-600">
          {error}
        </div>
      )}

      {!isLoading && !error && (
        <TaskList
          tasks={tasks}
          onUpdate={handleUpdateTask}
          onDelete={removeTask}
        />
      )}
    </AppShell>
  );
};

export default ProjectPage;