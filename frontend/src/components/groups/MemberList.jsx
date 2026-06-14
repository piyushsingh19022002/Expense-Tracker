import React from 'react';
import { UserMinus, Check, LogOut, CornerDownRight } from 'lucide-react';

/**
 * @description Displays active and departed group members.
 * 
 * @param {Object} props
 * @param {Array} props.memberships - Array of group memberships
 * @param {Function} props.onRemoveMember - Callback to soft-delete a member
 * @param {string} props.requesterId - ID of the authenticated user
 */
const MemberList = ({ memberships, onRemoveMember, requesterId }) => {
  
  // Format dates nicely
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary">
          Members ({memberships.filter((m) => m.status === 'ACTIVE').length} active)
        </h4>
      </div>

      <div className="divide-y divide-slate-800/40 rounded-xl border border-slate-800/40 bg-slate-900/10 overflow-hidden">
        {memberships.map((membership) => {
          const isCurrentUser = membership.userId === requesterId;
          const isActive = membership.status === 'ACTIVE';
          const memberUser = membership.user || {};

          return (
            <div
              key={membership.id}
              className={`flex items-center justify-between p-3 transition-colors ${
                isActive ? 'hover:bg-slate-800/10' : 'bg-slate-950/20 opacity-70'
              }`}
            >
              {/* User details */}
              <div className="flex items-center gap-2.5">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full font-bold text-xs uppercase border ${
                    isActive
                      ? 'bg-brand-accent/10 border-brand-accent/20 text-brand-accent'
                      : 'bg-slate-800 border-slate-700/50 text-brand-text-secondary'
                  }`}
                >
                  {memberUser.name ? memberUser.name.charAt(0) : '?'}
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-white">
                      {memberUser.name}
                    </span>
                    {isCurrentUser && (
                      <span className="rounded bg-slate-800/80 border border-slate-700/50 px-1.5 py-0.5 text-[8px] font-semibold text-brand-text-secondary uppercase tracking-wider">
                        You
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-brand-text-secondary">
                    {memberUser.email}
                  </p>
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="flex items-center gap-3">
                {isActive ? (
                  // Active Member
                  <>
                    <span className="flex items-center gap-1 rounded bg-brand-success/10 border border-brand-success/20 px-2 py-0.5 text-[9px] font-bold text-brand-success uppercase tracking-wider">
                      <Check size={10} className="stroke-[3]" />
                      Active
                    </span>

                    {/* Action button */}
                    <button
                      onClick={() => onRemoveMember(membership.userId, memberUser.name, isCurrentUser)}
                      title={isCurrentUser ? 'Leave Group' : 'Remove Member'}
                      className={`rounded-lg p-1.5 transition-all duration-200 border cursor-pointer ${
                        isCurrentUser
                          ? 'border-slate-800/80 hover:border-brand-danger/30 hover:bg-brand-danger/5 text-brand-text-secondary hover:text-brand-danger'
                          : 'border-slate-800/80 hover:border-brand-danger/30 hover:bg-brand-danger/5 text-brand-text-secondary hover:text-brand-danger'
                      }`}
                    >
                      {isCurrentUser ? (
                        <LogOut size={13} className="stroke-[2.5]" />
                      ) : (
                        <UserMinus size={13} className="stroke-[2.5]" />
                      )}
                    </button>
                  </>
                ) : (
                  // Departed Member
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="rounded bg-slate-800/60 border border-slate-700/30 px-2 py-0.5 text-[9px] font-semibold text-brand-text-secondary uppercase tracking-wider">
                      Left
                    </span>
                    {membership.leftAt && (
                      <span className="text-[8px] text-brand-text-secondary flex items-center gap-0.5">
                        <CornerDownRight size={8} />
                        {formatDate(membership.leftAt)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MemberList;
