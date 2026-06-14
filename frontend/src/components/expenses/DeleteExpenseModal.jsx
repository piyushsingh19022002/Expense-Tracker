import React from 'react';
import Button from '../common/Button.jsx';
import Card from '../common/Card.jsx';
import { X, AlertTriangle } from 'lucide-react';

/**
 * @description Dialog modal overlay to confirm delete actions.
 */
const DeleteExpenseModal = ({ isOpen, onClose, onConfirm, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-[400px] animate-in fade-in zoom-in duration-200">
        <Card className="border-slate-800/80 p-6 shadow-2xl bg-brand-surface relative">
          
          {/* Close button */}
          <button
            onClick={onClose}
            disabled={loading}
            className="absolute right-4 top-4 rounded-lg p-1 text-brand-text-secondary hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>

          <div className="flex flex-col items-center text-center gap-4 py-2">
            {/* Warning Icon wrapper */}
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-danger/10 border border-brand-danger/25 text-brand-danger mb-1">
              <AlertTriangle size={22} className="stroke-[2]" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Delete Expense?</h3>
              <p className="text-xs text-brand-text-secondary leading-normal px-2">
                Are you sure you want to permanently delete this expense? This action will remove all split debt records and cannot be undone.
              </p>
            </div>

            {/* Actions footer */}
            <div className="flex items-center justify-center gap-3 w-full mt-4">
              <Button
                variant="outline"
                disabled={loading}
                onClick={onClose}
                className="flex-1 py-2 text-xs font-bold border-slate-850 hover:bg-slate-800"
              >
                Cancel
              </Button>
              <button
                disabled={loading}
                onClick={onConfirm}
                className="flex-1 py-2.5 text-xs font-bold rounded-lg bg-brand-danger hover:bg-brand-danger-hover text-white shadow-md shadow-brand-danger/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                {loading ? (
                  <div className="h-4.5 w-4.5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                ) : (
                  <span>Delete Expense</span>
                )}
              </button>
            </div>
          </div>
          
        </Card>
      </div>
    </div>
  );
};

export default DeleteExpenseModal;
