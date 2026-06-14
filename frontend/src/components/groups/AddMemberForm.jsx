import React from 'react';
import { useForm } from 'react-hook-form';
import Button from '../common/Button.jsx';
import { Mail, UserPlus } from 'lucide-react';

/**
 * @description Inline form to invite members to a group by email.
 */
const AddMemberForm = ({ onAddMember, loading }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    mode: 'onSubmit'
  });

  const onSubmit = async (data) => {
    // Pass email up to the parent component which handles the API request
    const success = await onAddMember(data.email);
    if (success) {
      reset(); // Clear input on success
    }
  };

  return (
    <div className="rounded-xl border border-slate-800/40 bg-slate-900/10 p-4 space-y-3">
      <div>
        <h5 className="text-xs font-bold text-white">Add Group Member</h5>
        <p className="text-[10px] text-brand-text-secondary mt-0.5">
          Enter their registered email to add them to this group.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col sm:flex-row gap-2.5 items-start">
        <div className="flex-1 w-full space-y-1">
          <div className="relative">
            <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-secondary" />
            <input
              type="text"
              placeholder="member@example.com"
              disabled={loading}
              className={`w-full rounded-lg bg-slate-950/20 border pl-8 pr-4 py-2 text-xs text-brand-text-primary placeholder:text-brand-text-secondary focus:outline-none focus:ring-1 transition-all ${
                errors.email
                  ? 'border-brand-danger/55 focus:border-brand-danger/60 focus:ring-brand-danger/50'
                  : 'border-slate-850 focus:border-brand-accent/50 focus:ring-brand-accent/50'
              }`}
              {...register('email', {
                required: 'Email address is required.',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Enter a valid email format.'
                }
              })}
            />
          </div>
          {errors.email && (
            <span className="text-[10px] font-medium text-brand-danger block mt-0.5">
              {errors.email.message}
            </span>
          )}
        </div>

        <Button
          type="submit"
          loading={loading}
          className="w-full sm:w-auto font-bold text-[11px] px-4 py-2 flex items-center justify-center gap-1.5 shrink-0 shadow-md shadow-brand-accent/10 sm:mt-0"
        >
          <UserPlus size={13} />
          <span>Add Member</span>
        </Button>
      </form>
    </div>
  );
};

export default AddMemberForm;
