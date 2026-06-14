import React from 'react';

/**
 * @description Card container utility to uniform panel boxes.
 */
const Card = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`bg-brand-surface border border-slate-800/60 rounded-xl p-5 shadow-lg shadow-black/10 backdrop-blur-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
