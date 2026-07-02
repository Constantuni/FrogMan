import React, { useState } from "react";
import { useWorkspaceStore } from "../../store/workspaceStore";
import { parseApiError } from "../../api/errorHelper";

interface AddMemberFormProps {
  workspaceId: string;
}

export const AddMemberForm: React.FC<AddMemberFormProps> = ({ workspaceId }) => {
  const { addMember, currentMembers, isLoadingMembers } = useWorkspaceStore();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLocalError("");
    setSuccess(false);
    setSubmitting(true);

    try {
      await addMember(workspaceId, email.trim());
      setSuccess(true);
      setEmail("");
      // Hide success banner after a few seconds to keep it clean
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      const { title } = parseApiError(err);
      setLocalError(title || "Failed to add member.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* INVITATION PANEL */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900 mb-1">Invite Member</h3>
        <p className="text-xs text-slate-500 mb-3">Add a registered collaborator by email.</p>
        
        <form onSubmit={handleAddUser} className="flex flex-col gap-2">
          <input
            type="email"
            placeholder="colleague@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-900 outline-none transition focus:border-blue-500"
            required
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Adding..." : "Add Member"}
          </button>
        </form>
        
        {success && <p className="mt-2 text-xs font-medium text-green-600">Member added successfully!</p>}
        {localError && <p className="mt-2 text-xs font-medium text-red-500">{localError}</p>}
      </div>

      {/* ACTIVE ROSTER PANEL */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Workspace Directory</h3>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
            {currentMembers?.length ?? 0}
          </span>
        </div>

        {isLoadingMembers ? (
          <p className="text-xs text-slate-400 italic">Loading roster details...</p>
        ) : currentMembers && currentMembers.length > 0 ? (
          <div className="divide-y divide-slate-100 max-h-[240px] overflow-y-auto pr-1">
            {currentMembers.map((member) => (
              <div key={member.userId} className="py-2.5 first:pt-0 last:pb-0 flex flex-col min-w-0">
                <span className="text-sm font-medium text-slate-800 truncate">
                  {member.name}
                </span>
                <span className="text-xs text-slate-400 truncate">
                  {member.email}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">No workspace members grouped.</p>
        )}
      </div>
    </div>
  );
};