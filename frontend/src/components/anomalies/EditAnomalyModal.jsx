import React, { useState, useEffect } from 'react';
import { X, Save, AlertTriangle, HelpCircle } from 'lucide-react';

const EditAnomalyModal = ({ isOpen, onClose, anomaly, onSaveSuccess }) => {
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Extract raw CSV column keys and values
  const rowData = anomaly?.rawContent || {};
  const columns = Object.keys(rowData).filter((k) => k !== '__extraColumns');

  useEffect(() => {
    if (anomaly) {
      // Initialize form with current values (fallback from rawContent or a previous correction)
      setFormData({ ...rowData });
      setError('');
    }
  }, [anomaly, rowData]);

  if (!isOpen || !anomaly) {
    return null;
  }

  const handleInputChange = (col, val) => {
    setFormData((prev) => ({
      ...prev,
      [col]: val
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      onSaveSuccess(anomaly.id, formData);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save corrected row values.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-xl overflow-hidden rounded-xl border border-slate-800/80 bg-brand-surface shadow-2xl">
        
        {/* Header */}
        <div className="flex h-14 items-center justify-between border-b border-slate-800/60 px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-brand-accent/10 border border-brand-accent/25 text-brand-accent">
              <AlertTriangle size={14} className="stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Correct Row {anomaly.rowNumber} Data</h3>
              <p className="text-[10px] text-brand-text-secondary">Type: {anomaly.anomalyType}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-slate-500 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Info Banner */}
        <div className="flex items-start gap-3 bg-brand-accent/5 border-b border-brand-accent/15 px-5 py-3.5">
          <HelpCircle size={15} className="text-brand-accent mt-0.5 shrink-0 stroke-[2.5]" />
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-brand-accent uppercase tracking-wider">Suggested Fix</p>
            <p className="text-[10px] text-brand-text-secondary leading-normal">{anomaly.suggestedAction}</p>
          </div>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="flex flex-col max-h-[60vh] overflow-y-auto p-5 space-y-4">
          
          {error && (
            <div className="p-3 text-xs bg-brand-danger/10 border border-brand-danger/25 text-brand-danger rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {columns.map((col) => (
              <div key={col} className="space-y-1.5">
                <label className="text-[10px] font-bold text-brand-text-secondary truncate block">
                  {col}
                </label>
                <input
                  type="text"
                  value={formData[col] !== undefined ? formData[col] : ''}
                  onChange={(e) => handleInputChange(col, e.target.value)}
                  className="w-full rounded-lg border border-slate-800/80 bg-brand-bg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 shadow-sm transition-all focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent"
                />
                <p className="text-[9px] text-slate-500 truncate leading-none">
                  Original: <span className="italic font-mono text-slate-400">{String(rowData[col] || '')}</span>
                </p>
              </div>
            ))}
          </div>

        </form>

        {/* Footer Actions */}
        <div className="flex h-14 items-center justify-end gap-3 border-t border-slate-800/60 bg-slate-950/20 px-5">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-lg border border-slate-800 px-4 text-xs font-bold text-brand-text-secondary hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex h-9 items-center gap-2 rounded-lg bg-brand-accent px-4 text-xs font-bold text-white hover:bg-brand-accent-hover transition-all cursor-pointer shadow-md shadow-brand-accent/15"
            disabled={saving}
          >
            <Save size={13} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default EditAnomalyModal;
