// ProjectList.tsx
import { useState } from "react";
import type { ProjectResponse, UpdateProjectRequest } from "../../types/project";

interface Props {
  projects: ProjectResponse[];
  onOpen: (projectId: string) => void;
  onUpdate: (projectId: string, payload: UpdateProjectRequest) => Promise<void>;
  onDelete: (projectId: string) => Promise<void>;
  canManage?: boolean; 
}

const ProjectList = ({ projects, onOpen, onUpdate, onDelete, canManage = false }: Props) => {
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingProjectName, setEditingProjectName] = useState("");
  const [editingProjectDescription, setEditingProjectDescription] = useState("");
  
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState("");
  
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleStartEdit = (
    projectId: string,
    currentName: string,
    currentDescription?: string | null
  ) => {
    if (!canManage) return; 
    setEditingProjectId(projectId);
    setEditingProjectName(currentName);
    setEditingProjectDescription(currentDescription ?? "");
    setFieldErrors({});
    setGeneralError("");
  };

  const handleCancelEdit = () => {
    setEditingProjectId(null);
    setEditingProjectName("");
    setEditingProjectDescription("");
    setFieldErrors({});
    setGeneralError("");
  };

  const handleUpdateProject = async (projectId: string) => {
    if (!canManage) return; 
    setFieldErrors({});
    setGeneralError("");
    
    const trimmedName = editingProjectName.trim();
    const trimmedDesc = editingProjectDescription.trim();
    const errors: Record<string, string> = {};

    if (!trimmedName) {
      errors.name = "Project name is required.";
    } else if (trimmedName.length > 150) {
      errors.name = "Project name must not exceed 150 characters.";
    }

    if (trimmedDesc.length > 2000) {
      errors.description = "Project description must not exceed 2000 characters.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setUpdatingId(projectId);

    try {
      await onUpdate(projectId, {
        name: trimmedName,
        description: trimmedDesc || null,
      });
      handleCancelEdit();
    } catch (err: any) {
      setGeneralError(err.response?.data?.message || "Failed to update project");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!canManage) return; 
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
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {projects.map((project) => {
            const isEditing = editingProjectId === project.id;
            const isUpdating = updatingId === project.id;
            const isDeleting = deletingId === project.id;

            return (
              <div
                key={project.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md flex flex-col justify-between overflow-hidden"
              >
                {/* HEADER ROW */}
                <div className="mb-4 flex items-center justify-between gap-4">
                  <span className="shrink-0 rounded-xl bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
                    Project
                  </span>

                  {!isEditing && (
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleStartEdit(
                            project.id,
                            project.name,
                            project.description
                          )
                        }
                        disabled={!canManage}
                        className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteProject(project.id)}
                        disabled={isDeleting || !canManage}
                        className="rounded-lg bg-red-500 px-3 py-1 text-xs font-medium text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
                      >
                        {isDeleting ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  )}
                </div>

                {/* CONTENT SECTION */}
                {isEditing ? (
                  <div className="space-y-3">
                    {generalError && (
                      <div className="rounded border border-red-200 bg-red-50 p-2 text-sm text-red-600">
                        {generalError}
                      </div>
                    )}
                    
                    <div>
                      <input
                        type="text"
                        value={editingProjectName}
                        maxLength={150}
                        onChange={(e) => {
                          setEditingProjectName(e.target.value);
                          if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: "" });
                        }}
                        className={`w-full rounded-lg border px-4 py-2 text-slate-900 outline-none transition-colors ${
                          fieldErrors.name
                            ? "border-red-500 bg-red-50 focus:border-red-600"
                            : "border-slate-300 focus:border-blue-500"
                        }`}
                        placeholder="Project Name"
                      />
                      {fieldErrors.name && (
                        <p className="mt-1 text-xs text-red-500">{fieldErrors.name}</p>
                      )}
                    </div>

                    <div>
                      <textarea
                        value={editingProjectDescription}
                        maxLength={2000}
                        onChange={(e) => {
                          setEditingProjectDescription(e.target.value);
                          if (fieldErrors.description) setFieldErrors({ ...fieldErrors, description: "" });
                        }}
                        className={`min-h-[100px] w-full rounded-lg border px-4 py-2 text-slate-900 outline-none transition-colors ${
                          fieldErrors.description
                            ? "border-red-500 bg-red-50 focus:border-red-600"
                            : "border-slate-300 focus:border-blue-500"
                        }`}
                        placeholder="Project Description"
                      />
                      {fieldErrors.description && (
                        <p className="mt-1 text-xs text-red-500">{fieldErrors.description}</p>
                      )}
                    </div>

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
                    className="w-full text-left group"
                  >
                    <h3 className="mb-2 truncate text-lg font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                      {project.name}
                    </h3>

                    <p className="mb-4 min-h-[48px] text-sm text-slate-500 line-clamp-3 break-words">
                      {project.description || "No description provided."}
                    </p>

                    <p className="mb-4 text-xs text-slate-400">
                      Created at {new Date(project.createdAt).toLocaleString()}
                    </p>

                    <div className="text-sm font-medium text-blue-600 transition-colors group-hover:text-blue-800">
                      Open project &rarr;
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