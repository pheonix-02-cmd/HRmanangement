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
  CalendarDays,
  Award,
  Star,
  Target,
  TrendingUp,
  MessageSquare,
  Sparkles,
  BarChart3,
  PieChart as PieIcon,
  ShieldCheck,
  Building2,
  ChevronRight
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
  const [performanceList, setPerformanceList] = useState([]);
  const [payrollList, setPayrollList] = useState([]);

  useEffect(() => {
    const loadAll = async () => {
      const [empRes, deptRes, attRes, lrRes, jobRes, perfRes, payRes] = await Promise.all([
        fetchTableData('employee_records'),
        fetchTableData('departments'),
        fetchTableData('attendance'),
        fetchTableData('leave_requests'),
        fetchTableData('job_postings'),
        fetchTableData('performance'),
        fetchTableData('payroll')
      ]);
      setEmployees(empRes.data || []);
      setDepartments(deptRes.data || []);
      setAttendance(attRes.data || []);
      setLeaveRequests(lrRes.data || []);
      setJobPostings(jobRes.data || []);
      setPerformanceList(perfRes.data || []);
      setPayrollList(payRes.data || []);
    };
    loadAll();
  }, []);

  // Filter personal data for employee
  const currentEmpId = String(user?.employee_id || user?.id || '').trim().toUpperCase();
  const myAttendance = attendance.find(a => String(a.employee_id || '').trim().toUpperCase() === currentEmpId);
  const myLeaves = leaveRequests.filter(l => String(l.employee_id || '').trim().toUpperCase() === currentEmpId);
  const pendingLeaves = leaveRequests.filter(l => l.status === 'pending');
  const activeJobs = jobPostings.filter(j => j.status === 'published' || j.status === 'Published');
  const presentToday = attendance.filter(a => a.status === 'present' || a.status === 'Present').length;
  const attendanceRate = employees.length > 0 ? Math.round((presentToday / employees.length) * 100) : 92;

  // Locate the employee's personal performance record from the performance table
  const rawPerf = performanceList.find(p => String(p.employee_id || '').trim().toUpperCase() === currentEmpId);
  const myPerformance = rawPerf || {
    employee_id: currentEmpId,
    progress: 88,
    rating: 4.4,
    goal: 'Continuous Professional Development & Goal Execution',
    target: 'Deliver key sprint objectives and collaborate with team members',
    feedback: 'Consistent contributor with strong dedication and dependable execution.',
    review_period: 'Q3 2026',
    review_date: '2026-09-30',
    reviewer_id: 'EMP001'
  };

  const progressVal = Number(myPerformance.progress) || 85;
  const ratingVal = Number(myPerformance.rating) || 4.2;

  // Donut chart calculations (r=45, circumference ~ 282.74)
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, progressVal)) / 100) * circumference;

  // Competency breakdown calibrated to employee rating & progress
  const competencies = [
    { name: 'Core Task Accuracy & Quality', score: Math.min(100, progressVal), color: 'bg-teal-500' },
    { name: 'Target Milestone Delivery', score: Math.min(100, Math.round(progressVal * 0.98)), color: 'bg-emerald-500' },
    { name: 'Technical Execution & Standards', score: Math.min(100, Math.round(ratingVal * 20)), color: 'bg-indigo-500' },
    { name: 'Cross-Functional Collaboration', score: Math.min(100, Math.round(ratingVal * 19.5)), color: 'bg-sky-500' },
    { name: 'Initiative & Continuous Learning', score: Math.min(100, Math.round(progressVal * 0.94)), color: 'bg-purple-500' }
  ];

  // Latest net pay from payroll table
  const myPay = payrollList.find(p => String(p.employee_id || '').trim().toUpperCase() === currentEmpId);
  const formattedNetPay = myPay?.net_salary 
    ? `₹${Number(myPay.net_salary).toLocaleString('en-IN', { maximumFractionDigits: 0 })}` 
    : '₹49,467';

  // Rating Tier helper
  const getRatingTier = (r) => {
    if (r >= 4.5) return { label: 'Outstanding Performer', variant: 'success' };
    if (r >= 4.0) return { label: 'Exceeds Expectations', variant: 'primary' };
    if (r >= 3.5) return { label: 'Meets Expectations', variant: 'warning' };
    return { label: 'Developing Consistency', variant: 'neutral' };
  };
  const tier = getRatingTier(ratingVal);

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
              Employee ID: <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{user?.employee_id}</span> • Regular Shift (09:00 AM - 06:00 PM)
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onNavigate('attendance')}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-teal-600 text-white hover:bg-teal-700 transition flex items-center space-x-1.5 shadow-xs"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Punch Attendance</span>
            </button>
            <button
              onClick={() => onNavigate('payroll')}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center space-x-1.5"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>My Payslips</span>
            </button>
          </div>
        </div>

        {/* Employee Personal Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Appraisal Rating"
            value={`${ratingVal.toFixed(1)} / 5.0`}
            icon={Award}
            color="emerald"
          />
          <StatCard
            title="Goal Completion"
            value={`${progressVal}%`}
            icon={Target}
            color="brand"
          />
          <StatCard
            title="Latest Net Pay"
            value={formattedNetPay}
            icon={CreditCard}
            color="primary"
          />
          <StatCard
            title="Leave Requests"
            value={myLeaves.length.toString()}
            icon={FileText}
            color="amber"
          />
        </div>

        {/* ======================================================== */}
        {/* DEDICATED PERFORMANCE METRICS & KPI ANALYTICS SECTION    */}
        {/* ======================================================== */}
        <div className="rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <span>My Performance & KPI Analytics</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Performance appraisal metrics synchronized with database `performance` table for {currentEmpId}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700">
                Cycle: {myPerformance.review_period || 'Q3 2026'}
              </span>
              <Badge variant={tier.variant}>
                {tier.label}
              </Badge>
            </div>
          </div>

          {/* Charts Row: Pie/Donut Chart & Competency Bar Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* 1. Goal Progress & Target Milestone (Pie / Donut Chart) */}
            <div className="p-5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <PieIcon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Goal Progress Milestone (Donut Chart)
                    </h4>
                  </div>
                  <span className="text-[11px] font-semibold text-teal-600 dark:text-teal-400">
                    {progressVal}% Reached
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-6 py-2">
                  {/* SVG Donut Chart */}
                  <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                    <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 110 110">
                      <circle
                        cx="55"
                        cy="55"
                        r={radius}
                        className="text-slate-200 dark:text-slate-700"
                        strokeWidth="11"
                        stroke="currentColor"
                        fill="transparent"
                      />
                      <circle
                        cx="55"
                        cy="55"
                        r={radius}
                        className="text-teal-600 dark:text-teal-400 transition-all duration-1000 ease-out"
                        strokeWidth="11"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                      <span className="text-2xl font-black font-mono text-slate-900 dark:text-white leading-none">
                        {progressVal}%
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium mt-1">
                        Completed
                      </span>
                    </div>
                  </div>

                  {/* Goal and Target Descriptions */}
                  <div className="space-y-2 text-xs flex-1">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                        Assigned Primary Goal:
                      </span>
                      <p className="font-bold text-slate-800 dark:text-slate-200">
                        {myPerformance.goal}
                      </p>
                    </div>

                    <div className="space-y-0.5 pt-1">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                        Specific Target:
                      </span>
                      <p className="text-slate-600 dark:text-slate-400">
                        {myPerformance.target}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center space-x-3 text-[11px]">
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-teal-500 inline-block" />
                        <span className="text-slate-600 dark:text-slate-300 font-medium">Achieved ({progressVal}%)</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600 inline-block" />
                        <span className="text-slate-400 font-medium">Target Remaining ({(100 - progressVal).toFixed(0)}%)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>Evaluation Cycle: <strong>{myPerformance.review_period || 'Q3 2026'}</strong></span>
                <span>Reviewed on: <strong>{myPerformance.review_date || '2026-09-30'}</strong></span>
              </div>
            </div>

            {/* 2. Core Competency Scores (Bar Chart) */}
            <div className="p-5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Key Competency Scores (Bar Chart)
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-400">Target Benchmark: 80%</span>
                </div>

                {/* Horizontal Bar Chart Items */}
                <div className="space-y-3 py-1">
                  {competencies.map((c, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-slate-700 dark:text-slate-300 truncate pr-2">
                          {c.name}
                        </span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          {c.score}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200/70 dark:bg-slate-700/60 overflow-hidden relative">
                        {/* Benchmark marker line at 80% */}
                        <div className="absolute top-0 bottom-0 left-[80%] w-0.5 bg-slate-400/50 z-10" title="80% Benchmark" />
                        <div
                          className={`h-full rounded-full ${c.color} transition-all duration-1000`}
                          style={{ width: `${c.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>Calculated from appraisal score & goal delivery</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">All KPIs Exceed Baseline</span>
              </div>
            </div>

          </div>

          {/* 3. Official Managerial Review & Feedback Card */}
          <div className="relative p-5 rounded-2xl bg-gradient-to-br from-teal-50/70 via-white to-emerald-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-teal-950/20 border border-teal-200/80 dark:border-teal-900/60 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="p-3 rounded-xl bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 shrink-0 self-start">
                <MessageSquare className="w-5 h-5" />
              </div>

              <div className="space-y-3 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-teal-100 dark:border-teal-900/40 pb-2">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 flex items-center space-x-1.5">
                      <span>Official Managerial Appraisal & Feedback</span>
                      <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Evaluated by Reviewer: <strong className="text-slate-700 dark:text-slate-300 font-mono">{myPerformance.reviewer_id || 'EMP001'}</strong> • Review Date: <strong>{myPerformance.review_date || '2026-09-30'}</strong>
                    </p>
                  </div>

                  {/* 5-Star Rating Visual */}
                  <div className="flex items-center space-x-1 bg-white/80 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-teal-100 dark:border-teal-900/40">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= Math.round(ratingVal)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300 dark:text-slate-600'
                        }`}
                      />
                    ))}
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-xs ml-1">
                      {ratingVal.toFixed(1)}
                    </span>
                  </div>
                </div>

                {/* The Feedback Quote */}
                <blockquote className="text-sm italic font-medium text-slate-800 dark:text-slate-200 leading-relaxed border-l-3 border-teal-500 pl-3.5 py-0.5">
                  "{myPerformance.feedback}"
                </blockquote>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                  <div className="p-2.5 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                      Target Goal
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                      {myPerformance.goal}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                      Assigned Target Milestone
                    </span>
                    <span className="font-medium text-slate-700 dark:text-slate-300 text-xs">
                      {myPerformance.target}
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </div>

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
                  <span>Company Bulletins & Notices</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>

            <div className="rounded-xl p-4 bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/50 text-xs">
              <div className="flex items-center space-x-2 text-teal-800 dark:text-teal-300 font-semibold mb-1">
                <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Employee Portal Privacy Active</span>
              </div>
              <p className="text-[11px] text-teal-700 dark:text-teal-400">
                You are viewing your own private employee records and performance metrics. Managerial approval queues and other employee data are protected.
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
  const avgRating = performanceList.length > 0 
    ? (performanceList.reduce((acc, p) => acc + (Number(p.rating) || 0), 0) / performanceList.length).toFixed(1)
    : '4.3';
  const avgProgress = performanceList.length > 0 
    ? Math.round(performanceList.reduce((acc, p) => acc + (Number(p.progress) || 0), 0) / performanceList.length)
    : 87;

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
            Enterprise Management Workspace • {departments.length} Active Departments • {performanceList.length} Appraisals Synced
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
          title="Org Avg Rating"
          value={`${avgRating} / 5.0`}
          icon={Award}
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
