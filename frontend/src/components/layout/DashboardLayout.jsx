import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';

/**
 * @description Main Layout container. Wraps sidebar layout and content grids.
 */
const DashboardLayout = () => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-brand-bg">
      {/* Left Docked Sidebar */}
      <Sidebar />

      {/* Right Column Layout */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Sticky Header */}
        <Header />

        {/* Scrollable Work Area */}
        <main className="flex-1 overflow-y-auto bg-brand-bg px-6 py-6 lg:px-8">
          {/* Max Width Container to restrict wide stretches on ultra-wide screens */}
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
