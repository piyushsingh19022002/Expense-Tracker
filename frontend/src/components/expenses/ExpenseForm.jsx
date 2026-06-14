import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Button from '../common/Button.jsx';
import { FileText, DollarSign, Calendar, Users, CheckSquare, Square, AlertCircle } from 'lucide-react';

/**
 * @description Single form component reused for creating and editing expenses.
 */
const ExpenseForm = ({ groupMembers, defaultValues, onSubmit, loading, onCancel }) => {
  const isEditMode = !!defaultValues;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      description: '',
      amount: '',
      currency: 'USD',
      date: new Date().toISOString().split('T')[0],
      paidById: '',
      participantsChecked: {}
    },
    mode: 'onTouched'
  });

  // Keep track of check state to show validation errors dynamically
  const participantsChecked = watch('participantsChecked') || {};

  // Reset form with dynamic values when groupMembers or defaultValues resolve
  useEffect(() => {
    if (groupMembers.length > 0) {
      reset({
        description: defaultValues?.description || '',
        amount: defaultValues?.amount ? parseFloat(defaultValues.amount) : '',
        currency: defaultValues?.currency || 'USD',
        date: defaultValues?.date
          ? new Date(defaultValues.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        paidById: defaultValues?.paidById || defaultValues?.paidBy?.id || groupMembers[0]?.id || '',
        participantsChecked: groupMembers.reduce((acc, m) => {
          const isPart = defaultValues?.participants
            ? defaultValues.participants.some((p) => p.userId === m.id)
            : true; // Default to all members participating on create
          acc[m.id] = isPart;
          return acc;
        }, {})
      });
    }
  }, [groupMembers, defaultValues, reset]);

  const onFormSubmit = (data) => {
    // 1. Gather all checked participant user IDs
    const selectedParticipants = Object.keys(data.participantsChecked)
      .filter((id) => data.participantsChecked[id] === true)
      .map((id) => ({ userId: id }));

    if (selectedParticipants.length === 0) {
      setError('participants', {
        type: 'manual',
        message: 'At least one participant must be selected to split the cost.'
      });
      return;
    }

    // 2. Build backend-compliant payload
    const payload = {
      description: data.description,
      amount: parseFloat(data.amount),
      currency: data.currency,
      date: new Date(data.date).toISOString(),
      paidById: data.paidById,
      participants: selectedParticipants
    };

    onSubmit(payload);
  };

  const handleToggleParticipant = (memberId) => {
    clearErrors('participants');
  };

  // Helper to select all or deselect all participants
  const handleSelectAll = (checked) => {
    clearErrors('participants');
    const updated = groupMembers.reduce((acc, m) => {
      acc[m.id] = checked;
      return acc;
    }, {});
    reset((prev) => ({
      ...prev,
      participantsChecked: updated
    }));
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 max-w-lg">
      
      {/* Description input */}
      <div className="space-y-1">
        <label className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary">
          Description
        </label>
        <div className="relative">
          <FileText size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-secondary" />
          <input
            type="text"
            placeholder="e.g. Friday Team Lunch"
            disabled={loading}
            className={`w-full rounded-lg bg-slate-900/30 border pl-9 pr-4 py-2.5 text-xs text-brand-text-primary placeholder:text-brand-text-secondary focus:outline-none focus:ring-1 transition-all ${
              errors.description
                ? 'border-brand-danger/55 focus:border-brand-danger/60 focus:ring-brand-danger/50'
                : 'border-slate-800/80 focus:border-brand-accent/50 focus:ring-brand-accent/50'
            }`}
            {...register('description', {
              required: 'Description is required.',
              maxLength: { value: 255, message: 'Description cannot exceed 255 characters.' }
            })}
          />
        </div>
        {errors.description && (
          <span className="text-[10px] font-medium text-brand-danger block mt-0.5">
            {errors.description.message}
          </span>
        )}
      </div>

      {/* Amount and Currency row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2 space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary">
            Amount
          </label>
          <div className="relative">
            <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-secondary" />
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              disabled={loading}
              className={`w-full rounded-lg bg-slate-900/30 border pl-9 pr-4 py-2.5 text-xs text-brand-text-primary placeholder:text-brand-text-secondary focus:outline-none focus:ring-1 transition-all ${
                errors.amount
                  ? 'border-brand-danger/55 focus:border-brand-danger/60 focus:ring-brand-danger/50'
                  : 'border-slate-800/80 focus:border-brand-accent/50 focus:ring-brand-accent/50'
              }`}
              {...register('amount', {
                required: 'Amount is required.',
                valueAsNumber: true,
                validate: {
                  positive: (val) => val > 0 || 'Amount must be greater than zero.'
                }
              })}
            />
          </div>
          {errors.amount && (
            <span className="text-[10px] font-medium text-brand-danger block mt-0.5">
              {errors.amount.message}
            </span>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary">
            Currency
          </label>
          <select
            disabled={loading}
            className="w-full rounded-lg bg-slate-900/30 border border-slate-800/80 px-3 py-2.5 text-xs text-brand-text-primary focus:outline-none focus:border-brand-accent/50 focus:ring-1 focus:ring-brand-accent/50 transition-all"
            {...register('currency', { required: 'Currency is required.' })}
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="INR">INR (₹)</option>
          </select>
        </div>
      </div>

      {/* Date and Paid By Payer row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary">
            Date
          </label>
          <div className="relative">
            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-secondary" />
            <input
              type="date"
              disabled={loading}
              className="w-full rounded-lg bg-slate-900/30 border border-slate-800/80 pl-9 pr-4 py-2.5 text-xs text-brand-text-primary focus:outline-none focus:border-brand-accent/50 focus:ring-1 focus:ring-brand-accent/50 transition-all"
              {...register('date', { required: 'Date is required.' })}
            />
          </div>
          {errors.date && (
            <span className="text-[10px] font-medium text-brand-danger block mt-0.5">
              {errors.date.message}
            </span>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary">
            Paid By
          </label>
          <select
            disabled={loading}
            className="w-full rounded-lg bg-slate-900/30 border border-slate-800/80 px-3 py-2.5 text-xs text-brand-text-primary focus:outline-none focus:border-brand-accent/50 focus:ring-1 focus:ring-brand-accent/50 transition-all"
            {...register('paidById', { required: 'Payer selection is required.' })}
          >
            {groupMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
          {errors.paidById && (
            <span className="text-[10px] font-medium text-brand-danger block mt-0.5">
              {errors.paidById.message}
            </span>
          )}
        </div>
      </div>

      {/* Participants Checkbox Select List */}
      <div className="space-y-2.5 border-t border-slate-800/40 pt-4">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary flex items-center gap-1.5">
            <Users size={12} className="stroke-[2.5]" />
            Split Participants
          </label>
          <div className="flex gap-2.5 text-[9px] font-bold uppercase tracking-wider text-brand-accent">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSelectAll(true)}
              className="hover:underline cursor-pointer"
            >
              Select All
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSelectAll(false)}
              className="hover:underline cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>

        {errors.participants && (
          <div className="flex items-start gap-2 rounded-lg bg-brand-danger/10 border border-brand-danger/25 p-2.5 text-[10px] text-brand-danger animate-in fade-in duration-200">
            <AlertCircle size={12} className="shrink-0 mt-0.5" />
            <span>{errors.participants.message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
          {groupMembers.map((member) => {
            const isChecked = !!participantsChecked[member.id];
            return (
              <label
                key={member.id}
                onClick={() => handleToggleParticipant(member.id)}
                className={`flex items-center gap-2.5 rounded-lg border p-2.5 transition-all cursor-pointer ${
                  isChecked
                    ? 'border-brand-accent/30 bg-brand-accent/5 text-white'
                    : 'border-slate-850 hover:border-slate-800 bg-slate-900/10 text-brand-text-secondary hover:text-white'
                }`}
              >
                <input
                  type="checkbox"
                  disabled={loading}
                  className="hidden"
                  {...register(`participantsChecked.${member.id}`)}
                />
                <div className="shrink-0">
                  {isChecked ? (
                    <CheckSquare size={15} className="text-brand-accent stroke-[2.5]" />
                  ) : (
                    <Square size={15} className="text-brand-text-secondary" />
                  )}
                </div>
                <div className="space-y-0.5 truncate text-left">
                  <p className="text-xs font-semibold truncate leading-none">{member.name}</p>
                  <p className="text-[9px] truncate text-brand-text-secondary leading-none">
                    {member.email}
                  </p>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Form buttons */}
      <div className="flex items-center justify-end gap-3 border-t border-slate-800/40 pt-4 mt-2">
        <Button
          type="button"
          variant="outline"
          disabled={loading}
          onClick={onCancel}
          className="px-4 py-2 text-xs font-bold border-slate-850 hover:bg-slate-800"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          loading={loading}
          className="px-5 py-2 text-xs font-bold shadow-md"
        >
          {isEditMode ? 'Save Changes' : 'Log Expense'}
        </Button>
      </div>
    </form>
  );
};

export default ExpenseForm;
