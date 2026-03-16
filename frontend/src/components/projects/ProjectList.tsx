import { useState } from "react";
import type { ProjectResponse, UpdateProjectRequest } from "../../types/project";

interface Props {
  projects: ProjectResponse[];
  onOpen: (projectId: string) => void;
  onUpdate: (projectId: string, payload: UpdateProjectRequest) => Promise<void>;
  onDelete: (projectId: string) => Promise<void>;
}

const ProjectList = ({ projects, onOpen, onUpdate, onDelete }: Props) => {
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingProjectName, setEditingProjectName] = useState("");
  const [editingProjectDescription, setEditingProjectDescription] = useState("");
  const [editingError, setEditingError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleStartEdit = (
    projectId: string,
    currentName: string,
    currentDescription?: string | null
  ) => {
    setEditingProjectId(projectId);
    setEditingProjectName(currentName);
    setEditingProjectDescription(currentDescription ?? "");
    setEditingError("");
  };

  const handleCancelEdit = () => {
    setEditingProjectId(null);
    setEditingProjectName("");
    setEditingProjectDescription("");
    setEditingError("");
  };

  const handleUpdateProject = async (projectId: string) => {
    const trimmedName = editingProjectName.trim();
    if (!trimmedName) {
      setEditingError("Project name is required.");
      return;
    }

    setEditingError("");
    setUpdatingId(projectId);

    try {
      await onUpdate(projectId, {
        name: trimmedName,
        description: editingProjectDescription.trim() || null,
      });

      handleCancelEdit();
    } catch (err: any) {
      setEditingError(err.response?.data?.message || "Failed to update project");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project?"
    );
    if (!confirmed) return;

    setDeletingId(projectId);

    try {
      await onDelete(projectId);
    } catch (err: any) {
      window.alert(err.response?.data?.message || "Failed to delete project");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Projects</h2>
      </div>

      {projects.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
          No projects found in this workspace.
        </div>
      )}

      {projects.length > 0 && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => {
            const isEditing = editingProjectId === project.id;
            const isUpdating = updatingId === project.id;
            const isDeleting = deletingId === project.id;

            return (
              <div
                key={project.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <span className="rounded-xl bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
                    Project
                  </span>

                  {!isEditing && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleStartEdit(
                            project.id,
                            project.name,
                            project.description
                          )
                        }
                        className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteProject(project.id)}
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
                      value={editingProjectName}
                      onChange={(e) => setEditingProjectName(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 outline-none transition focus:border-blue-500"
                    />

                    <textarea
                      value={editingProjectDescription}
                      onChange={(e) => setEditingProjectDescription(e.target.value)}
                      className="min-h-[100px] w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 outline-none transition focus:border-blue-500"
                    />

                    {editingError && (
                      <p className="text-sm text-red-500">{editingError}</p>
                    )}

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleUpdateProject(project.id)}
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
                  <button
                    type="button"
                    onClick={() => onOpen(project.id)}
                    className="w-full text-left"
                  >
                    <h3 className="mb-2 text-lg font-semibold text-slate-900 hover:text-blue-700">
                      {project.name}
                    </h3>

                    <p className="mb-4 min-h-[48px] text-sm text-slate-500">
                      {project.description || "No description provided."}
                    </p>

                    <p className="mb-4 text-xs text-slate-400">
                      Created at {new Date(project.createdAt).toLocaleString()}
                    </p>

                    <div className="text-sm font-medium text-blue-600">
                      Open project →
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

export default ProjectList;