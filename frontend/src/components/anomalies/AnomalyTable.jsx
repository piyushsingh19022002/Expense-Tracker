import React from 'react';
import AnomalyRow from './AnomalyRow.jsx';
import { ShieldAlert } from 'lucide-react';

const AnomalyTable = ({ anomalies = [], onApprove, onReject, onEditClick, onHistoryClick }) => {
  if (anomalies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-slate-800/40 bg-brand-surface py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800/60 text-brand-text-secondary">
          <ShieldAlert size={22} />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">No anomalies matching filters</p>
          <p className="text-xs text-brand-text-secondary mt-1">
            Adjust your filter criteria or upload a new file.
          </p>
        </div>
      </div>
    );
  }

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
            <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary">
              Status
            </th>
            <th className="px-5 py-3.5 text-right text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/20">
          {anomalies.map((anomaly) => (
            <AnomalyRow
              key={anomaly.id}
              anomaly={anomaly}
              onApprove={onApprove}
              onReject={onReject}
              onEditClick={onEditClick}
              onHistoryClick={onHistoryClick}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AnomalyTable;
