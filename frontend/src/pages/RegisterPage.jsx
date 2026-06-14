import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/common/Card.jsx';
import RegisterForm from '../components/auth/RegisterForm.jsx';
import PATHS from '../routes/paths.js';

/**
 * @description Authentication Register Page wrapper.
 */
const RegisterPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-bg px-4 py-12 relative overflow-hidden">
      {/* Visual background ambient blurs */}
      <div className="absolute top-[-20%] left-[-15%] h-[400px] w-[400px] rounded-full bg-brand-accent/5 blur-[150px]" />
      <div className="absolute bottom-[-20%] right-[-15%] h-[400px] w-[400px] rounded-full bg-brand-success/5 blur-[150px]" />

      <div className="w-full max-w-[400px] z-10">
        {/* Branding header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-accent text-white text-2xl font-black shadow-lg shadow-brand-accent/25 mb-4">
            $
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">Create Your Account</h2>
          <p className="text-xs text-brand-text-secondary mt-1">Start tracking and settling group balances.</p>
        </div>

        {/* Card containing the RegisterForm */}
        <Card className="border-slate-800/40 p-6 sm:p-8">
          <RegisterForm />
        </Card>

        {/* Redirect navigation link */}
        <p className="text-center text-xs text-brand-text-secondary mt-6">
          Already have an account?{' '}
          <Link
            to={PATHS.LOGIN}
            className="font-bold text-brand-accent hover:text-brand-accent-hover transition-colors"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
