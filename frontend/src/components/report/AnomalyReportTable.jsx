import React from 'react';
import { ShieldAlert } from 'lucide-react';

const formatTypeLabel = (type) => {
  return type
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const AnomalyReportTable = ({ anomalies = [] }) => {
  if (anomalies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-slate-800/40 bg-brand-surface py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800/60 text-brand-text-secondary">
          <ShieldAlert size={22} />
        </div>
        <p className="text-sm font-semibold text-white">No anomalies detected</p>
        <p className="text-xs text-brand-text-secondary mt-1">
          This CSV import batch contains no warning anomalies.
        </p>
      </div>
    );
  }

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

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800/40 bg-brand-surface">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-slate-800/50 bg-slate-950/20">
            <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary">
              Row
            </th>
            <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary">
              Anomaly Type
            </th>
            <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary">
              Severity
            </th>
            <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary">
              Description
            </th>
            <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary">
              Suggested Action
            </th>
            <th className="px-5 py-3.5 text-right text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary">
              Review Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/20">
          {anomalies.map((anomaly, idx) => (
            <tr key={idx} className="border-b border-slate-800/30 transition-colors duration-150 hover:bg-slate-800/20">
              
              {/* Row */}
              <td className="px-5 py-4 text-xs font-bold text-white">
                Row {anomaly.rowNumber}
              </td>
              
              {/* Type */}
              <td className="px-5 py-4 text-xs font-semibold text-white truncate max-w-[150px]">
                {formatTypeLabel(anomaly.type)}
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
              <td className="px-5 py-4 text-right">
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${statusConfigs[anomaly.status]}`}>
                  {anomaly.status}
                </span>
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AnomalyReportTable;
