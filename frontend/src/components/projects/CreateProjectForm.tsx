import { useState } from "react";
import type { CreateProjectRequest } from "../../types/project";

interface Props {
  onCreate: (payload: CreateProjectRequest) => Promise<void>;
}

const CreateProjectForm = ({ onCreate }: Props) => {
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [creating, setCreating] = useState(false);
  
  // Split errors into field-specific errors and general API errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState("");

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    setGeneralError("");

    const trimmedName = projectName.trim();
    const trimmedDesc = projectDescription.trim();
    const errors: Record<string, string> = {};

    // 1. Name Validation (Matches CascadeMode.Stop)
    if (!trimmedName) {
      errors.name = "Project name is required.";
    } else if (trimmedName.length > 150) {
      errors.name = "Project name must not exceed 150 characters.";
    }

    // 2. Description Validation
    if (trimmedDesc.length > 2000) {
      errors.description = "Project description must not exceed 2000 characters.";
    }

    // If there are any client-side errors, halt submission
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setCreating(true);

    try {
      await onCreate({
        name: trimmedName,
        description: trimmedDesc || null, // Send null if empty string
      });

      // Reset form on success
      setProjectName("");
      setProjectDescription("");
    } catch (err: any) {
      setGeneralError(err.response?.data?.message || "Failed to create project");
    } finally {
      setCreating(false);
    }
  };

  return (
    <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">
        Create Project
      </h2>

      {/* General API Errors */}
      {generalError && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {generalError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Project Name
          </label>
          <input
            type="text"
            placeholder="Enter project name"
            value={projectName}
            maxLength={150} // Hard limit at the keystroke level
            onChange={(e) => {
              setProjectName(e.target.value);
              if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: "" });
            }}
            className={`w-full rounded-lg border px-4 py-2 text-slate-900 outline-none transition-colors ${
              fieldErrors.name
                ? "border-red-500 bg-red-50 focus:border-red-600"
                : "border-slate-300 focus:border-blue-500"
            }`}
          />
          {fieldErrors.name && (
            <p className="mt-1 text-sm text-red-500">{fieldErrors.name}</p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            placeholder="Enter project description"
            value={projectDescription}
            maxLength={2000} // Hard limit at the keystroke level
            onChange={(e) => {
              setProjectDescription(e.target.value);
              if (fieldErrors.description) setFieldErrors({ ...fieldErrors, description: "" });
            }}
            className={`min-h-[100px] w-full rounded-lg border px-4 py-2 text-slate-900 outline-none transition-colors ${
              fieldErrors.description
                ? "border-red-500 bg-red-50 focus:border-red-600"
                : "border-slate-300 focus:border-blue-500"
            }`}
          />
          {fieldErrors.description && (
            <p className="mt-1 text-sm text-red-500">{fieldErrors.description}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={creating}
          className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {creating ? "Creating..." : "Create Project"}
        </button>
      </form>
    </section>
  );
};

export default CreateProjectForm;