import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../../services/authService.js';
import Button from '../common/Button.jsx';
import { User, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import PATHS from '../../routes/paths.js';

/**
 * @description Standardized RegisterForm component for creating new accounts.
 */
const RegisterForm = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    mode: 'onTouched'
  });

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Watch the password field to validate confirmPassword matches it
  const password = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError('');
    setSuccessMessage('');
    try {
      const response = await registerUser(data.name, data.email, data.password);
      if (response?.success) {
        setSuccessMessage('Account created successfully! Redirecting to login...');
        
        // Timeout before redirecting
        setTimeout(() => {
          navigate(PATHS.LOGIN);
        }, 1500);
      }
    } catch (error) {
      setServerError(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
      {/* Server Validation Error banner */}
      {serverError && (
        <div className="flex items-start gap-2.5 rounded-lg bg-brand-danger/10 border border-brand-danger/25 p-3.5 text-xs text-brand-danger">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Success Notification banner */}
      {successMessage && (
        <div className="flex items-start gap-2.5 rounded-lg bg-brand-success/10 border border-brand-success/25 p-3.5 text-xs text-brand-success">
          <CheckCircle size={15} className="shrink-0 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Name Input Field */}
      <div className="space-y-1">
        <label className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary">Full Name</label>
        <div className="relative">
          <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-text-secondary" />
          <input
            type="text"
            placeholder="John Doe"
            className={`w-full rounded-lg bg-slate-900/30 border pl-10 pr-4 py-2.5 text-xs text-brand-text-primary placeholder:text-brand-text-secondary focus:outline-none focus:ring-1 transition-all ${
              errors.name
                ? 'border-brand-danger/55 focus:border-brand-danger/60 focus:ring-brand-danger/50'
                : 'border-slate-800/80 focus:border-brand-accent/50 focus:ring-brand-accent/50'
            }`}
            {...register('name', {
              required: 'Name is required.',
              minLength: { value: 2, message: 'Name must be at least 2 characters.' }
            })}
          />
        </div>
        {errors.name && (
          <span className="text-[10px] font-medium text-brand-danger block mt-0.5">{errors.name.message}</span>
        )}
      </div>

      {/* Email Input Field */}
      <div className="space-y-1">
        <label className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary">Email Address</label>
        <div className="relative">
          <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-text-secondary" />
          <input
            type="text"
            placeholder="name@example.com"
            className={`w-full rounded-lg bg-slate-900/30 border pl-10 pr-4 py-2.5 text-xs text-brand-text-primary placeholder:text-brand-text-secondary focus:outline-none focus:ring-1 transition-all ${
              errors.email
                ? 'border-brand-danger/55 focus:border-brand-danger/60 focus:ring-brand-danger/50'
                : 'border-slate-800/80 focus:border-brand-accent/50 focus:ring-brand-accent/50'
            }`}
            {...register('email', {
              required: 'Email is required.',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Enter a valid email format.'
              }
            })}
          />
        </div>
        {errors.email && (
          <span className="text-[10px] font-medium text-brand-danger block mt-0.5">{errors.email.message}</span>
        )}
      </div>

      {/* Password Input Field */}
      <div className="space-y-1">
        <label className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary">Password</label>
        <div className="relative">
          <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-text-secondary" />
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            className={`w-full rounded-lg bg-slate-900/30 border pl-10 pr-10 py-2.5 text-xs text-brand-text-primary placeholder:text-brand-text-secondary focus:outline-none focus:ring-1 transition-all ${
              errors.password
                ? 'border-brand-danger/55 focus:border-brand-danger/60 focus:ring-brand-danger/50'
                : 'border-slate-800/80 focus:border-brand-accent/50 focus:ring-brand-accent/50'
            }`}
            {...register('password', {
              required: 'Password is required.',
              minLength: { value: 8, message: 'Password must be at least 8 characters.' },
              validate: {
                hasLowercase: (val) => /[a-z]/.test(val) || 'Must contain at least one lowercase letter.',
                hasUppercase: (val) => /[A-Z]/.test(val) || 'Must contain at least one uppercase letter.',
                hasNumber: (val) => /[0-9]/.test(val) || 'Must contain at least one number.'
              }
            })}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-text-secondary hover:text-white transition-colors cursor-pointer"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && (
          <span className="text-[10px] font-medium text-brand-danger block mt-0.5">{errors.password.message}</span>
        )}
      </div>

      {/* Confirm Password Input Field */}
      <div className="space-y-1">
        <label className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary">Confirm Password</label>
        <div className="relative">
          <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-text-secondary" />
          <input
            type="password"
            placeholder="••••••••"
            className={`w-full rounded-lg bg-slate-900/30 border pl-10 pr-4 py-2.5 text-xs text-brand-text-primary placeholder:text-brand-text-secondary focus:outline-none focus:ring-1 transition-all ${
              errors.confirmPassword
                ? 'border-brand-danger/55 focus:border-brand-danger/60 focus:ring-brand-danger/50'
                : 'border-slate-800/80 focus:border-brand-accent/50 focus:ring-brand-accent/50'
            }`}
            {...register('confirmPassword', {
              required: 'Confirm your password.',
              validate: (val) => val === password || 'Passwords do not match.'
            })}
          />
        </div>
        {errors.confirmPassword && (
          <span className="text-[10px] font-medium text-brand-danger block mt-0.5">{errors.confirmPassword.message}</span>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        loading={loading}
        className="w-full font-bold text-xs py-3 mt-3 shadow-md"
      >
        Create Account
      </Button>
    </form>
  );
};

export default RegisterForm;
