import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Clock, 
  Calendar, 
  Briefcase, 
  CreditCard,
  MessageSquareWarning,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileText,
  CalendarDays
} from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';
import { fetchTableData } from '../../services/dataStorage';

export const DashboardModule = ({ onNavigate }) => {
  const { user } = useAuth();
  const isEmployee = user?.role === 'employee';

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [jobPostings, setJobPostings] = useState([]);

  useEffect(() => {
    const loadAll = async () => {
      const [empRes, deptRes, attRes, lrRes, jobRes] = await Promise.all([
        fetchTableData('employee_records'),
        fetchTableData('departments'),
        fetchTableData('attendance'),
        fetchTableData('leave_requests'),
        fetchTableData('job_postings'),
      ]);
      setEmployees(empRes.data || []);
      setDepartments(deptRes.data || []);
      setAttendance(attRes.data || []);
      setLeaveRequests(lrRes.data || []);
      setJobPostings(jobRes.data || []);
    };
    loadAll();
  }, []);

  // Filter personal data for employee
  const currentEmpId = user?.employee_id || user?.id;
  const myAttendance = attendance.find(a => (a.employee_id === currentEmpId));
  const myLeaves = leaveRequests.filter(l => (l.employee_id === currentEmpId));
  const pendingLeaves = leaveRequests.filter(l => l.status === 'pending');
  const activeJobs = jobPostings.filter(j => j.status === 'published');
  const presentToday = attendance.filter(a => a.status === 'present').length;
  const attendanceRate = employees.length > 0 ? Math.round((presentToday / employees.length) * 100) : 92;

  // ==========================================
  // EMPLOYEE SELF-SERVICE VIEW
  // ==========================================
  if (isEmployee) {
    return (
      <div className="space-y-6">
        
        {/* Employee Banner */}
        <div className="rounded-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Welcome back, {user?.full_name}
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 font-semibold">
                Staff Self-Service
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Employee ID: <span className="font-mono text-slate-700 dark:text-slate-300">{user?.employee_id}</span> • Regular Shift (09:00 AM - 06:00 PM)
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onNavigate('attendance')}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-teal-600 text-white hover:bg-teal-700 transition"
            >
              Punch Attendance
            </button>
            <button
              onClick={() => onNavigate('leave')}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Apply Leave
            </button>
          </div>
        </div>

        {/* Employee Personal Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Today's Attendance"
            value={myAttendance?.status === 'present' ? 'Clocked In' : 'Logged In'}
            icon={Clock}
            color="emerald"
          />
          <StatCard
            title="Leave Balance"
            value="18 Days"
            icon={CalendarDays}
            color="brand"
          />
          <StatCard
            title="Latest Net Pay"
            value="₹98,500"
            icon={CreditCard}
            color="primary"
          />
          <StatCard
            title="My Requests"
            value={myLeaves.length.toString()}
            icon={FileText}
            color="amber"
          />
        </div>

        {/* Employee Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Recent My Leaves */}
          <div className="lg:col-span-2 rounded-xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">My Leave Requests</h3>
              <button
                onClick={() => onNavigate('leave')}
                className="text-xs text-teal-600 dark:text-teal-400 hover:underline flex items-center font-medium"
              >
                View all <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>

            {myLeaves.length > 0 ? (
              <div className="space-y-3">
                {myLeaves.map((l) => (
                  <div key={l.request_id || l.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{l.leave_type}</span>
                        <Badge variant={l.status === 'approved' ? 'success' : l.status === 'rejected' ? 'danger' : 'warning'}>
                          {l.status}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{l.reason}</p>
                    </div>
                    <span className="text-slate-500 font-mono text-[11px]">
                      {l.start_date} to {l.end_date}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No leave requests submitted yet.</p>
            )}
          </div>

          {/* Quick Shortcuts */}
          <div className="space-y-4">
            <div className="rounded-xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Self-Service Shortcuts</h3>
              <div className="space-y-2">
                <button
                  onClick={() => onNavigate('payroll')}
                  className="w-full p-2.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center justify-between"
                >
                  <span>Download Payslip</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
                <button
                  onClick={() => onNavigate('grievance')}
                  className="w-full p-2.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center justify-between"
                >
                  <span>Submit Workplace Grievance</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
                <button
                  onClick={() => onNavigate('notifications')}
                  className="w-full p-2.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center justify-between"
                >
                  <span>Company Bulletins</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>

            <div className="rounded-xl p-4 bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/50 text-xs">
              <div className="flex items-center space-x-2 text-teal-800 dark:text-teal-300 font-semibold mb-1">
                <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Employee Portal Privacy Active</span>
              </div>
              <p className="text-[11px] text-teal-700 dark:text-teal-400">
                You are viewing your own private employee records. Managerial approval queues and other employee data are restricted.
              </p>
            </div>
          </div>

        </div>

      </div>
    );
  }

  // ==========================================
  // MANAGEMENT & ADMIN EXECUTIVE VIEW
  // ==========================================
  return (
    <div className="space-y-6">
      
      {/* Clean Welcome Banner */}
      <div className="rounded-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Hello, {user?.full_name}
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 font-semibold uppercase">
              {user?.role} Portal
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Enterprise Management Workspace • {departments.length} Active Departments
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onNavigate('attendance')}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-teal-600 text-white hover:bg-teal-700 transition"
          >
            Attendance Logs
          </button>
          <button
            onClick={() => onNavigate('leave')}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            Leave Approvals
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Employees"
          value={employees.length.toString()}
          icon={Users}
          color="brand"
        />
        <StatCard
          title="Attendance Rate"
          value={`${attendanceRate}%`}
          icon={Clock}
          color="emerald"
        />
        <StatCard
          title="Pending Leaves"
          value={pendingLeaves.length.toString()}
          icon={Calendar}
          color="amber"
        />
        <StatCard
          title="Open Job Openings"
          value={activeJobs.length.toString()}
          icon={Briefcase}
          color="primary"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Department Overview */}
        <div className="lg:col-span-2 rounded-xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Department Headcounts</h3>
            <button
              onClick={() => onNavigate('organization')}
              className="text-xs text-teal-600 dark:text-teal-400 hover:underline flex items-center font-medium"
            >
              View all <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>

          <div className="space-y-3.5">
            {departments.map((dept) => {
              const deptId = dept.department_id || dept.id;
              const deptName = dept.department_name || dept.name;
              const deptEmpCount = employees.filter(e => e.department_id === deptId).length;
              const pct = Math.min(100, Math.round((deptEmpCount / (employees.length || 1)) * 100));

              return (
                <div key={deptId} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{deptName}</span>
                    <span className="text-slate-400">{deptEmpCount} employees</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-teal-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions & Approvals */}
        <div className="space-y-4">
          <div className="rounded-xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Management Actions</h3>

            <div className="space-y-2">
              <button
                onClick={() => onNavigate('employee')}
                className="w-full p-2.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center justify-between"
              >
                <span>Employee Directory</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigate('recruitment')}
                className="w-full p-2.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center justify-between"
              >
                <span>Recruitment Pipeline</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigate('payroll')}
                className="w-full p-2.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center justify-between"
              >
                <span>Payroll Runs</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Pending Leaves Card */}
          <div className="rounded-xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Pending Leave Approvals</h4>
              <Badge variant="warning">{pendingLeaves.length}</Badge>
            </div>

            {pendingLeaves.length > 0 ? (
              <div className="space-y-2">
                {pendingLeaves.slice(0, 2).map((l) => (
                  <div key={l.request_id || l.id} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs">
                    <div className="flex justify-between font-medium text-slate-800 dark:text-slate-200">
                      <span>{l.leave_type}</span>
                      <span className="text-slate-400 font-mono text-[10px]">{l.employee_id}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{l.reason}</p>
                  </div>
                ))}
                <button
                  onClick={() => onNavigate('leave')}
                  className="w-full text-center text-xs font-medium text-teal-600 dark:text-teal-400 pt-1 hover:underline"
                >
                  Manage Approvals →
                </button>
              </div>
            ) : (
              <p className="text-xs text-slate-400">No pending leave requests.</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
