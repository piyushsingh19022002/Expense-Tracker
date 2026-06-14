import React from 'react';
import Card from '../common/Card.jsx';
import { Users, Calendar } from 'lucide-react';

/**
 * @description Renders a summary card for a single group.
 * 
 * @param {Object} props
 * @param {Object} props.group - Group data model
 * @param {boolean} props.isActive - Whether this card is currently selected
 * @param {Function} props.onClick - Click event callback
 */
const GroupCard = ({ group, isActive, onClick }) => {
  const activeMembersCount = group.memberships
    ? group.memberships.filter((m) => m.status === 'ACTIVE').length
    : 0;

  const dateString = new Date(group.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div onClick={onClick} className="cursor-pointer">
      <Card
        className={`transition-all duration-200 border p-4 flex flex-col gap-3 relative overflow-hidden ${
          isActive
            ? 'border-brand-accent/60 bg-brand-accent/5 shadow-md shadow-brand-accent/5'
            : 'border-slate-800/40 hover:border-slate-700/60 hover:bg-slate-800/20'
        }`}
      >
        {/* Subtle left-side active indicator bar */}
        {isActive && (
          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-brand-accent" />
        )}

        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white tracking-tight line-clamp-1">
              {group.name}
            </h4>
            {group.description && (
              <p className="text-[11px] text-brand-text-secondary line-clamp-2 leading-relaxed">
                {group.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-800/40 pt-3.5 text-[10px] text-brand-text-secondary">
          <div className="flex items-center gap-1.5 font-medium">
            <Users size={12} className="text-brand-accent stroke-[2.5]" />
            <span>
              {activeMembersCount} {activeMembersCount === 1 ? 'member' : 'members'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar size={12} className="stroke-[2.5]" />
            <span>{dateString}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default GroupCard;
