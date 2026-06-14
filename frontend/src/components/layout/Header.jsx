import React, { useEffect, useState } from 'react';
import { checkHealth } from '../../api/health.js';
import { Wifi, WifiOff, Bell, User } from 'lucide-react';
import useAuth from '../../hooks/useAuth.js';

/**
 * @description Dashboard header. Shows workspace info, backend state, and profile card.
 */
const Header = () => {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(null);

  useEffect(() => {
    const pingAPI = async () => {
      try {
        const response = await checkHealth();
        if (response?.success) {
          setIsOnline(true);
        } else {
          setIsOnline(false);
        }
      } catch (error) {
        setIsOnline(false);
      }
    };

    pingAPI();
    const interval = setInterval(pingAPI, 30000); // Check backend every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-800/60 bg-brand-bg/85 px-6 backdrop-blur-md">
      {/* Server Status Indicator */}
      <div className="flex items-center gap-3">
        <h1 className="text-base font-semibold text-brand-text-primary">Workspace</h1>
        {isOnline === null ? (
          <span className="flex h-2.5 w-2.5 rounded-full bg-slate-500 animate-pulse" title="Checking server link..." />
        ) : isOnline ? (
          <div className="flex items-center gap-1.5 rounded-full bg-brand-success/10 px-2.5 py-0.5 text-xs font-medium text-brand-success">
            <Wifi size={12} className="stroke-[2.5]" />
            <span>API Online</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 rounded-full bg-brand-danger/10 px-2.5 py-0.5 text-xs font-medium text-brand-danger animate-pulse">
            <WifiOff size={12} className="stroke-[2.5]" />
            <span>API Offline</span>
          </div>
        )}
      </div>

      {/* Action Items & Profile */}
      <div className="flex items-center gap-4">
        {/* Notification Icon */}
        <button className="relative rounded-lg p-2 text-brand-text-secondary hover:bg-slate-800/80 hover:text-white transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-brand-accent" />
        </button>

        {/* User Card */}
        <div className="flex items-center gap-3 border-l border-slate-800/80 pl-4">
          <div className="flex flex-col text-right">
            <span className="text-sm font-medium text-brand-text-primary">{user?.name || 'Guest User'}</span>
            <span className="text-[11px] text-brand-text-secondary">{user?.role || user?.email || 'Member'}</span>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-accent/10 border border-brand-accent/25 text-brand-accent font-semibold uppercase">
            {user?.name ? user.name.charAt(0) : <User size={16} />}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
