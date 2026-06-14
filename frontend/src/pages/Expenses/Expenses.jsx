import React, { useState } from 'react';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import { Plus, Search, Filter, Calendar, DollarSign, Tag } from 'lucide-react';

/**
 * @description Expenses ledger view with search and categorizations.
 */
const Expenses = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const expenses = [
    { id: 1, name: 'AWS Cloud Hosting', category: 'Infrastructure', amount: 120.00, date: '2026-06-14' },
    { id: 2, name: 'WeWork Office Space', category: 'Office Rent', amount: 1200.00, date: '2026-06-10' },
    { id: 3, name: 'Figma Team Plan', category: 'Software', amount: 45.00, date: '2026-06-08' },
    { id: 4, name: 'Uber Business Travel', category: 'Travel', amount: 32.50, date: '2026-06-05' },
    { id: 5, name: 'Github Copilot Seats', category: 'Software', amount: 190.00, date: '2026-06-02' },
    { id: 6, name: 'Slack Pro Workspace', category: 'Software', amount: 310.00, date: '2026-05-28' }
  ];

  const categories = ['All', 'Infrastructure', 'Office Rent', 'Software', 'Travel'];

  const filteredExpenses = expenses.filter(exp => {
    const matchesSearch = exp.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'All' || exp.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold text-white tracking-tight">Expenses Ledger</h2>
          <p className="text-xs text-brand-text-secondary">Browse, audit, and log outgoings for operations.</p>
        </div>
        <Button className="flex items-center gap-2 text-xs font-semibold px-4 py-2.5">
          <Plus size={16} className="stroke-[2.5]" />
          <span>Add Expense</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="flex flex-col md:flex-row md:items-center gap-4 py-3 border-slate-800/40">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-text-secondary" />
          <input
            type="text"
            placeholder="Search by transaction details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg bg-slate-900/40 border border-slate-800/60 pl-10 pr-4 py-2.5 text-xs text-brand-text-primary placeholder:text-brand-text-secondary focus:outline-none focus:border-brand-accent/50 focus:ring-1 focus:ring-brand-accent/50 transition-all"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-brand-text-secondary" />
            <span className="text-xs text-brand-text-secondary">Category:</span>
          </div>
          <div className="flex gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition-all cursor-pointer ${
                  category === cat
                    ? 'bg-brand-accent/15 border-brand-accent/40 text-brand-accent'
                    : 'border-slate-800 bg-slate-800/30 text-brand-text-secondary hover:text-white hover:border-slate-700/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* List Card */}
      <Card className="overflow-hidden border-slate-800/40">
        {filteredExpenses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/60 text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary">
                  <th className="pb-3 px-4 font-semibold">Expense Item</th>
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 font-semibold">Date Logged</th>
                  <th className="pb-3 text-right pr-4 font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-xs text-brand-text-primary">
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-800/15 transition-colors group">
                    <td className="py-4 px-4 font-medium flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800/60 border border-slate-700/30 text-brand-text-secondary group-hover:text-brand-accent group-hover:border-brand-accent/25 transition-all">
                        <DollarSign size={14} />
                      </div>
                      <span>{exp.name}</span>
                    </td>
                    <td className="py-4 text-brand-text-secondary">
                      <div className="inline-flex items-center gap-1.5 rounded bg-slate-800/40 border border-slate-750/30 px-2.5 py-0.5 font-medium">
                        <Tag size={10} />
                        <span>{exp.category}</span>
                      </div>
                    </td>
                    <td className="py-4 text-brand-text-secondary">
                      <div className="inline-flex items-center gap-1.5">
                        <Calendar size={12} />
                        <span>{exp.date}</span>
                      </div>
                    </td>
                    <td className="py-4 text-right font-bold text-white pr-4">
                      -${exp.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-850 border border-slate-800 text-brand-text-secondary mb-4">
              <Search size={20} />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">No matches found</h4>
            <p className="text-xs text-brand-text-secondary max-w-sm">No expenses match key "{search}" inside category "{category}".</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Expenses;
