import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/common/Card.jsx';
import LoginForm from '../components/auth/LoginForm.jsx';
import PATHS from '../routes/paths.js';

/**
 * @description Authentication Login Page wrapper.
 */
const LoginPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-bg px-4 py-12 relative overflow-hidden">
      {/* Visual background ambient blurs for premium glassmorphic feeling */}
      <div className="absolute top-[-20%] left-[-15%] h-[400px] w-[400px] rounded-full bg-brand-accent/5 blur-[150px]" />
      <div className="absolute bottom-[-20%] right-[-15%] h-[400px] w-[400px] rounded-full bg-brand-success/5 blur-[150px]" />

      <div className="w-full max-w-[400px] z-10">
        {/* Branding header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-accent text-white text-2xl font-black shadow-lg shadow-brand-accent/25 mb-4">
            $
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">Sign In to Expenzy</h2>
          <p className="text-xs text-brand-text-secondary mt-1">Access your shared expense metrics ledger.</p>
        </div>

        {/* Card containing the LoginForm */}
        <Card className="border-slate-800/40 p-6 sm:p-8">
          <LoginForm />
        </Card>

        {/* Redirect navigation link */}
        <p className="text-center text-xs text-brand-text-secondary mt-6">
          Don't have an account?{' '}
          <Link
            to={PATHS.REGISTER}
            className="font-bold text-brand-accent hover:text-brand-accent-hover transition-colors"
          >
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
