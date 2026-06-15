import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const ImportedRowsTable = ({ rows = [] }) => {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-slate-800/40 bg-brand-surface py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800/60 text-brand-text-secondary">
          <CheckCircle2 size={22} />
        </div>
        <p className="text-sm font-semibold text-white">No imported rows</p>
        <p className="text-xs text-brand-text-secondary mt-1">
          No records in this batch have been successfully imported/approved.
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
              Date
            </th>
            <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary">
              Paid By
            </th>
            <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary">
              Split Between
            </th>
            <th className="px-5 py-3.5 text-right text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary">
              Amount
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/20">
          {rows.map((row) => {
            const { data } = row;
            const desc = data.Description || data.description || '';
            const date = data.Date || data.date || '';
            const paidBy = data['Paid By'] || data['paid_by'] || data['payer'] || '';
            const split = data['Split Between'] || data['split_between'] || data['participants'] || '';
            const amount = data.Amount || data.amount || 0;
            const currency = data.Currency || data.currency || 'USD';

            return (
              <tr key={row.rowNumber} className="border-b border-slate-800/30 transition-colors duration-150 hover:bg-slate-800/20">
                <td className="px-5 py-4 text-xs font-bold text-white">
                  Row {row.rowNumber}
                </td>
                <td className="px-5 py-4 text-xs font-semibold text-white truncate max-w-[200px]">
                  {desc}
                </td>
                <td className="px-5 py-4 text-xs text-brand-text-secondary">
                  {date}
                </td>
                <td className="px-5 py-4 text-xs text-brand-text-secondary truncate max-w-[150px]">
                  {paidBy}
                </td>
                <td className="px-5 py-4 text-xs text-brand-text-secondary truncate max-w-[220px]">
                  {String(split).replace(/;/g, ', ')}
                </td>
                <td className="px-5 py-4 text-right text-xs font-bold text-brand-success">
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

export default ImportedRowsTable;
