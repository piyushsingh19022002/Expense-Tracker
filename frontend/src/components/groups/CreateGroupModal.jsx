import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { createGroup } from '../../services/groupService.js';
import Button from '../common/Button.jsx';
import Card from '../common/Card.jsx';
import { X, Folder, AlignLeft, AlertCircle } from 'lucide-react';

/**
 * @description Modal form dialog for group creation.
 */
const CreateGroupModal = ({ isOpen, onClose, onSuccess }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    mode: 'onTouched'
  });

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError('');
    try {
      const response = await createGroup(data.name, data.description);
      if (response?.success && response.data) {
        reset();
        onSuccess(response.data.group);
        onClose();
      } else {
        setServerError(response?.message || 'Failed to create group.');
      }
    } catch (error) {
      setServerError(error.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      {/* Modal Card wrapper */}
      <div className="w-full max-w-[440px] animate-in fade-in zoom-in duration-200">
        <Card className="border-slate-800/80 p-6 shadow-2xl bg-brand-surface relative">
          
          {/* Close button */}
          <button
            onClick={() => {
              reset();
              onClose();
            }}
            disabled={loading}
            className="absolute right-4 top-4 rounded-lg p-1 text-brand-text-secondary hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>

          {/* Modal Header */}
          <div className="mb-6">
            <h3 className="text-base font-bold text-white">Create New Group</h3>
            <p className="text-[11px] text-brand-text-secondary mt-0.5">
              Start a new expense ledger for trips, flatshares, or events.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Server Error banner */}
            {serverError && (
              <div className="flex items-start gap-2 rounded-lg bg-brand-danger/10 border border-brand-danger/25 p-3 text-xs text-brand-danger">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span>{serverError}</span>
              </div>
            )}

            {/* Group Name input */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary">
                Group Name
              </label>
              <div className="relative">
                <Folder size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-secondary" />
                <input
                  type="text"
                  placeholder="e.g. Iceland Trip 2026"
                  className={`w-full rounded-lg bg-slate-900/30 border pl-9 pr-4 py-2.5 text-xs text-brand-text-primary placeholder:text-brand-text-secondary focus:outline-none focus:ring-1 transition-all ${
                    errors.name
                      ? 'border-brand-danger/55 focus:border-brand-danger/60 focus:ring-brand-danger/50'
                      : 'border-slate-800/80 focus:border-brand-accent/50 focus:ring-brand-accent/50'
                  }`}
                  {...register('name', {
                    required: 'Group name is required.',
                    minLength: {
                      value: 2,
                      message: 'Group name must be at least 2 characters.'
                    },
                    maxLength: {
                      value: 100,
                      message: 'Group name cannot exceed 100 characters.'
                    }
                  })}
                />
              </div>
              {errors.name && (
                <span className="text-[10px] font-medium text-brand-danger block mt-0.5">
                  {errors.name.message}
                </span>
              )}
            </div>

            {/* Group Description textarea */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary">
                Description (Optional)
              </label>
              <div className="relative">
                <AlignLeft size={14} className="absolute left-3 top-3.5 text-brand-text-secondary" />
                <textarea
                  placeholder="What is this group for?"
                  rows={3}
                  className={`w-full rounded-lg bg-slate-900/30 border pl-9 pr-4 py-2 text-xs text-brand-text-primary placeholder:text-brand-text-secondary focus:outline-none focus:ring-1 transition-all resize-none ${
                    errors.description
                      ? 'border-brand-danger/55 focus:border-brand-danger/60 focus:ring-brand-danger/50'
                      : 'border-slate-800/80 focus:border-brand-accent/50 focus:ring-brand-accent/50'
                  }`}
                  {...register('description', {
                    maxLength: {
                      value: 500,
                      message: 'Description cannot exceed 500 characters.'
                    }
                  })}
                />
              </div>
              {errors.description && (
                <span className="text-[10px] font-medium text-brand-danger block mt-0.5">
                  {errors.description.message}
                </span>
              )}
            </div>

            {/* Actions footer */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={() => {
                  reset();
                  onClose();
                }}
                className="px-4 py-2 text-xs font-bold border-slate-850 hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={loading}
                className="px-5 py-2 text-xs font-bold"
              >
                Create
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default CreateGroupModal;
