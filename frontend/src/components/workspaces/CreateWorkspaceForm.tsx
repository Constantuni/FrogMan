import { useState } from "react";

interface Props {
  onCreate: (name: string) => Promise<void>;
}

const CreateWorkspaceForm = ({ onCreate }: Props) => {
  const [workspaceName, setWorkspaceName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    const trimmedName = workspaceName.trim();
    if (!trimmedName) return;

    setError("");
    setCreating(true);

    try {
      await onCreate(trimmedName);
      setWorkspaceName("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create workspace");
    } finally {
      setCreating(false);
    }
  };

  return (
    <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">
        Create Workspace
      </h2>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <input
          type="text"
          placeholder="Enter workspace name"
          value={workspaceName}
          onChange={(e) => setWorkspaceName(e.target.value)}
          className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-slate-900 outline-none focus:border-blue-500"
          required
        />

        <button
          type="submit"
          disabled={creating}
          className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {creating ? "Creating..." : "Create"}
        </button>
      </form>

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
    </section>
  );
};

export default CreateWorkspaceForm;