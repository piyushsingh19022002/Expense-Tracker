import React from 'react';
import { AlertOctagon } from 'lucide-react';

const formatTypeLabel = (type) => {
  return type
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const FailedRowsTable = ({ rows = [] }) => {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-slate-800/40 bg-brand-surface py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800/60 text-brand-text-secondary">
          <AlertOctagon size={22} />
        </div>
        <p className="text-sm font-semibold text-white">No failed/rejected rows</p>
        <p className="text-xs text-brand-text-secondary mt-1">
          No records in this import batch have been rejected.
        </p>
      </div>
    );
  }

  const fmt = (amt, curr = 'USD') =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: curr,
      minimumFractionDigits: 2
    }).format(Math.abs(parseFloat(amt || 0)));

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800/40 bg-brand-surface">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-slate-800/50 bg-slate-950/20">
            <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary">
              Row
            </th>
            <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary">
              Description
            </th>
            <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary">
              Transaction Details
            </th>
            <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary">
              Reason for Failure / Rejection
            </th>
            <th className="px-5 py-3.5 text-right text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary">
              Amount
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/20">
          {rows.map((row) => {
            const { data, anomalies = [] } = row;
            const desc = data.Description || data.description || '';
            const date = data.Date || data.date || '';
            const paidBy = data['Paid By'] || data['paid_by'] || data['payer'] || '';
            const amount = data.Amount || data.amount || 0;
            const currency = data.Currency || data.currency || 'USD';

            return (
              <tr key={row.rowNumber} className="border-b border-slate-800/30 transition-colors duration-150 hover:bg-slate-800/20">
                
                {/* Row */}
                <td className="px-5 py-4 text-xs font-bold text-white">
                  Row {row.rowNumber}
                </td>
                
                {/* Description */}
                <td className="px-5 py-4 text-xs font-semibold text-white truncate max-w-[150px]">
                  {desc}
                </td>
                
                {/* Transaction details */}
                <td className="px-5 py-4 text-[11px] text-brand-text-secondary space-y-0.5">
                  <p>Date: <span className="text-white">{date}</span></p>
                  <p className="truncate max-w-[150px]">Paid: <span className="text-white">{paidBy}</span></p>
                </td>
                
                {/* Failure reason */}
                <td className="px-5 py-4 max-w-xs min-w-[200px]">
                  <div className="flex flex-col gap-1.5">
                    {anomalies.map((a) => (
                      <div key={a.id} className="text-[11px] leading-relaxed">
                        <span className="font-bold text-brand-danger uppercase text-[9px] mr-1">
                          [{formatTypeLabel(a.type)}]
                        </span>
                        <span className="text-brand-text-secondary">{a.description}</span>
                      </div>
                    ))}
                  </div>
                </td>
                
                {/* Amount */}
                <td className="px-5 py-4 text-right text-xs font-bold text-brand-danger">
                  {fmt(amount, currency)}
                </td>

              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default FailedRowsTable;
