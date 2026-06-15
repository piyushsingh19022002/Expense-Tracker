import { CheckCircle2, Database, Rows3, ShieldAlert, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../common/Card.jsx';

const ImportSummary = ({ importResult }) => {
  if (!importResult) {
    return null;
  }

  const anomalyCount = importResult.anomalies?.length || 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Upload Confirmation Card */}
      <Card className="border-brand-success/20 bg-brand-success/5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-brand-success/25 bg-brand-success/10 text-brand-success">
              <CheckCircle2 size={19} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Upload Complete</h3>
              <p className="text-[11px] text-brand-text-secondary">Batch is stored and ready for review.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-800/70 bg-slate-950/35 px-4 py-3">
              <div className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase text-brand-text-secondary">
                <Database size={12} />
                Batch ID
              </div>
              <p className="max-w-56 truncate text-xs font-semibold text-brand-text-primary">
                {importResult.importBatchId}
              </p>
            </div>
            <div className="rounded-lg border border-slate-800/70 bg-slate-950/35 px-4 py-3">
              <div className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase text-brand-text-secondary">
                <Rows3 size={12} />
                Parsed Rows
              </div>
              <p className="text-xs font-semibold text-brand-text-primary">{importResult.totalRows}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Review Required Action Banner */}
      {anomalyCount > 0 ? (
        <Card className="border-yellow-500/25 bg-yellow-500/5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-yellow-500/25 bg-yellow-500/10 text-yellow-500">
                <ShieldAlert size={19} className="stroke-[2.5]" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-white">Review Required</h3>
                <p className="text-[11px] text-brand-text-secondary leading-relaxed">
                  We detected <span className="text-yellow-500 font-bold">{anomalyCount} anomalies</span> in this import batch.
                  Manual validation is required before transaction import is finalized.
                </p>
              </div>
            </div>

            <Link
              to={`/imports/${importResult.importBatchId}/anomalies`}
              className="flex h-10 items-center justify-center gap-1.5 rounded-lg bg-yellow-500 hover:bg-yellow-600 px-4 text-xs font-bold text-brand-bg transition-all shadow-md shadow-yellow-500/10 cursor-pointer self-start sm:self-auto shrink-0"
            >
              <span>Review Anomalies</span>
              <ChevronRight size={14} className="stroke-[2.5]" />
            </Link>
          </div>
        </Card>
      ) : (
        <Card className="border-brand-accent/25 bg-brand-accent/5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-brand-accent/25 bg-brand-accent/10 text-brand-accent">
              <CheckCircle2 size={19} />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-white">No Anomalies Found</h3>
              <p className="text-[11px] text-brand-text-secondary leading-normal">
                This CSV is perfectly formatted and contains no duplicates, missing currencies, or former member splits.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ImportSummary;
