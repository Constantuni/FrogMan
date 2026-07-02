import React, { useState } from "react";
import { useWorkspaceStore } from "../../store/workspaceStore";
import { useAuthStore } from "../../store/authStore";
import { parseApiError } from "../../api/errorHelper";

interface AddMemberFormProps {
  workspaceId: string;
}

export const AddMemberForm: React.FC<AddMemberFormProps> = ({ workspaceId }) => {
  const { addMember, changeMemberRole, currentMembers, isLoadingMembers } = useWorkspaceStore();
  const { user } = useAuthStore();
  
  const [email, setEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Member");
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [localError, setLocalError] = useState("");
  const [success, setSuccess] = useState(false);

  // Dynamic authorization check based on current user's role in the workspace
  const currentUserMembership = currentMembers?.find((m) => m.userId === user?.id);
  const currentUserRole = currentUserMembership?.role;
  const isAuthorizedToManage = currentUserRole === "Owner" || currentUserRole === "Admin";

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLocalError("");
    setSuccess(false);
    setSubmitting(true);

    try {
      // FIX 1: Pass the selected inviteRole state to the store action!
      await addMember(workspaceId, email.trim(), inviteRole); 
      setSuccess(true);
      setEmail("");
      setInviteRole("Member");
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      const { title } = parseApiError(err);
      setLocalError(title || "Failed to add member.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleInlineRoleChange = async (targetUserId: string, newRole: string) => {
    // If transferring ownership, give a defensive window prompt
    if (newRole === "Owner") {
      const confirmTransfer = window.confirm(
        "Are you sure you want to transfer ownership? You will be demoted to an Admin."
      );
      if (!confirmTransfer) return;
    }

    setUpdatingId(targetUserId);
    setLocalError("");
    try {
      await changeMemberRole(workspaceId, targetUserId, newRole);
    } catch (err) {
      const { title } = parseApiError(err);
      setLocalError(title || "Failed to alter member authorization hierarchy.");
    } finally {
      setUpdatingId(null);
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
          
          <div className="flex items-center justify-between gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
            <span className="text-xs font-medium text-slate-600">Assign initial role:</span>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="text-xs font-semibold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="Member">Member</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

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

        {isLoadingMembers && (!currentMembers || currentMembers.length === 0) ? (
          <p className="text-xs text-slate-400 italic">Loading roster details...</p>
        ) : currentMembers && currentMembers.length > 0 ? (
          <div className="divide-y divide-slate-100 max-h-[280px] overflow-y-auto pr-1">
            {currentMembers.map((member) => {
              const isSelf = member.userId === user?.id;
              const isTargetOwner = member.role === "Owner";
              
              // Only Owner/Admin can change roles, but they cannot demote owners or change themselves
              const canManageRole = isAuthorizedToManage && !isTargetOwner && !isSelf;

              return (
                <div key={member.userId} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 min-w-0">
                  <div className="min-w-0 flex-1 flex flex-col">
                    <span className="text-sm font-medium text-slate-800 truncate">
                      {member.name} {isSelf && <span className="text-xs text-blue-500 font-normal">(You)</span>}
                    </span>
                    <span className="text-xs text-slate-400 truncate">
                      {member.email}
                    </span>
                  </div>

                  <div className="flex items-center flex-shrink-0">
                    {updatingId === member.userId ? (
                      <span className="text-[11px] font-medium text-slate-400 animate-pulse">Saving...</span>
                    ) : canManageRole ? (
                      <select
                        value={member.role}
                        onChange={(e) => handleInlineRoleChange(member.userId, e.target.value)}
                        className="text-xs font-semibold border border-slate-200 rounded-lg px-2 py-1 bg-slate-50 text-slate-700 outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                      >
                        <option value="Admin">Admin</option>
                        <option value="Member">Member</option>
                        {/* FIX 2: Only the root Owner can see the option to transfer ownership */}
                        {currentUserRole === "Owner" && (
                          <option value="Owner">Owner (Transfer)</option>
                        )}
                      </select>
                    ) : (
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        member.role === "Owner" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                        member.role === "Admin" ? "bg-purple-50 text-purple-700 border border-purple-200" :
                        "bg-slate-100 text-slate-600 border border-transparent"
                      }`}>
                        {member.role}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">No workspace members grouped.</p>
        )}
      </div>
    </div>
  );
};