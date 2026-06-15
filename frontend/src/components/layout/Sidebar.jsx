import { NavLink } from 'react-router-dom';
import PATHS from '../../routes/paths.js';
import { LayoutDashboard, Wallet, Settings, LogOut, Users, FileUp } from 'lucide-react';
import useAuth from '../../hooks/useAuth.js';

/**
 * @description Sidebar navigation container with active indicators.
 */
const Sidebar = () => {
  const { logout } = useAuth();
  const navigationItems = [
    {
      name: 'Dashboard',
      path: PATHS.DASHBOARD,
      icon: LayoutDashboard,
      end: true // Exact match required for root
    },
    {
      name: 'Expenses',
      path: PATHS.EXPENSES,
      icon: Wallet
    },
    {
      name: 'Groups',
      path: PATHS.GROUPS,
      icon: Users
    },
    {
      name: 'Imports',
      path: PATHS.IMPORTS,
      icon: FileUp
    }
  ];

  return (
    <aside className="hidden md:flex h-screen w-64 flex-col border-r border-slate-800/60 bg-brand-surface">
      {/* Branding Header */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-slate-800/60">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-accent text-white font-black shadow-md shadow-brand-accent/20">
          $
        </div>
        <span className="text-base font-bold tracking-wider uppercase text-white">Expenzy</span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 px-4 py-6">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-accent/10 text-brand-accent border-l-[3px] border-brand-accent pl-[13px]'
                    : 'text-brand-text-secondary hover:bg-slate-800/50 hover:text-white'
                }`
              }
            >
              <Icon size={18} className="stroke-[2]" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Settings & Logout Links */}
      <div className="border-t border-slate-800/60 p-4 space-y-1.5">
        <div className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-brand-text-secondary hover:bg-slate-800/50 hover:text-white transition-all duration-200 cursor-pointer">
          <Settings size={18} />
          <span>Settings</span>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-brand-danger/80 hover:bg-brand-danger/10 hover:text-brand-danger transition-all duration-200 cursor-pointer"
        >
          <LogOut size={18} className="stroke-[2]" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
