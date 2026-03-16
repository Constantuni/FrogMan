import { useState } from "react";
import type { CreateProjectRequest } from "../../types/project";

interface Props {
  onCreate: (payload: CreateProjectRequest) => Promise<void>;
}

const CreateProjectForm = ({ onCreate }: Props) => {
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    const trimmedName = projectName.trim();
    if (!trimmedName) return;

    setError("");
    setCreating(true);

    try {
      await onCreate({
        name: trimmedName,
        description: projectDescription.trim() || null,
      });

      setProjectName("");
      setProjectDescription("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create project");
    } finally {
      setCreating(false);
    }
  };

  return (
    <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">
        Create Project
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Project Name
          </label>
          <input
            type="text"
            placeholder="Enter project name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 outline-none transition focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            placeholder="Enter project description"
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            className="min-h-[100px] w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 outline-none transition focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={creating}
          className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {creating ? "Creating..." : "Create Project"}
        </button>
      </form>

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
    </section>
  );
};

export default CreateProjectForm;