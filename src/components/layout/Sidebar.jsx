import React from 'react';
import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  Clock,
  CalendarDays,
  CreditCard,
  MessageSquareWarning,
  BellRing
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const navigationModules = [
  {
    id: 'dashboard',
    label: 'Overview',
    icon: LayoutDashboard,
    roles: ['admin', 'hr', 'manager', 'employee', 'recruiter'],
  },
  {
    id: 'employee',
    label: 'Employees',
    icon: Users,
    roles: ['admin', 'hr', 'manager', 'employee', 'recruiter'],
  },
  {
    id: 'organization',
    label: 'Departments',
    icon: Building2,
    roles: ['admin', 'hr', 'manager'],
  },
  {
    id: 'recruitment',
    label: 'Recruitment',
    icon: Briefcase,
    roles: ['admin', 'hr', 'recruiter'],
  },
  {
    id: 'attendance',
    label: 'Attendance',
    icon: Clock,
    roles: ['admin', 'hr', 'manager', 'employee'],
  },
  {
    id: 'leave',
    label: 'Leaves',
    icon: CalendarDays,
    roles: ['admin', 'hr', 'manager', 'employee'],
  },
  {
    id: 'payroll',
    label: 'Payroll',
    icon: CreditCard,
    roles: ['admin', 'hr', 'employee'],
  },
  {
    id: 'grievance',
    label: 'Grievances',
    icon: MessageSquareWarning,
    roles: ['admin', 'hr', 'manager', 'employee'],
  },
  {
    id: 'notifications',
    label: 'Announcements',
    icon: BellRing,
    roles: ['admin', 'hr', 'manager', 'employee', 'recruiter'],
  },
];

export const Sidebar = ({ currentTab, setCurrentTab, isMobileOpen, onCloseMobile }) => {
  const { hasRole, user } = useAuth();

  const handleNavClick = (tabId, isAllowed) => {
    if (!isAllowed) return;
    setCurrentTab(tabId);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-60 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-transform duration-200 md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo Header */}
          <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold text-sm">
                N
              </div>
              <div>
                <span className="font-bold text-base text-slate-900 dark:text-white leading-none block">
                  Nexus<span className="text-teal-600 dark:text-teal-400">HR</span>
                </span>
                <span className="text-[10px] text-slate-400">Human Resources</span>
              </div>
            </div>
          </div>

          {/* Nav List */}
          <div className="px-3 py-4 space-y-1">
            {navigationModules.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              const isAllowed = hasRole(item.roles);

              // If role is not allowed, do not show in menu to prevent unauthorized probing
              if (!isAllowed) return null;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id, isAllowed)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition ${
                    isActive
                      ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Clean Footer with active role badge */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <div>
            <p className="font-medium text-slate-600 dark:text-slate-300">{user?.full_name}</p>
            <p className="text-[10px] uppercase font-mono text-teal-600 dark:text-teal-400">{user?.role}</p>
          </div>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-slate-500">
            {user?.emp_code}
          </span>
        </div>
      </aside>
    </>
  );
};
