import { useState } from "react";

interface Props {
  onCreate: (name: string) => Promise<void>;
}

const CreateWorkspaceForm = ({ onCreate }: Props) => {
  // Toggle state for accordion visibility
  const [isOpen, setIsOpen] = useState(false);

  const [workspaceName, setWorkspaceName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    const trimmedName = workspaceName.trim();

    // Client-side validation mirroring FluentValidation (CascadeMode.Stop)
    if (!trimmedName) {
      setError("Workspace name is required.");
      return;
    } else if (trimmedName.length > 150) {
      setError("Workspace name must not exceed 150 characters.");
      return;
    }

    setCreating(true);

    try {
      await onCreate(trimmedName);
      setWorkspaceName("");
      setIsOpen(false); // Smooth UX: Auto-collapse accordion after successful creation
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create workspace.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <section className="mb-6 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all duration-200">
      
      {/* ACCORDION TRIGGER HEADER BUTTON */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-6 py-4 text-left outline-none hover:bg-slate-50/50"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <h2 className="text-base font-semibold text-slate-900">Create Workspace</h2>
        </div>
        
        {/* Animated Chevron Indicator */}
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
      </button>

      {/* COLLAPSIBLE PANEL */}
      <div
        className={`transition-all duration-200 ease-in-out ${
          isOpen ? "max-h-[300px] border-t border-slate-100 p-6 opacity-100" : "max-h-0 opacity-0 pointer-events-none"
        }`}
      >
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 sm:flex-row items-start sm:items-center"
          noValidate // Disables default browser tooltips
        >
          <div className="w-full flex-1">
            <input
              type="text"
              placeholder="Enter workspace name"
              value={workspaceName}
              onChange={(e) => {
                setWorkspaceName(e.target.value);
                if (error) setError(""); // Smooth UX: clear error when typing starts
              }}
              maxLength={150} // Hard limit at the keystroke level
              className={`w-full rounded-lg border px-4 py-2 text-slate-900 outline-none transition-colors ${
                error
                  ? "border-red-500 bg-red-50 focus:border-red-600"
                  : "border-slate-300 focus:border-blue-500"
              }`}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="submit"
              disabled={creating}
              className="flex-1 sm:flex-initial rounded-lg bg-blue-600 px-5 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60 whitespace-nowrap"
            >
              {creating ? "Creating..." : "Create"}
            </button>
            
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-50 whitespace-nowrap"
            >
              Minimize
            </button>
          </div>
        </form>

        {/* Inline Error State */}
        {error && <p className="mt-3 text-sm font-medium text-red-500">{error}</p>}
      </div>
    </section>
  );
};

export default CreateWorkspaceForm;