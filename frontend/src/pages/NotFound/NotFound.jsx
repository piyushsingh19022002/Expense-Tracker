import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button.jsx';
import PATHS from '../../routes/paths.js';
import { AlertCircle } from 'lucide-react';

/**
 * @description Standard 404 page handler.
 */
const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-bg px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-danger/10 border border-brand-danger/20 text-brand-danger mb-5">
        <AlertCircle size={28} className="stroke-[2.5]" />
      </div>
      
      <h2 className="text-5xl font-black text-white tracking-tight mb-2">404</h2>
      <h3 className="text-base font-bold text-white mb-2">Resource Not Found</h3>
      <p className="text-xs text-brand-text-secondary max-w-xs mb-6">
        The requested URL path was not found. It may have been relocated or has not been deployed yet.
      </p>

      <Button
        variant="primary"
        onClick={() => navigate(PATHS.DASHBOARD)}
        className="px-5 font-semibold text-xs py-2.5"
      >
        Go to Dashboard
      </Button>
    </div>
  );
};

export default NotFound;
