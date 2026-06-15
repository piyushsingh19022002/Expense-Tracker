import React from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({ value, onChange }) => {
  return (
    <div className="relative flex-1">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
        <Search size={16} />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by row number, anomaly type, or description..."
        className="w-full rounded-lg border border-slate-800/80 bg-brand-surface pl-10 pr-9 py-2.5 text-xs text-white placeholder-slate-500 shadow-sm transition-all focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-white transition-colors cursor-pointer"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
