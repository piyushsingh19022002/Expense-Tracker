import React, { useState, useEffect } from 'react';
import { getGroups } from '../services/groupService.js';
import GroupList from '../components/groups/GroupList.jsx';
import GroupDetails from '../components/groups/GroupDetails.jsx';
import CreateGroupModal from '../components/groups/CreateGroupModal.jsx';
import useAuth from '../hooks/useAuth.js';
import { ChevronLeft, AlertCircle } from 'lucide-react';

/**
 * @description Main Group Management view container.
 * Enforces split-pane grid layouts for desktop and toggled lists for mobile.
 */
const GroupsPage = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [activeGroupId, setActiveGroupId] = useState(null);
  
  // Loading and Error boundaries
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Modal toggle state
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Fetch groups list and optionally select a specific group ID
  const fetchGroupsList = async (autoSelectId = null) => {
    setLoading(true);
    setError('');
    try {
      const response = await getGroups();
      if (response?.success && response.data) {
        setGroups(response.data);
        
        // Auto-select group if requested
        if (autoSelectId) {
          setActiveGroupId(autoSelectId);
        }
      } else {
        setError(response?.message || 'Failed to fetch groups.');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred while loading groups list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupsList();
  }, []);

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col space-y-4">
      
      {/* Main Container Layout */}
      {error ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-brand-surface border border-slate-800/40 rounded-xl gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-danger/10 border border-brand-danger/25 text-brand-danger">
            <AlertCircle size={20} />
          </div>
          <div className="space-y-1">
            <h5 className="text-xs font-bold text-white">Error loading workspace</h5>
            <p className="text-[10px] text-brand-text-secondary max-w-[200px] leading-normal">{error}</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col md:flex-row gap-5 overflow-hidden">
          
          {/* Master Panel: Group list (Hidden on mobile when a group is active) */}
          <div
            className={`w-full md:w-80 h-full shrink-0 flex flex-col ${
              activeGroupId ? 'hidden md:flex' : 'flex'
            }`}
          >
            <GroupList
              groups={groups}
              activeGroupId={activeGroupId}
              onSelectGroup={setActiveGroupId}
              onCreateClick={() => setIsCreateOpen(true)}
              loading={loading}
            />
          </div>

          {/* Details Panel: Group details (Hidden on mobile when no group is active) */}
          <div
            className={`flex-1 h-full flex flex-col ${
              activeGroupId ? 'flex' : 'hidden md:flex'
            }`}
          >
            {/* Mobile Navigation Header */}
            {activeGroupId && (
              <button
                onClick={() => setActiveGroupId(null)}
                className="md:hidden flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800/80 text-[10px] font-bold text-brand-text-secondary hover:text-white transition-all mb-3 cursor-pointer self-start"
              >
                <ChevronLeft size={12} className="stroke-[2.5]" />
                <span>Back to Groups</span>
              </button>
            )}

            <GroupDetails
              groupId={activeGroupId}
              requesterId={user?.id}
              onMemberChange={(hasLeft) => {
                // If they left the group, clear the active selection, otherwise refresh active counts
                if (hasLeft) {
                  setActiveGroupId(null);
                  fetchGroupsList();
                } else {
                  fetchGroupsList(activeGroupId);
                }
              }}
            />
          </div>

        </div>
      )}

      {/* Group Creation Dialog Backdrop */}
      <CreateGroupModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={(newGroup) => {
          fetchGroupsList(newGroup.id);
        }}
      />
      
    </div>
  );
};

export default GroupsPage;
