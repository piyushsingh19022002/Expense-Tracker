import React, { useState, useEffect } from 'react';
import { getGroupDetails, addMember, removeMember } from '../../services/groupService.js';
import MemberList from './MemberList.jsx';
import AddMemberForm from './AddMemberForm.jsx';
import Card from '../common/Card.jsx';
import { FolderKanban, Users, AlertCircle, AlertTriangle } from 'lucide-react';

/**
 * @description Master Details view panel on the right side.
 * Manages member roster queries and mutations.
 */
const GroupDetails = ({ groupId, onMemberChange, requesterId }) => {
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Local operation states
  const [addMemberLoading, setAddMemberLoading] = useState(false);
  const [operationError, setOperationError] = useState('');

  // Re-fetch group details when active group ID changes
  useEffect(() => {
    const fetchDetails = async () => {
      if (!groupId) {
        setGroup(null);
        return;
      }
      
      setLoading(true);
      setError('');
      setOperationError('');
      try {
        const response = await getGroupDetails(groupId);
        if (response?.success && response.data) {
          setGroup(response.data);
        } else {
          setError(response?.message || 'Failed to retrieve group details.');
        }
      } catch (err) {
        setError(err.message || 'An unexpected error occurred while loading group details.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [groupId]);

  // Invokes API call to add member by email
  const handleAddMember = async (email) => {
    setAddMemberLoading(true);
    setOperationError('');
    try {
      const response = await addMember(groupId, email);
      if (response?.success) {
        // Refresh local details
        const refreshResponse = await getGroupDetails(groupId);
        if (refreshResponse?.success && refreshResponse.data) {
          setGroup(refreshResponse.data);
        }
        
        // Notify parent list to update group counts
        if (onMemberChange) onMemberChange();
        return true;
      } else {
        setOperationError(response?.message || 'Failed to add member.');
        return false;
      }
    } catch (err) {
      setOperationError(err.message || 'An unexpected error occurred while inviting member.');
      return false;
    } finally {
      setAddMemberLoading(false);
    }
  };

  // Invokes API call to remove member or leave group (soft delete)
  const handleRemoveMember = async (userId, userName, isSelf) => {
    const confirmMessage = isSelf
      ? 'Are you sure you want to leave this group? You will no longer be able to participate in new expenses.'
      : `Are you sure you want to remove ${userName} from this group?`;

    if (!window.confirm(confirmMessage)) return;

    setLoading(true);
    setOperationError('');
    try {
      const response = await removeMember(groupId, userId);
      if (response?.success) {
        if (isSelf) {
          // If self-leaving, trigger parent to clear active group selection and refresh lists
          if (onMemberChange) onMemberChange(true);
        } else {
          // Refresh details
          const refreshResponse = await getGroupDetails(groupId);
          if (refreshResponse?.success && refreshResponse.data) {
            setGroup(refreshResponse.data);
          }
          if (onMemberChange) onMemberChange();
        }
      } else {
        setOperationError(response?.message || 'Failed to remove member.');
      }
    } catch (err) {
      setOperationError(err.message || 'An unexpected error occurred while removing member.');
    } finally {
      setLoading(false);
    }
  };

  // 1. Empty State
  if (!groupId) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-brand-surface border border-slate-800/40 rounded-xl">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-accent/5 border border-brand-accent/15 text-brand-accent mb-5 animate-pulse">
          <FolderKanban size={24} className="stroke-[1.5]" />
        </div>
        <h4 className="text-sm font-bold text-white mb-1">No Group Selected</h4>
        <p className="text-[11px] text-brand-text-secondary max-w-[260px] leading-relaxed">
          Select an expense group from the list on the left to see members, settle balances, or view recent ledgers.
        </p>
      </div>
    );
  }

  // 2. Loading State
  if (loading && !group) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-brand-surface border border-slate-800/40 rounded-xl">
        <div className="h-8 w-8 rounded-full border-3 border-brand-accent/20 border-t-brand-accent animate-spin mb-4" />
        <span className="text-xs text-brand-text-secondary font-medium">Loading ledger details...</span>
      </div>
    );
  }

  // 3. Error State
  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-brand-surface border border-slate-800/40 rounded-xl gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-danger/10 border border-brand-danger/25 text-brand-danger">
          <AlertCircle size={20} />
        </div>
        <div className="space-y-1">
          <h5 className="text-xs font-bold text-white">Error loading details</h5>
          <p className="text-[10px] text-brand-text-secondary max-w-[200px] leading-normal">{error}</p>
        </div>
      </div>
    );
  }

  if (!group) return null;

  return (
    <div className="flex flex-col h-full bg-brand-surface border border-slate-800/40 rounded-xl overflow-hidden relative">
      
      {/* Group Header Info */}
      <div className="p-5 border-b border-slate-800/60 bg-slate-900/10">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-white tracking-tight">{group.name}</h3>
            {group.description && (
              <p className="text-xs text-brand-text-secondary leading-relaxed">
                {group.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Operation Errors Banner */}
      {operationError && (
        <div className="mx-5 mt-4 flex items-start gap-2.5 rounded-lg bg-brand-danger/10 border border-brand-danger/25 p-3.5 text-xs text-brand-danger animate-in fade-in slide-in-from-top-1">
          <AlertTriangle size={15} className="shrink-0 mt-0.5" />
          <span>{operationError}</span>
        </div>
      )}

      {/* Details Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        
        {/* Add Member section */}
        <AddMemberForm onAddMember={handleAddMember} loading={addMemberLoading} />

        {/* Members List section */}
        <MemberList
          memberships={group.memberships || []}
          onRemoveMember={handleRemoveMember}
          requesterId={requesterId}
        />
        
      </div>
    </div>
  );
};

export default GroupDetails;
