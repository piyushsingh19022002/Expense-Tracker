import { CheckCircle2, Database, Rows3 } from 'lucide-react';
import Card from '../common/Card.jsx';

const ImportSummary = ({ importResult }) => {
  if (!importResult) {
    return null;
  }

  return (
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
  );
};

export default ImportSummary;
