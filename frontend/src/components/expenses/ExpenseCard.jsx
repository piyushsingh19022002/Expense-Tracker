import React from 'react';
import Card from '../common/Card.jsx';
import { CreditCard, Calendar, Users } from 'lucide-react';

/**
 * @description Renders a summary card for a single logged expense.
 * 
 * @param {Object} props
 * @param {Object} props.expense - Expense data model
 * @param {boolean} props.isActive - Whether this card is currently selected
 * @param {Function} props.onClick - Click event callback
 */
const ExpenseCard = ({ expense, isActive, onClick }) => {
  const dateString = new Date(expense.date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const participantCount = expense.participants ? expense.participants.length : 0;
  const payerName = expense.paidBy ? expense.paidBy.name : 'Unknown';
  const amountStr = parseFloat(expense.amount).toFixed(2);

  return (
    <div onClick={onClick} className="cursor-pointer">
      <Card
        className={`transition-all duration-200 border p-4 flex flex-col gap-3.5 relative overflow-hidden ${
          isActive
            ? 'border-brand-accent/60 bg-brand-accent/5 shadow-md shadow-brand-accent/5'
            : 'border-slate-800/40 hover:border-slate-700/60 hover:bg-slate-800/20'
        }`}
      >
        {/* Subtle left-side active indicator bar */}
        {isActive && (
          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-brand-accent" />
        )}

        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-white tracking-tight line-clamp-1">
              {expense.description}
            </h4>
            <p className="text-[10px] text-brand-text-secondary">
              Paid by <span className="font-semibold text-white/80">{payerName}</span>
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-sm font-bold text-white tracking-tight">
              {expense.currency} {amountStr}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-800/40 pt-3 text-[10px] text-brand-text-secondary">
          <div className="flex items-center gap-1.5 font-medium">
            <Users size={12} className="text-brand-accent stroke-[2.5]" />
            <span>
              Split between {participantCount} {participantCount === 1 ? 'member' : 'members'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar size={12} className="stroke-[2.5]" />
            <span>{dateString}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ExpenseCard;
