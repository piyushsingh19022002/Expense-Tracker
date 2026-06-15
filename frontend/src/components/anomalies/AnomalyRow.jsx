import React from 'react';
import { Check, X, Edit2, History, AlertCircle } from 'lucide-react';

const formatTypeLabel = (type) => {
  return type
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const AnomalyRow = ({ anomaly, onApprove, onReject, onEditClick, onHistoryClick }) => {
  const isPending = anomaly.status === 'PENDING';
  const isApproved = anomaly.status === 'APPROVED';
  const isRejected = anomaly.status === 'REJECTED';

  const severityConfigs = {
    LOW: 'bg-slate-800 text-slate-400 border-slate-700/60',
    MEDIUM: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    HIGH: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    CRITICAL: 'bg-brand-danger/10 text-brand-danger border-brand-danger/20'
  };

  const statusConfigs = {
    PENDING: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    APPROVED: 'bg-brand-success/10 text-brand-success border-brand-success/20',
    REJECTED: 'bg-brand-danger/10 text-brand-danger border-brand-danger/20'
  };

  const hasHistory = Array.isArray(anomaly.history) && anomaly.history.length > 0;

  return (
    <tr className="border-b border-slate-800/30 transition-colors duration-150 hover:bg-slate-800/20">
      
      {/* Row Number */}
      <td className="px-5 py-4 text-xs font-bold text-white">
        Row {anomaly.rowNumber}
      </td>

      {/* Anomaly Type */}
      <td className="px-5 py-4 min-w-[150px]">
        <span className="text-xs font-semibold text-white">
          {formatTypeLabel(anomaly.anomalyType)}
        </span>
      </td>

      {/* Severity */}
      <td className="px-5 py-4">
        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${severityConfigs[anomaly.severity]}`}>
          {anomaly.severity}
        </span>
      </td>

      {/* Description */}
      <td className="px-5 py-4 max-w-xs min-w-[200px]">
        <p className="text-xs text-brand-text-secondary leading-relaxed break-words">
          {anomaly.description}
        </p>
      </td>

      {/* Suggested Action */}
      <td className="px-5 py-4 max-w-xs min-w-[200px]">
        <p className="text-xs text-brand-text-secondary leading-relaxed break-words">
          {anomaly.suggestedAction}
        </p>
      </td>

      {/* Status */}
      <td className="px-5 py-4">
        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${statusConfigs[anomaly.status]}`}>
          {anomaly.status}
        </span>
      </td>

      {/* Actions */}
      <td className="px-5 py-4 text-right">
        <div className="flex items-center justify-end gap-1.5">
          {/* Audit History (only if edits exist) */}
          {hasHistory && (
            <button
              onClick={() => onHistoryClick(anomaly)}
              title="View Edit History"
              className="flex h-7 w-7 items-center justify-center rounded bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
            >
              <History size={13} className="stroke-[2.5]" />
            </button>
          )}

          {/* Edit (only if pending) */}
          {isPending && (
            <button
              onClick={() => onEditClick(anomaly)}
              title="Edit Row Data"
              className="flex h-7 w-7 items-center justify-center rounded bg-brand-accent/10 border border-brand-accent/20 text-brand-accent hover:bg-brand-accent hover:text-white hover:border-transparent transition-colors cursor-pointer"
            >
              <Edit2 size={12} className="stroke-[2.5]" />
            </button>
          )}

          {/* Approve Action */}
          {isPending && (
            <button
              onClick={() => onApprove(anomaly.id)}
              title="Approve Anomaly"
              className="flex h-7 w-7 items-center justify-center rounded bg-brand-success/10 border border-brand-success/20 text-brand-success hover:bg-brand-success hover:text-white hover:border-transparent transition-colors cursor-pointer"
            >
              <Check size={13} className="stroke-[3]" />
            </button>
          )}

          {/* Reject Action */}
          {isPending && (
            <button
              onClick={() => onReject(anomaly.id)}
              title="Reject Anomaly"
              className="flex h-7 w-7 items-center justify-center rounded bg-brand-danger/10 border border-brand-danger/20 text-brand-danger hover:bg-brand-danger hover:text-white hover:border-transparent transition-colors cursor-pointer"
            >
              <X size={13} className="stroke-[3]" />
            </button>
          )}

          {!isPending && (
            <span className="text-[10px] text-slate-600 font-semibold italic select-none px-2">
              Resolved
            </span>
          )}
        </div>
      </td>

    </tr>
  );
};

export default AnomalyRow;
