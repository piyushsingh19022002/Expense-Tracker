import React from 'react';
import { TrendingUp, TrendingDown, Scale } from 'lucide-react';

/**
 * @description Displays a single metric card for the balance summary row.
 *
 * @param {string}  label     - Display label (e.g. "Total Receivable")
 * @param {number}  amount    - Numeric value (dollars)
 * @param {string}  variant   - 'positive' | 'negative' | 'neutral'
 * @param {string}  currency  - ISO currency code (default: "USD")
 */
const BalanceCard = ({ label, amount, variant = 'neutral', currency = 'USD' }) => {
  const config = {
    positive: {
      icon: TrendingUp,
      colorClass: 'text-brand-success',
      bgClass: 'bg-brand-success/10',
      borderClass: 'border-brand-success/20',
      glowClass: 'shadow-brand-success/5'
    },
    negative: {
      icon: TrendingDown,
      colorClass: 'text-brand-danger',
      bgClass: 'bg-brand-danger/10',
      borderClass: 'border-brand-danger/20',
      glowClass: 'shadow-brand-danger/5'
    },
    neutral: {
      icon: Scale,
      colorClass: 'text-brand-accent',
      bgClass: 'bg-brand-accent/10',
      borderClass: 'border-brand-accent/20',
      glowClass: 'shadow-brand-accent/5'
    }
  };

  const { icon: Icon, colorClass, bgClass, borderClass, glowClass } = config[variant];

  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2
  }).format(Math.abs(amount));

  return (
    <div
      className={`relative flex flex-col gap-4 rounded-xl border ${borderClass} bg-brand-surface p-5 shadow-lg ${glowClass} transition-transform duration-200 hover:-translate-y-0.5`}
    >
      {/* Icon badge */}
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${bgClass}`}>
        <Icon size={20} className={`${colorClass} stroke-[2]`} />
      </div>

      {/* Metric */}
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-text-secondary">
          {label}
        </p>
        <p className={`text-2xl font-black tracking-tight ${colorClass}`}>
          {amount < 0 ? '-' : ''}{formatted}
        </p>
      </div>

      {/* Decorative gradient strip */}
      <div
        className={`absolute bottom-0 left-0 h-0.5 w-full rounded-b-xl ${
          variant === 'positive'
            ? 'bg-gradient-to-r from-transparent via-brand-success to-transparent'
            : variant === 'negative'
            ? 'bg-gradient-to-r from-transparent via-brand-danger to-transparent'
            : 'bg-gradient-to-r from-transparent via-brand-accent to-transparent'
        }`}
      />
    </div>
  );
};

export default BalanceCard;
