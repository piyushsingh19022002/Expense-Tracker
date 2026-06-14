import { useMemo, useState } from 'react';
import { FileUp, RotateCcw } from 'lucide-react';
import UploadCard from '../components/import/UploadCard.jsx';
import ImportSummary from '../components/import/ImportSummary.jsx';
import PreviewTable from '../components/import/PreviewTable.jsx';
import Button from '../components/common/Button.jsx';
import { uploadCsvImport } from '../services/importService.js';

const CSV_FILE_TYPES = new Set(['text/csv', 'application/csv', 'application/vnd.ms-excel']);

const isCsvFile = (file) => {
  if (!file) {
    return false;
  }

  const hasCsvExtension = file.name.toLowerCase().endsWith('.csv');
  const hasSupportedType = !file.type || CSV_FILE_TYPES.has(file.type);

  return hasCsvExtension && hasSupportedType;
};

const ImportPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');

  const parsedRows = useMemo(() => importResult?.parsedRows || [], [importResult]);

  const handleFileSelect = (file) => {
    setError('');
    setImportResult(null);
    setUploadProgress(0);

    if (!file) {
      setSelectedFile(null);
      return true;
    }

    if (!isCsvFile(file)) {
      setSelectedFile(null);
      setError('Please select a valid CSV file.');
      return false;
    }

    setSelectedFile(file);
    return true;
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setError('');
  };

  const handleReset = () => {
    setSelectedFile(null);
    setImportResult(null);
    setUploadProgress(0);
    setError('');
  };

  const handleUpload = async () => {
    if (!selectedFile || uploading) {
      return;
    }

    setUploading(true);
    setError('');
    setImportResult(null);
    setUploadProgress(0);

    try {
      const response = await uploadCsvImport(selectedFile, setUploadProgress);
      if (response?.success && response.data) {
        setImportResult(response.data);
        setUploadProgress(100);
      } else {
        setError(response?.message || 'CSV upload failed.');
      }
    } catch (err) {
      setError(err.message || 'CSV upload failed. Please verify the file and try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-7rem)] flex-col gap-5">
      <div className="flex flex-col gap-4 rounded-xl border border-slate-800/40 bg-brand-surface p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-brand-accent/20 bg-brand-accent/10 text-brand-accent">
            <FileUp size={20} />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white">CSV Imports</h1>
            <p className="text-[11px] text-brand-text-secondary">
              Upload, parse, and preview shared expense CSV files.
            </p>
          </div>
        </div>

        {(importResult || selectedFile || error) && (
          <Button variant="outline" onClick={handleReset} disabled={uploading} className="gap-2 self-start sm:self-auto">
            <RotateCcw size={14} />
            Reset
          </Button>
        )}
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="min-h-0">
          <UploadCard
            selectedFile={selectedFile}
            onFileSelect={handleFileSelect}
            onClearFile={handleClearFile}
            onUpload={handleUpload}
            uploading={uploading}
            uploadProgress={uploadProgress}
            error={error}
          />
        </div>

        <div className="flex min-h-[520px] flex-col gap-5">
          <ImportSummary importResult={importResult} />
          <PreviewTable rows={parsedRows} />
        </div>
      </div>
    </div>
  );
};

export default ImportPage;
