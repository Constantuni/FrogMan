import { useState } from "react";
import type { CreateProjectRequest } from "../../types/project";

interface Props {
  onCreate: (payload: CreateProjectRequest) => Promise<void>;
  disabled?: boolean; // 1. Added optional disabled rule flag
}

const CreateProjectForm = ({ onCreate, disabled = false }: Props) => {
  // Toggle state for accordion visibility
  const [isOpen, setIsOpen] = useState(false);

  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [creating, setCreating] = useState(false);
  
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState("");

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (disabled) return; // Fail-safe short circuit

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

      // Reset form and collapse accordion on success
      setProjectName("");
      setProjectDescription("");
      setIsOpen(false);
    } catch (err: any) {
      setGeneralError(err.response?.data?.message || "Failed to create project");
    } finally {
      setCreating(false);
    }
  };

  return (
    <section 
      className={`mb-6 rounded-2xl border bg-white shadow-sm overflow-hidden transition-all duration-200 ${
        disabled ? "border-slate-200 opacity-75" : "border-slate-200"
      }`}
    >
      
      {/* ACCORDION TRIGGER HEADER BUTTON */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)} // Prevent toggle click behavior if disabled
        disabled={disabled}
        className={`flex w-full items-center justify-between px-6 py-4 text-left outline-none transition ${
          disabled ? "bg-slate-50/50 cursor-not-allowed" : "hover:bg-slate-50/50"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`flex h-7 w-7 items-center justify-center rounded-lg text-blue-600 ${
            disabled ? "bg-slate-200 text-slate-400" : "bg-blue-50 text-blue-600"
          }`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <h2 className={`text-base font-semibold ${disabled ? "text-slate-400" : "text-slate-900"}`}>
            Create Project
          </h2>
          {disabled && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase bg-slate-200 text-slate-500 tracking-wider">
              Read Only
            </span>
          )}
        </div>
        
        {/* Animated Chevron Indicator (Hidden entirely if card framework is locked) */}
        {!disabled && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        )}
      </button>

      {/* COLLAPSIBLE PANEL */}
      <div
        className={`transition-all duration-200 ease-in-out ${
          isOpen && !disabled 
            ? "max-h-[1000px] border-t border-slate-100 p-6 opacity-100" 
            : "max-h-0 opacity-0 pointer-events-none"
        }`}
      >
        {generalError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Project Name
            </label>
            <input
              type="text"
              placeholder="Enter project name"
              value={projectName}
              maxLength={150}
              disabled={disabled} // Gray out text field
              onChange={(e) => {
                setProjectName(e.target.value);
                if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: "" });
              }}
              className={`w-full rounded-lg border px-4 py-2 text-slate-900 outline-none transition-colors ${
                disabled 
                  ? "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed"
                  : fieldErrors.name
                    ? "border-red-500 bg-red-50 focus:border-red-600"
                    : "border-slate-300 focus:border-blue-500"
              }`}
            />
            {fieldErrors.name && (
              <p className="mt-1 text-sm text-red-500">{fieldErrors.name}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              placeholder="Enter project description"
              value={projectDescription}
              maxLength={2000}
              disabled={disabled} // Gray out description area
              onChange={(e) => {
                setProjectDescription(e.target.value);
                if (fieldErrors.description) setFieldErrors({ ...fieldErrors, description: "" });
              }}
              className={`min-h-[100px] w-full rounded-lg border px-4 py-2 text-slate-900 outline-none transition-colors ${
                disabled
                  ? "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed"
                  : fieldErrors.description
                    ? "border-red-500 bg-red-50 focus:border-red-600"
                    : "border-slate-300 focus:border-blue-500"
              }`}
            />
            {fieldErrors.description && (
              <p className="mt-1 text-sm text-red-500">{fieldErrors.description}</p>
            )}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={creating || disabled} // Explicit button lockout state
              className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 whitespace-nowrap"
            >
              {creating ? "Creating..." : "Create Project"}
            </button>
            
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg border border-slate-300 bg-white px-5 py-2 font-medium text-slate-700 transition hover:bg-slate-50 whitespace-nowrap"
            >
              Minimize
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default CreateProjectForm;