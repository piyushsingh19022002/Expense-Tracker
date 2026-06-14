import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

/**
 * @description Visual card representing a single "A owes B" debt pair.
 *
 * @param {string} debtorName   - Name of the person who owes money
 * @param {string} creditorName - Name of the person who is owed
 * @param {number} amount       - Amount owed (always positive)
 * @param {string} currency     - ISO currency (default: "USD")
 * @param {string} userId       - Current user's ID (for contextual labelling)
 * @param {string} debtorId     - Debtor user ID
 * @param {string} creditorId   - Creditor user ID
 */
const OwesWhoCard = ({
  debtorName,
  creditorName,
  amount,
  currency = 'USD',
  userId,
  debtorId,
  creditorId
}) => {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2
  }).format(amount);

  const isIowe = userId === debtorId;
  const theyOweMe = userId === creditorId;

  const displayDebtor = isIowe ? 'You' : debtorName;
  const displayCreditor = theyOweMe ? 'You' : creditorName;

  return (
    <div
      className={`flex items-center justify-between gap-4 rounded-xl border px-5 py-4 transition-all duration-200 hover:-translate-y-0.5 ${
        isIowe
          ? 'border-brand-danger/20 bg-brand-danger/5 shadow-brand-danger/5 shadow-md'
          : theyOweMe
          ? 'border-brand-success/20 bg-brand-success/5 shadow-brand-success/5 shadow-md'
          : 'border-slate-800/40 bg-brand-surface'
      }`}
    >
      {/* Left — Debtor */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
            isIowe
              ? 'bg-brand-danger/20 text-brand-danger'
              : 'bg-slate-800 text-white'
          }`}
        >
          {displayDebtor[0]?.toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{displayDebtor}</p>
          <p className="text-[10px] text-brand-text-secondary">owes</p>
        </div>
      </div>

      {/* Center — Arrow & Amount */}
      <div className="flex flex-col items-center gap-0.5 shrink-0">
        <span
          className={`text-base font-black ${
            isIowe ? 'text-brand-danger' : theyOweMe ? 'text-brand-success' : 'text-white'
          }`}
        >
          {formatted}
        </span>
        <ArrowRight
          size={14}
          className={`${
            isIowe
              ? 'text-brand-danger'
              : theyOweMe
              ? 'text-brand-success'
              : 'text-brand-text-secondary'
          } stroke-[2.5]`}
        />
      </div>

      {/* Right — Creditor */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="min-w-0 text-right">
          <p className="truncate text-sm font-semibold text-white">{displayCreditor}</p>
          <p className="text-[10px] text-brand-text-secondary">
            {theyOweMe ? (
              <span className="text-brand-success font-semibold">← receives</span>
            ) : (
              'receives'
            )}
          </p>
        </div>
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
            theyOweMe
              ? 'bg-brand-success/20 text-brand-success'
              : 'bg-slate-800 text-white'
          }`}
        >
          {displayCreditor[0]?.toUpperCase()}
        </div>
      </div>
    </div>
  );
};

export default OwesWhoCard;
