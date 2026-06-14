import React from 'react';

/**
 * @description Standard reusable loading spinner.
 */
const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-[3px]',
    lg: 'w-12 h-12 border-4'
  };

  return (
    <div className={`flex items-center justify-center ${className}`} role="status">
      <div className={`animate-spin rounded-full border-brand-accent/20 border-t-brand-accent ${sizes[size]}`} />
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Spinner;
