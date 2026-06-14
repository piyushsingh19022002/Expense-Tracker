import { useRef } from 'react';
import { AlertCircle, FileSpreadsheet, Upload, X } from 'lucide-react';
import Button from '../common/Button.jsx';
import Card from '../common/Card.jsx';
import UploadProgress from './UploadProgress.jsx';

const UploadCard = ({
  selectedFile,
  onFileSelect,
  onClearFile,
  onUpload,
  uploading,
  uploadProgress,
  error
}) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    const accepted = onFileSelect(file);

    if (!accepted && fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClearFile();
  };

  return (
    <Card className="flex h-full flex-col gap-5">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-brand-accent/20 bg-brand-accent/10 text-brand-accent">
            <Upload size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">CSV Import</h2>
            <p className="text-[11px] text-brand-text-secondary">Upload raw expense rows for preview.</p>
          </div>
        </div>
      </div>

      <label
        className={`group flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed p-6 text-center transition-all ${
          uploading
            ? 'cursor-not-allowed border-slate-800 bg-slate-950/25 opacity-70'
            : 'border-slate-700 bg-slate-950/30 hover:border-brand-accent/70 hover:bg-brand-accent/5'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          disabled={uploading}
          onChange={handleFileChange}
        />
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-brand-text-secondary group-hover:border-brand-accent/30 group-hover:text-brand-accent">
          <FileSpreadsheet size={24} />
        </div>
        <p className="text-sm font-semibold text-brand-text-primary">Choose a CSV file</p>
        <p className="mt-1 max-w-xs text-[11px] leading-relaxed text-brand-text-secondary">
          CSV files are parsed as uploaded. Rows are previewed before any future import workflow touches expense data.
        </p>
      </label>

      {selectedFile && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-800/70 bg-slate-950/45 px-3 py-2.5">
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-white">{selectedFile.name}</p>
            <p className="text-[10px] text-brand-text-secondary">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </p>
          </div>
          <button
            type="button"
            onClick={handleClearFile}
            disabled={uploading}
            className="rounded-lg p-2 text-brand-text-secondary transition-colors hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            title="Remove selected file"
          >
            <X size={15} />
          </button>
        </div>
      )}

      <UploadProgress visible={uploading} progress={uploadProgress} />

      {error && (
        <div className="flex gap-2 rounded-lg border border-brand-danger/25 bg-brand-danger/10 p-3 text-[11px] leading-relaxed text-red-200">
          <AlertCircle size={15} className="mt-0.5 shrink-0 text-brand-danger" />
          <span>{error}</span>
        </div>
      )}

      <Button
        onClick={onUpload}
        loading={uploading}
        disabled={!selectedFile || uploading}
        className="w-full gap-2"
      >
        {!uploading && <Upload size={15} />}
        Upload CSV
      </Button>
    </Card>
  );
};

export default UploadCard;
