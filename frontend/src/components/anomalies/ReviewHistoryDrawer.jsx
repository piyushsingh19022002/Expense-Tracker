import React from 'react';
import { X, History, User, Calendar, ArrowRight } from 'lucide-react';

const formatTimestamp = (isoString) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

const ReviewHistoryDrawer = ({ isOpen, onClose, anomaly }) => {
  if (!isOpen || !anomaly) {
    return null;
  }

  const history = Array.isArray(anomaly.history) ? anomaly.history : [];

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md bg-brand-surface shadow-2xl border-l border-slate-800/80">
      
      {/* Container */}
      <div className="flex h-full w-full flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800/60 px-5 bg-slate-950/20">
          <div className="flex items-center gap-2 text-white">
            <History size={18} className="text-brand-accent stroke-[2.5]" />
            <span className="text-sm font-bold">Audit & Edit History</span>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-slate-500 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Summary Row */}
          <div className="rounded-lg border border-slate-800/60 bg-brand-bg/60 p-4 space-y-2.5">
            <h5 className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary">
              Anomaly Reference
            </h5>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-white">Row {anomaly.rowNumber} - {anomaly.anomalyType}</p>
              <p className="text-[11px] text-brand-text-secondary leading-relaxed">{anomaly.description}</p>
            </div>
            <div className="flex gap-2">
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[9px] font-bold text-brand-text-secondary">
                Status: {anomaly.status}
              </span>
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[9px] font-bold text-brand-text-secondary">
                Severity: {anomaly.severity}
              </span>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Timeline of Modifications</h4>

            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
                <History size={24} className="text-slate-600" />
                <p className="text-xs font-medium text-brand-text-secondary">No edits logged yet</p>
                <p className="text-[10px] text-slate-600">Manual corrections on this row will appear here.</p>
              </div>
            ) : (
              <div className="relative border-l border-slate-800/60 pl-4 space-y-6 ml-2">
                {history.map((log, index) => (
                  <div key={index} className="relative space-y-2">
                    
                    {/* Circle Node */}
                    <div className="absolute -left-[21px] top-0.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-brand-accent ring-4 ring-brand-surface" />
                    
                    {/* Log Details */}
                    <div className="flex items-center gap-4 text-[10px] text-brand-text-secondary">
                      <span className="flex items-center gap-1">
                        <User size={11} />
                        {log.editedById === 'system' ? 'System' : `User (${log.editedById.slice(0, 8)})`}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />
                        {formatTimestamp(log.timestamp)}
                      </span>
                    </div>

                    {/* Diff breakdown */}
                    <div className="rounded-lg border border-slate-800/40 bg-slate-950/20 p-3 space-y-2">
                      {Object.entries(log.changedFields || {}).map(([field, diff]) => (
                        <div key={field} className="grid grid-cols-1 gap-1 text-[10px]">
                          <span className="font-bold text-white truncate">{field}</span>
                          <div className="flex items-center gap-2 text-brand-text-secondary min-w-0">
                            <span className="truncate max-w-[120px] rounded bg-brand-danger/10 border border-brand-danger/10 px-1.5 py-0.5 text-brand-danger italic">
                              {String(diff.oldValue !== null ? diff.oldValue : 'empty')}
                            </span>
                            <ArrowRight size={10} className="shrink-0 text-slate-500" />
                            <span className="truncate max-w-[120px] rounded bg-brand-success/10 border border-brand-success/10 px-1.5 py-0.5 text-brand-success font-semibold">
                              {String(diff.newValue !== null ? diff.newValue : 'empty')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex h-16 shrink-0 items-center justify-end border-t border-slate-800/60 bg-slate-950/20 px-5">
          <button
            onClick={onClose}
            className="h-9 rounded-lg border border-slate-800 px-4 text-xs font-bold text-brand-text-secondary hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
          >
            Close Drawer
          </button>
        </div>

      </div>
    </div>
  );
};

export default ReviewHistoryDrawer;
