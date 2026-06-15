import React from 'react';
import { Database, FileText, Calendar, Rows3 } from 'lucide-react';
import Card from '../common/Card.jsx';

const formatTimestamp = (isoString) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

const ReportSummary = ({ summary }) => {
  if (!summary) return null;

  return (
    <Card className="bg-brand-surface border-slate-800/40">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 lg:divide-x divide-slate-800/30">
        
        {/* File Name */}
        <div className="flex items-center gap-3 py-1 lg:px-4 lg:first:pl-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-accent/10 border border-brand-accent/20 text-brand-accent">
            <FileText size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary">
              File Name
            </p>
            <p className="truncate text-xs font-bold text-white">{summary.fileName}</p>
          </div>
        </div>

        {/* Upload Date */}
        <div className="flex items-center gap-3 py-3 sm:py-1 lg:px-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Calendar size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary">
              Upload Date
            </p>
            <p className="truncate text-xs font-bold text-white">
              {formatTimestamp(summary.uploadDate)}
            </p>
          </div>
        </div>

        {/* Total Rows */}
        <div className="flex items-center gap-3 py-3 sm:py-1 lg:px-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-500/10 border border-green-500/20 text-green-400">
            <Rows3 size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary">
              Total CSV Rows
            </p>
            <p className="truncate text-xs font-bold text-white">{summary.totalRows} records</p>
          </div>
        </div>

        {/* Batch ID */}
        <div className="flex items-center gap-3 py-3 sm:py-1 lg:px-4 lg:last:pr-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400">
            <Database size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary">
              Import Batch ID
            </p>
            <p className="truncate text-xs font-mono font-bold text-white" title={summary.importBatchId}>
              {summary.importBatchId.slice(0, 8)}...
            </p>
          </div>
        </div>

      </div>
    </Card>
  );
};

export default ReportSummary;
