import React from 'react';
import { User } from 'lucide-react';

/**
 * @description Full group balance table showing every member's paid/share/net figures.
 *
 * @param {Array}  balances - Enriched balance array (name, email, totalPaid, totalShare, netBalance)
 * @param {string} userId   - Current user's ID (highlights current user row)
 */
const BalanceTable = ({ balances = [], userId }) => {
  const fmt = (n) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(Math.abs(n));

  if (!balances.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-slate-800/40 bg-brand-surface py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800/60 text-brand-text-secondary">
          <User size={22} />
        </div>
        <p className="text-sm font-medium text-brand-text-secondary">No balance data yet</p>
        <p className="text-xs text-slate-600">Add expenses to see member balances</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800/40 bg-brand-surface">
      {/* Table Header */}
      <div className="grid grid-cols-4 border-b border-slate-800/40 px-5 py-3">
        {['Member', 'Total Paid', 'Total Share', 'Net Balance'].map((h) => (
          <span
            key={h}
            className="text-[10px] font-bold uppercase tracking-widest text-brand-text-secondary first:col-span-1 last:text-right"
          >
            {h}
          </span>
        ))}
      </div>

      {/* Rows */}
      <div className="divide-y divide-slate-800/30">
        {balances.map((b) => {
          const isMe = b.userId === userId;
          const isPositive = b.netBalance > 0;
          const isNegative = b.netBalance < 0;

          return (
            <div
              key={b.userId}
              className={`grid grid-cols-4 items-center px-5 py-4 transition-colors duration-150 hover:bg-slate-800/20 ${
                isMe ? 'bg-brand-accent/5' : ''
              }`}
            >
              {/* Member name */}
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-white">
                  {b.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {b.name}
                    {isMe && (
                      <span className="ml-1.5 rounded-full bg-brand-accent/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-brand-accent">
                        You
                      </span>
                    )}
                  </p>
                  <p className="truncate text-[10px] text-brand-text-secondary">{b.email}</p>
                </div>
              </div>

              {/* Total Paid */}
              <span className="text-sm font-medium text-brand-text-secondary">
                {fmt(b.totalPaid)}
              </span>

              {/* Total Share */}
              <span className="text-sm font-medium text-brand-text-secondary">
                {fmt(b.totalShare)}
              </span>

              {/* Net Balance */}
              <span
                className={`text-right text-sm font-bold ${
                  isPositive
                    ? 'text-brand-success'
                    : isNegative
                    ? 'text-brand-danger'
                    : 'text-brand-text-secondary'
                }`}
              >
                {isPositive ? '+' : isNegative ? '-' : ''}
                {fmt(b.netBalance)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BalanceTable;
