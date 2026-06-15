import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PATHS from './paths.js';
import ProtectedRoute from './ProtectedRoute.jsx';
import DashboardLayout from '../components/layout/DashboardLayout.jsx';
import Dashboard from '../pages/Dashboard/Dashboard.jsx';
import ExpensesPage from '../pages/ExpensesPage.jsx';
import GroupsPage from '../pages/GroupsPage.jsx';
import ImportPage from '../pages/ImportPage.jsx';
import AnomalyDashboard from '../pages/AnomalyDashboard.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';
import NotFound from '../pages/NotFound/NotFound.jsx';

/**
 * @description Application Route Configuration.
 * Maps URL paths to React components under nested structures.
 */
const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Authentication routes */}
        <Route path={PATHS.LOGIN} element={<LoginPage />} />
        <Route path={PATHS.REGISTER} element={<RegisterPage />} />

        {/* Main Application Layout Layer */}
        <Route element={<ProtectedRoute />}>
          <Route path={PATHS.DASHBOARD} element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path={PATHS.EXPENSES} element={<ExpensesPage />} />
            <Route path={PATHS.GROUPS} element={<GroupsPage />} />
            <Route path={PATHS.IMPORTS} element={<ImportPage />} />
            <Route path={PATHS.ANOMALY_REVIEW} element={<AnomalyDashboard />} />
          </Route>
        </Route>

        {/* Fallback 404 handler outside the main layout */}
        <Route path={PATHS.NOT_FOUND} element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
