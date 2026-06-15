import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';

const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const STATUSES = ['PENDING', 'APPROVED', 'REJECTED'];
const ANOMALY_TYPES = [
  'DUPLICATE_EXPENSE',
  'INVALID_DATE',
  'AMBIGUOUS_DATE',
  'MISSING_CURRENCY',
  'NEGATIVE_AMOUNT',
  'UNKNOWN_MEMBER',
  'FORMER_MEMBER',
  'SETTLEMENT_LOGGED_AS_EXPENSE'
];

const formatTypeLabel = (type) => {
  return type
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const AnomalyFilters = ({ filters, onFilterChange, onReset }) => {
  const handleChange = (key, value) => {
    onFilterChange({
      ...filters,
      [key]: value || ''
    });
  };

  return (
    <div className="rounded-xl border border-slate-800/40 bg-brand-surface p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        
        {/* Filters Selectors Group */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 flex-1">
          
          {/* Status Filter */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary">
              Resolution Status
            </label>
            <select
              value={filters.status || ''}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full rounded-lg border border-slate-800/80 bg-brand-bg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 shadow-sm transition-all focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent cursor-pointer"
            >
              <option value="">All Statuses</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* Severity Filter */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary">
              Anomaly Severity
            </label>
            <select
              value={filters.severity || ''}
              onChange={(e) => handleChange('severity', e.target.value)}
              className="w-full rounded-lg border border-slate-800/80 bg-brand-bg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 shadow-sm transition-all focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent cursor-pointer"
            >
              <option value="">All Severities</option>
              {SEVERITIES.map((severity) => (
                <option key={severity} value={severity}>
                  {severity}
                </option>
              ))}
            </select>
          </div>

          {/* Anomaly Type Filter */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary">
              Anomaly Type
            </label>
            <select
              value={filters.type || ''}
              onChange={(e) => handleChange('type', e.target.value)}
              className="w-full rounded-lg border border-slate-800/80 bg-brand-bg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 shadow-sm transition-all focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent cursor-pointer"
            >
              <option value="">All Types</option>
              {ANOMALY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {formatTypeLabel(type)}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Action Button */}
        <button
          onClick={onReset}
          className="flex h-[38px] items-center justify-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-4 text-xs font-bold text-brand-text-secondary hover:bg-slate-800 hover:text-white transition-all cursor-pointer lg:w-auto"
        >
          <RotateCcw size={13} />
          <span>Reset Filters</span>
        </button>

      </div>
    </div>
  );
};

export default AnomalyFilters;
