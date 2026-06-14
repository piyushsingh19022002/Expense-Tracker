import React, { useState, useEffect } from 'react';
import { getExpense } from '../../services/expenseService.js';
import Button from '../common/Button.jsx';
import { Receipt, Calendar, CreditCard, User, Users, Edit2, Trash2, AlertCircle } from 'lucide-react';

/**
 * @description Detail card view showing full expense breakdowns and action controllers.
 */
const ExpenseDetails = ({ expenseId, onEditClick, onDeleteClick }) => {
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch expense details when active expense ID changes
  useEffect(() => {
    const fetchDetails = async () => {
      if (!expenseId) {
        setExpense(null);
        return;
      }
      
      setLoading(true);
      setError('');
      try {
        const response = await getExpense(expenseId);
        if (response?.success && response.data) {
          setExpense(response.data);
        } else {
          setError(response?.message || 'Failed to retrieve expense details.');
        }
      } catch (err) {
        setError(err.message || 'An unexpected error occurred while loading details.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [expenseId]);

  // Format date
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 1. Empty State
  if (!expenseId) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-brand-surface border border-slate-800/40 rounded-xl">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-accent/5 border border-brand-accent/15 text-brand-accent mb-5 animate-pulse">
          <Receipt size={24} className="stroke-[1.5]" />
        </div>
        <h4 className="text-sm font-bold text-white mb-1">No Expense Selected</h4>
        <p className="text-[11px] text-brand-text-secondary max-w-[260px] leading-relaxed">
          Select an expense from the list to see who paid, split participant details, and settlement metrics.
        </p>
      </div>
    );
  }

  // 2. Loading State
  if (loading && !expense) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-brand-surface border border-slate-800/40 rounded-xl">
        <div className="h-8 w-8 rounded-full border-3 border-brand-accent/20 border-t-brand-accent animate-spin mb-4" />
        <span className="text-xs text-brand-text-secondary font-medium">Loading details...</span>
      </div>
    );
  }

  // 3. Error State
  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-brand-surface border border-slate-800/40 rounded-xl gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-danger/10 border border-brand-danger/25 text-brand-danger">
          <AlertCircle size={20} />
        </div>
        <div className="space-y-1">
          <h5 className="text-xs font-bold text-white">Error loading details</h5>
          <p className="text-[10px] text-brand-text-secondary max-w-[200px] leading-normal">{error}</p>
        </div>
      </div>
    );
  }

  if (!expense) return null;

  const amountStr = parseFloat(expense.amount).toFixed(2);

  return (
    <div className="flex flex-col h-full bg-brand-surface border border-slate-800/40 rounded-xl overflow-hidden relative">
      
      {/* Header Info */}
      <div className="p-5 border-b border-slate-800/60 bg-slate-900/10 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white tracking-tight line-clamp-2">
              {expense.description}
            </h3>
            <div className="flex items-center gap-1.5 text-[10px] text-brand-text-secondary">
              <Calendar size={11} />
              <span>{formatDate(expense.date)}</span>
            </div>
          </div>

          <div className="text-right shrink-0">
            <p className="text-xl font-extrabold text-white tracking-tight">
              {expense.currency} {amountStr}
            </p>
            <p className="text-[9px] text-brand-text-secondary mt-0.5">
              Logged by {expense.createdBy?.name || 'Unknown'}
            </p>
          </div>
        </div>
      </div>

      {/* Details list area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        
        {/* Payer Summary */}
        <div className="flex items-center gap-3.5 rounded-xl border border-slate-800/40 bg-slate-900/10 p-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-success/10 border border-brand-success/20 text-brand-success">
            <CreditCard size={16} />
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary">
              Paid By
            </p>
            <h5 className="text-xs font-semibold text-white">
              {expense.paidBy?.name}{' '}
              <span className="font-normal text-[10px] text-brand-text-secondary">
                ({expense.paidBy?.email})
              </span>
            </h5>
          </div>
        </div>

        {/* Splits and participant roster */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary flex items-center gap-1.5">
            <Users size={12} className="stroke-[2.5]" />
            Split Breakdown ({expense.participants?.length || 0} participants)
          </h4>

          <div className="divide-y divide-slate-800/40 rounded-xl border border-slate-800/40 bg-slate-900/5 overflow-hidden">
            {expense.participants?.map((part) => {
              const u = part.user || {};
              const shareStr = parseFloat(part.share).toFixed(2);
              return (
                <div key={part.id} className="flex items-center justify-between p-3.5 hover:bg-slate-800/10 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 border border-slate-700/50 text-[11px] font-bold text-brand-text-secondary uppercase">
                      {u.name ? u.name.charAt(0) : '?'}
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-white">{u.name}</p>
                      <p className="text-[9px] text-brand-text-secondary">{u.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-white">
                      {expense.currency} {shareStr}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Footer controls */}
      <div className="p-4 border-t border-slate-800/60 flex items-center justify-end gap-3 bg-slate-900/10">
        <Button
          variant="outline"
          onClick={onEditClick}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold border-slate-850 hover:bg-slate-800"
        >
          <Edit2 size={13} className="stroke-[2.5]" />
          <span>Edit</span>
        </Button>
        <button
          onClick={onDeleteClick}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg border border-brand-danger/20 bg-brand-danger/5 hover:bg-brand-danger/10 text-brand-danger transition-all duration-200 cursor-pointer"
        >
          <Trash2 size={13} className="stroke-[2.5]" />
          <span>Delete</span>
        </button>
      </div>

    </div>
  );
};

export default ExpenseDetails;
