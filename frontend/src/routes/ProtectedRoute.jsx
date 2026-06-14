import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';
import Spinner from '../components/common/Spinner.jsx';

/**
 * @description Route Protection interceptor.
 * Blocks access to dashboard paths if user sessions are unauthenticated.
 */
const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  // If restoring user session state, show loading spinner
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-bg">
        <Spinner size="lg" />
      </div>
    );
  }

  // If unauthenticated, redirect to the login screen
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render child views
  return <Outlet />;
};

export default ProtectedRoute;
