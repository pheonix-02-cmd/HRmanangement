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
  BellRing,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const navigationModules = [
  {
    id: 'dashboard',
    label: 'Overview',
    employeeLabel: 'My Dashboard',
    icon: LayoutDashboard,
    roles: ['admin', 'hr', 'manager', 'employee', 'recruiter'],
  },
  {
    id: 'employee',
    label: 'Employee Directory',
    icon: Users,
    roles: ['admin', 'hr', 'manager', 'recruiter'], // Restricted: not visible to employee
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
    label: 'Attendance Records',
    employeeLabel: 'My Attendance',
    icon: Clock,
    roles: ['admin', 'hr', 'manager', 'employee'],
  },
  {
    id: 'leave',
    label: 'Leave Management',
    employeeLabel: 'My Leaves',
    icon: CalendarDays,
    roles: ['admin', 'hr', 'manager', 'employee'],
  },
  {
    id: 'payroll',
    label: 'Payroll Operations',
    employeeLabel: 'My Payslips',
    icon: CreditCard,
    roles: ['admin', 'hr', 'employee'],
  },
  {
    id: 'grievance',
    label: 'Grievance Redressal',
    employeeLabel: 'My Grievances',
    icon: MessageSquareWarning,
    roles: ['admin', 'hr', 'manager', 'employee'],
  },
  {
    id: 'notifications',
    label: 'Announcements',
    employeeLabel: 'Company Notices',
    icon: BellRing,
    roles: ['admin', 'hr', 'manager', 'employee', 'recruiter'],
  },
];

export const Sidebar = ({ currentTab, setCurrentTab, isMobileOpen, onCloseMobile }) => {
  const { hasRole, user, portalMode } = useAuth();
  const isEmployeeMode = user?.role === 'employee';

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
                <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold tracking-wide">
                  {isEmployeeMode ? 'Employee Portal' : 'Management Portal'}
                </span>
              </div>
            </div>
          </div>

          {/* Section Indicator */}
          <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span className="uppercase font-bold tracking-wider">
              {isEmployeeMode ? 'Staff Self-Service' : 'Enterprise Modules'}
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-300">
              {user?.role}
            </span>
          </div>

          {/* Nav List */}
          <div className="px-3 py-3 space-y-1">
            {navigationModules.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              const isAllowed = hasRole(item.roles);

              // Strictly filter out non-employee modules
              if (!isAllowed) return null;

              const displayLabel = isEmployeeMode && item.employeeLabel ? item.employeeLabel : item.label;

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
                  <span>{displayLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer with employee_id directly from database */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <div>
            <p className="font-medium text-slate-700 dark:text-slate-200 truncate max-w-[110px]">{user?.full_name}</p>
            <p className="text-[10px] text-slate-400 font-mono truncate max-w-[110px]">{user?.email}</p>
          </div>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-slate-500 shrink-0">
            {user?.employee_id || 'ID'}
          </span>
        </div>
      </aside>
    </>
  );
};
