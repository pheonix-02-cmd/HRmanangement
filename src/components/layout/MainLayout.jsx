import React, { useState } from 'react';
import { Sidebar, navigationModules } from './Sidebar';
import { Navbar } from './Navbar';
import { DashboardModule } from '../../modules/01-dashboard/DashboardModule';
import { EmployeeModule } from '../../modules/02-employee/EmployeeModule';
import { OrganizationModule } from '../../modules/03-organization/OrganizationModule';
import { RecruitmentModule } from '../../modules/04-recruitment/RecruitmentModule';
import { AttendanceModule } from '../../modules/05-attendance/AttendanceModule';
import { LeaveModule } from '../../modules/06-leave/LeaveModule';
import { PayrollModule } from '../../modules/07-payroll/PayrollModule';
import { GrievanceModule } from '../../modules/08-grievance/GrievanceModule';
import { NotificationModule } from '../../modules/09-notifications/NotificationModule';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

export const MainLayout = () => {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { hasRole } = useAuth();

  // Route Authorization Guard
  const currentNav = navigationModules.find(m => m.id === currentTab);
  const isAuthorized = currentNav ? hasRole(currentNav.roles) : true;

  const renderModule = () => {
    if (!isAuthorized) {
      return (
        <div className="p-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center max-w-md mx-auto mt-12 space-y-3">
          <ShieldAlert className="w-10 h-10 text-rose-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Access Restricted</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            You do not have administrative permissions to view this module. Please contact your system administrator.
          </p>
          <button
            onClick={() => setCurrentTab('dashboard')}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 transition"
          >
            Return to Dashboard
          </button>
        </div>
      );
    }

    switch (currentTab) {
      case 'dashboard':
        return <DashboardModule onNavigate={setCurrentTab} />;
      case 'employee':
        return <EmployeeModule />;
      case 'organization':
        return <OrganizationModule />;
      case 'recruitment':
        return <RecruitmentModule />;
      case 'attendance':
        return <AttendanceModule />;
      case 'leave':
        return <LeaveModule />;
      case 'payroll':
        return <PayrollModule />;
      case 'grievance':
        return <GrievanceModule />;
      case 'notifications':
        return <NotificationModule />;
      default:
        return <DashboardModule onNavigate={setCurrentTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-200">
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderModule()}
        </main>
      </div>
    </div>
  );
};
