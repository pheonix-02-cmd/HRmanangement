import React, { useState } from 'react';
import { 
  Bell, 
  Search, 
  Menu, 
  ChevronDown, 
  LogOut, 
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../common/ThemeToggle';

export const Navbar = ({ onToggleMobileSidebar, currentTab, setCurrentTab }) => {
  const { user, logout } = useAuth();
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, title: 'Leave Application', desc: 'Vikram Singh applied for 3 days casual leave', time: '10m ago', unread: true },
    { id: 2, title: 'October Payroll', desc: 'Salary disbursement completed', time: '2h ago', unread: false },
    { id: 3, title: 'Interview Scheduled', desc: 'Siddharth Rao technical evaluation at 2:30 PM', time: '1d ago', unread: false },
  ];

  return (
    <header className="sticky top-0 z-30 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2 md:hidden">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold text-sm">
              N
            </div>
            <span className="font-semibold text-base text-slate-900 dark:text-white">
              NexusHR
            </span>
          </div>
        </div>

        {/* Center: Search */}
        <div className="hidden sm:flex items-center flex-1 max-w-sm mx-6">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 transition placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Right Action Items */}
        <div className="flex items-center space-x-2.5">
          {/* Theme Toggle Button */}
          <ThemeToggle />

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 transition"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-500"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg py-2 z-50">
                <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-900 dark:text-white">Notifications</span>
                  <span className="text-[10px] text-teal-600 dark:text-teal-400 cursor-pointer">Mark all read</span>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-56 overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className="px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer text-xs">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{n.title}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{n.desc}</p>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">{n.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Sign Out Dropdown */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowPersonaMenu(!showPersonaMenu)}
                className="flex items-center space-x-2 p-1.5 pl-2 pr-2.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                <img
                  src={user.avatar_url}
                  alt={user.full_name}
                  className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                />
                <div className="hidden lg:block text-left text-xs">
                  <span className="font-semibold text-slate-900 dark:text-slate-100 block leading-none">
                    {user.full_name}
                  </span>
                  <span className="text-[10px] text-teal-600 dark:text-teal-400 uppercase font-semibold">
                    {user.role}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showPersonaMenu && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 text-xs">
                    <span className="text-slate-400 block text-[10px]">Logged in as</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{user.full_name}</span>
                    <span className="text-[11px] text-slate-500 block truncate">{user.email}</span>
                    <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded font-mono bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300">
                      ID: {user.emp_code}
                    </span>
                  </div>

                  <div className="p-1">
                    <button
                      onClick={logout}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition flex items-center space-x-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </header>
  );
};
