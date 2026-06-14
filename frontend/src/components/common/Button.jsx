import React from 'react';
import Spinner from './Spinner.jsx';

/**
 * @description Standard reusable Button component.
 */
const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  className = '',
  loading = false,
  disabled = false,
  ...props
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-medium rounded-lg px-4 py-2.5 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-accent/50 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';
  
  const variants = {
    primary: 'bg-brand-accent hover:bg-brand-accent-hover text-brand-text-primary shadow-lg shadow-brand-accent/15',
    secondary: 'bg-slate-800 hover:bg-slate-750 text-brand-text-primary hover:text-white',
    danger: 'bg-brand-danger hover:bg-red-600 text-brand-text-primary shadow-lg shadow-brand-danger/15',
    outline: 'border border-slate-700 hover:border-slate-600 hover:bg-slate-800/50 text-brand-text-secondary hover:text-white'
  };

  return (
    <button
      type={type}
      className={`${baseStyle} ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner size="sm" className="mr-2" />}
      {children}
    </button>
  );
};

export default Button;
