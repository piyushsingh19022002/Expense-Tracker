import { Loader2 } from 'lucide-react';

const UploadProgress = ({ progress = 0, visible = false }) => {
  if (!visible) {
    return null;
  }

  return (
    <div className="rounded-lg border border-slate-800/70 bg-slate-950/45 p-3">
      <div className="mb-2 flex items-center justify-between text-[11px] font-semibold text-brand-text-secondary">
        <span className="inline-flex items-center gap-2">
          <Loader2 size={13} className="animate-spin text-brand-accent" />
          Uploading CSV
        </span>
        <span className="text-brand-text-primary">{progress}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-brand-accent transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default UploadProgress;
