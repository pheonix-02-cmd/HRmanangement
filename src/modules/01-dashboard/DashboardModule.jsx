import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Clock, 
  Calendar, 
  Briefcase, 
  CreditCard,
  MessageSquareWarning,
  ArrowRight
} from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';
import { fetchTableData } from '../../services/dataStorage';

export const DashboardModule = ({ onNavigate }) => {
  const { user } = useAuth();
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

  const pendingLeaves = leaveRequests.filter(l => l.status === 'pending');
  const activeJobs = jobPostings.filter(j => j.status === 'published');
  const presentToday = attendance.filter(a => a.status === 'present').length;
  const attendanceRate = employees.length > 0 ? Math.round((presentToday / employees.length) * 100) : 92;

  return (
    <div className="space-y-6">
      
      {/* Clean Welcome Banner */}
      <div className="rounded-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Hello, {user.full_name}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {user.title} • {user.department || 'Enterprise'}
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

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Employees"
          value={employees.length.toString()}
          icon={Users}
          color="brand"
        />
        <StatCard
          title="Present Today"
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
          title="Open Jobs"
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
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Departments</h3>
            <button
              onClick={() => onNavigate('organization')}
              className="text-xs text-teal-600 dark:text-teal-400 hover:underline flex items-center font-medium"
            >
              View all <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>

          <div className="space-y-3.5">
            {departments.map((dept, i) => {
              const deptEmpCount = employees.filter(e => e.department_id === dept.id).length || 1;
              const pct = Math.min(100, Math.round((deptEmpCount / (employees.length || 1)) * 100));

              return (
                <div key={dept.id} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{dept.name}</span>
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
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Quick Actions</h3>

            <div className="space-y-2">
              <button
                onClick={() => onNavigate('employee')}
                className="w-full p-2.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center justify-between"
              >
                <span>Add Employee</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigate('recruitment')}
                className="w-full p-2.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center justify-between"
              >
                <span>Post Job</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigate('payroll')}
                className="w-full p-2.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center justify-between"
              >
                <span>View Payslips</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Pending Leaves Card */}
          <div className="rounded-xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Pending Leave Requests</h4>
              <Badge variant="warning">{pendingLeaves.length}</Badge>
            </div>

            {pendingLeaves.length > 0 ? (
              <div className="space-y-2">
                {pendingLeaves.slice(0, 2).map((l) => (
                  <div key={l.id} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs">
                    <div className="flex justify-between font-medium text-slate-800 dark:text-slate-200">
                      <span>{l.leave_type}</span>
                      <span className="text-slate-500">{l.total_days}d</span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{l.reason}</p>
                  </div>
                ))}
                <button
                  onClick={() => onNavigate('leave')}
                  className="w-full text-center text-xs font-medium text-teal-600 dark:text-teal-400 pt-1 hover:underline"
                >
                  Manage Leaves →
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
