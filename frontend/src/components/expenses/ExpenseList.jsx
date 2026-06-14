import React, { useState } from 'react';
import ExpenseCard from './ExpenseCard.jsx';
import Button from '../common/Button.jsx';
import { Plus, Search, Receipt, X } from 'lucide-react';

/**
 * @description Lists group expenses with filter search and creation callbacks.
 */
const ExpenseList = ({ expenses, activeExpenseId, onSelectExpense, onAddExpenseClick, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter expenses by description
  const filteredExpenses = expenses.filter((exp) =>
    exp.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-brand-surface border border-slate-800/40 rounded-xl overflow-hidden">
      {/* Header section with Create trigger */}
      <div className="p-4 border-b border-slate-800/60 flex items-center justify-between gap-4 bg-slate-900/10">
        <div>
          <h3 className="text-sm font-bold text-white">Expenses Ledger</h3>
          <p className="text-[10px] text-brand-text-secondary">Logged group expenses</p>
        </div>
        <Button
          onClick={onAddExpenseClick}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold shadow-md shadow-brand-accent/15 shrink-0"
        >
          <Plus size={14} className="stroke-[2.5]" />
          <span>Add Expense</span>
        </Button>
      </div>

      {/* Search Bar */}
      {expenses.length > 0 && (
        <div className="px-4 py-2 border-b border-slate-800/60 bg-slate-950/20 relative">
          <Search size={12} className="absolute left-7 top-1/2 -translate-y-1/2 text-brand-text-secondary" />
          <input
            type="text"
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg bg-slate-900/40 border border-slate-800/80 pl-8 pr-7 py-1.5 text-xs text-brand-text-primary placeholder:text-brand-text-secondary focus:outline-none focus:border-brand-accent/50 focus:ring-1 focus:ring-brand-accent/50 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-brand-text-secondary hover:text-white"
            >
              <X size={12} />
            </button>
          )}
        </div>
      )}

      {/* List content container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="h-6 w-6 rounded-full border-2 border-brand-accent/20 border-t-brand-accent animate-spin" />
            <span className="text-[10px] text-brand-text-secondary font-medium">Loading ledger...</span>
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 px-4 gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800/40 border border-slate-800/80 text-brand-text-secondary">
              <Receipt size={20} className="stroke-[1.5]" />
            </div>
            <div className="space-y-1 max-w-[200px]">
              <h5 className="text-xs font-bold text-white">
                {searchTerm ? 'No search results' : 'No expenses logged'}
              </h5>
              <p className="text-[10px] text-brand-text-secondary leading-normal">
                {searchTerm
                  ? 'Try adjusting your search query.'
                  : 'Log a new shared expense to split the amount among group members.'}
              </p>
            </div>
            {!searchTerm && (
              <Button
                variant="outline"
                onClick={onAddExpenseClick}
                className="text-[10px] font-bold px-4 py-1.5 mt-2 border-slate-800 hover:border-slate-700"
              >
                Log First Expense
              </Button>
            )}
          </div>
        ) : (
          filteredExpenses.map((expense) => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              isActive={expense.id === activeExpenseId}
              onClick={() => onSelectExpense(expense.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ExpenseList;
