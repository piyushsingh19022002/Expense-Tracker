import React from 'react';
import { CheckCircle2, ShieldAlert, AlertOctagon } from 'lucide-react';

const ActionsTakenTable = ({ actions }) => {
  if (!actions) return null;

  const { imported = 0, rejected = 0, pendingReview = 0 } = actions;
  const total = imported + rejected + pendingReview;
  const importedPct = total > 0 ? Math.round((imported / total) * 100) : 0;
  const rejectedPct = total > 0 ? Math.round((rejected / total) * 100) : 0;
  const pendingPct = total > 0 ? Math.round((pendingReview / total) * 100) : 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        
        {/* Imported Card */}
        <div className="flex items-center justify-between rounded-xl border border-brand-success/20 bg-brand-success/5 p-4 shadow-lg shadow-brand-success/5">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary">
              Imported successfully
            </p>
            <p className="text-xl font-black text-brand-success leading-none">{imported} rows</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-success/10 text-brand-success border border-brand-success/15">
            <CheckCircle2 size={16} />
          </div>
        </div>

        {/* Rejected Card */}
        <div className="flex items-center justify-between rounded-xl border border-brand-danger/20 bg-brand-danger/5 p-4 shadow-lg shadow-brand-danger/5">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary">
              Excluded / Rejected
            </p>
            <p className="text-xl font-black text-brand-danger leading-none">{rejected} rows</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-danger/10 text-brand-danger border border-brand-danger/15">
            <AlertOctagon size={16} />
          </div>
        </div>

        {/* Pending Review Card */}
        <div className="flex items-center justify-between rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 shadow-lg shadow-yellow-500/5">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary">
              Pending Validation
            </p>
            <p className="text-xl font-black text-yellow-500 leading-none">{pendingReview} rows</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-500/10 text-yellow-500 border border-yellow-500/15">
            <ShieldAlert size={16} />
          </div>
        </div>

      </div>

      {/* Progress Bar Visualizer */}
      {total > 0 && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800/80 flex">
          <div
            style={{ width: `${importedPct}%` }}
            title={`Imported: ${importedPct}%`}
            className="h-full bg-brand-success transition-all duration-300"
          />
          <div
            style={{ width: `${pendingPct}%` }}
            title={`Pending: ${pendingPct}%`}
            className="h-full bg-yellow-500 transition-all duration-300"
          />
          <div
            style={{ width: `${rejectedPct}%` }}
            title={`Rejected: ${rejectedPct}%`}
            className="h-full bg-brand-danger transition-all duration-300"
          />
        </div>
      )}
    </div>
  );
};

export default ActionsTakenTable;
