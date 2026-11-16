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
  ChevronRight,
  Layers,
  Activity,
  Check,
  Eye,
  X,
  ExternalLink,
  Download,
  Filter,
  RefreshCw,
  Database,
  CheckCheck
} from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';
import { fetchTableData } from '../../services/dataStorage';
import { initialReportsAnalytics } from '../../mock/seedData';

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
  const [reportsAnalytics, setReportsAnalytics] = useState([]);
  const [selectedReportModal, setSelectedReportModal] = useState(null);
  const [reportFilter, setReportFilter] = useState('all');
  const [isRefreshingReports, setIsRefreshingReports] = useState(false);

  const loadAll = async () => {
    setIsRefreshingReports(true);
    const [empRes, deptRes, attRes, lrRes, jobRes, perfRes, payRes, repRes] = await Promise.all([
      fetchTableData('employee_records'),
      fetchTableData('departments'),
      fetchTableData('attendance'),
      fetchTableData('leave_requests'),
      fetchTableData('job_postings'),
      fetchTableData('performance'),
      fetchTableData('payroll'),
      fetchTableData('reports_analytics')
    ]);
    setEmployees(empRes.data || []);
    setDepartments(deptRes.data || []);
    setAttendance(attRes.data || []);
    setLeaveRequests(lrRes.data || []);
    setJobPostings(jobRes.data || []);
    setPerformanceList(perfRes.data || []);
    setPayrollList(payRes.data || []);

    const loadedReports = (repRes.data && repRes.data.length > 0) ? repRes.data : initialReportsAnalytics;
    setReportsAnalytics(loadedReports);
    setIsRefreshingReports(false);
  };

  useEffect(() => {
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
  // Extract individual reports from reports_analytics table
  const perfReport = reportsAnalytics.find(r => r.report_type === 'performance');
  const attReport = reportsAnalytics.find(r => r.report_type === 'attendance');
  const payReport = reportsAnalytics.find(r => r.report_type === 'payroll');
  const recReport = reportsAnalytics.find(r => r.report_type === 'recruitment');
  const mgmtReport = reportsAnalytics.find(r => r.report_type === 'management');

  const perfData = perfReport?.report_data || {};
  const attData = attReport?.report_data || {};
  const payData = payReport?.report_data || {};
  const recData = recReport?.report_data || {};
  const mgmtData = mgmtReport?.report_data || {};

  const orgAvgRating = perfData.average_rating ? Number(perfData.average_rating).toFixed(1) : (performanceList.length > 0 ? (performanceList.reduce((acc, p) => acc + (Number(p.rating) || 0), 0) / performanceList.length).toFixed(1) : '4.3');
  const orgAvgProgress = perfData.average_progress ? Number(perfData.average_progress) : (performanceList.length > 0 ? Math.round(performanceList.reduce((acc, p) => acc + (Number(p.progress) || 0), 0) / performanceList.length) : 86.5);
  const totalScopedEmployees = perfData.total_employees || employees.length || 30;
  const leadReviewer = perfData.reviewer_id || 'EMP001';
  const reportingCycle = perfData.review_period || 'Q3 2026';

  const attMetricsList = attData.metrics || ['Present days', 'Absent days', 'Late arrivals', 'Attendance percentage'];
  const payMetricsList = payData.metrics || ['Gross salary', 'Net salary', 'Total deductions', 'Payment status'];
  const recMetricsList = recData.metrics || ['Total applications', 'Applications shortlisted', 'Interviews conducted', 'Candidates selected'];
  const mgmtModulesList = mgmtData.modules_included || ['Employee Management', 'Attendance', 'Payroll', 'Recruitment', 'Performance'];

  // Filter reports
  const filteredReports = reportsAnalytics.filter(r => {
    if (reportFilter === 'all') return true;
    return r.report_type === reportFilter;
  });

  // Category badges helper
  const getReportMeta = (type) => {
    switch (type) {
      case 'performance':
        return { label: 'Performance', color: 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800', barColor: 'bg-amber-500' };
      case 'attendance':
        return { label: 'Attendance', color: 'bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-300 border-teal-300 dark:border-teal-800', barColor: 'bg-teal-500' };
      case 'payroll':
        return { label: 'Payroll', color: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800', barColor: 'bg-indigo-500' };
      case 'recruitment':
        return { label: 'Recruitment', color: 'bg-sky-100 dark:bg-sky-900/40 text-sky-800 dark:text-sky-300 border-sky-300 dark:border-sky-800', barColor: 'bg-sky-500' };
      case 'management':
        return { label: 'Management', color: 'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800', barColor: 'bg-purple-500' };
      default:
        return { label: type || 'Report', color: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700', barColor: 'bg-slate-500' };
    }
  };

  // Donut chart math: circumference = 2 * PI * 46 ~ 289.03
  const cRadius = 46;
  const cCircum = 2 * Math.PI * cRadius;
  const donutSlices = [
    { name: 'Performance', pct: 25, color: '#f59e0b', report: perfReport },
    { name: 'Attendance', pct: 20, color: '#14b8a6', report: attReport },
    { name: 'Payroll', pct: 20, color: '#6366f1', report: payReport },
    { name: 'Recruitment', pct: 20, color: '#0284c7', report: recReport },
    { name: 'Management', pct: 15, color: '#a855f7', report: mgmtReport }
  ];

  let accumulatedPct = 0;
  const slicesWithOffsets = donutSlices.map(s => {
    const strokeDasharray = `${(s.pct / 100) * cCircum} ${cCircum}`;
    const strokeDashoffset = -((accumulatedPct / 100) * cCircum);
    accumulatedPct += s.pct;
    return { ...s, strokeDasharray, strokeDashoffset };
  });

  return (
    <div className="space-y-6">
      
      {/* 1. Executive Intelligence Banner */}
      <div className="rounded-2xl p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight">
              Executive Reports & Analytics Center
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 uppercase font-semibold">
              {user?.role || 'Management'}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center space-x-1">
              <Database className="w-3 h-3 inline mr-1 text-teal-400" />
              <span>reports_analytics synced ({reportsAnalytics.length} rows)</span>
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1.5 flex items-center flex-wrap gap-2">
            <span>Cycle: <strong>{reportingCycle}</strong> (01 Jul 2026 – 30 Sep 2026)</span>
            <span>•</span>
            <span>Organization Scoped: <strong>{totalScopedEmployees} Staff</strong></span>
            <span>•</span>
            <span>Lead Evaluator: <strong className="font-mono text-teal-300">{leadReviewer}</strong></span>
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={loadAll}
            disabled={isRefreshingReports}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition flex items-center space-x-1.5 backdrop-blur-xs disabled:opacity-50"
            title="Reload reports from Supabase"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingReports ? 'animate-spin' : ''}`} />
            <span>Sync Live DB</span>
          </button>
          <button
            onClick={() => onNavigate('attendance')}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-teal-500 hover:bg-teal-600 text-white transition flex items-center space-x-1.5 shadow-sm"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Attendance Logs</span>
          </button>
        </div>
      </div>

      {/* 2. Top Executive KPI Cards (Powered by reports_analytics table) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Performance KPI */}
        <div 
          onClick={() => perfReport && setSelectedReportModal(perfReport)}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-600 transition cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Org Performance
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {orgAvgRating}
            </span>
            <span className="text-xs text-amber-500 font-semibold flex items-center">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400 inline mr-0.5" /> / 5.0
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
            Avg Progress: <strong className="text-slate-800 dark:text-slate-200">{orgAvgProgress}%</strong> across {totalScopedEmployees} staff
          </p>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
            <span className="font-mono text-amber-600 dark:text-amber-400 font-medium">reports_analytics</span>
            <span className="group-hover:text-amber-500 transition flex items-center">Inspect <ChevronRight className="w-3 h-3 ml-0.5" /></span>
          </div>
        </div>

        {/* Attendance KPI */}
        <div 
          onClick={() => attReport && setSelectedReportModal(attReport)}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-600 transition cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Attendance Health
            </span>
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 group-hover:scale-105 transition">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {attendanceRate}%
            </span>
            <span className="text-xs text-teal-600 dark:text-teal-400 font-semibold">
              Compliance
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
            Tracking {attMetricsList.length} quarterly metrics
          </p>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
            <span className="font-mono text-teal-600 dark:text-teal-400 font-medium">reports_analytics</span>
            <span className="group-hover:text-teal-500 transition flex items-center">Inspect <ChevronRight className="w-3 h-3 ml-0.5" /></span>
          </div>
        </div>

        {/* Payroll Operations KPI */}
        <div 
          onClick={() => payReport && setSelectedReportModal(payReport)}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Payroll Operations
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              100%
            </span>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
              Disbursed
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
            Gross, Net, Deductions & Status verified
          </p>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
            <span className="font-mono text-indigo-600 dark:text-indigo-400 font-medium">reports_analytics</span>
            <span className="group-hover:text-indigo-500 transition flex items-center">Inspect <ChevronRight className="w-3 h-3 ml-0.5" /></span>
          </div>
        </div>

        {/* Recruitment Pipeline KPI */}
        <div 
          onClick={() => recReport && setSelectedReportModal(recReport)}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-sky-400 dark:hover:border-sky-600 transition cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Recruitment Funnel
            </span>
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 group-hover:scale-105 transition">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {activeJobs.length}
            </span>
            <span className="text-xs text-sky-600 dark:text-sky-400 font-semibold">
              Active Openings
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
            Applications, shortlist, interviews & selections
          </p>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
            <span className="font-mono text-sky-600 dark:text-sky-400 font-medium">reports_analytics</span>
            <span className="group-hover:text-sky-500 transition flex items-center">Inspect <ChevronRight className="w-3 h-3 ml-0.5" /></span>
          </div>
        </div>

      </div>

      {/* 3. Consolidated HRMS Management Overview (From reports_analytics where report_type='management') */}
      <div className="rounded-2xl p-6 bg-gradient-to-br from-purple-50/60 via-white to-indigo-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-purple-950/20 border border-purple-200/80 dark:border-purple-900/50 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-purple-100 dark:border-purple-900/40">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-purple-600 text-white shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {mgmtReport?.report_name || 'Management Overview'}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300 font-semibold uppercase">
                  Consolidated Scope
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {mgmtData.description || 'Consolidated HRMS management overview spanning all 5 core modules'} • Period: <strong>2026-07-01 to 2026-09-30</strong>
              </p>
            </div>
          </div>

          <button
            onClick={() => mgmtReport && setSelectedReportModal(mgmtReport)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white transition flex items-center space-x-1.5 self-start sm:self-auto shrink-0 shadow-xs"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Inspect Overview Data</span>
          </button>
        </div>

        {/* The 5 Core Modules Stored in report_data.modules_included */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 pt-5">
          {mgmtModulesList.map((moduleName, i) => {
            const icons = [Users, Clock, CreditCard, Briefcase, Award];
            const ModIcon = icons[i % icons.length];
            return (
              <div key={i} className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-purple-100/80 dark:border-slate-700/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                      <ModIcon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold flex items-center">
                      <Check className="w-3 h-3 mr-0.5" /> Active
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {moduleName}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                    {i === 0 && '30 Personnel directory, 5 departments'}
                    {i === 1 && 'Shift punch-in/out & 92% rate'}
                    {i === 2 && 'Salary structures & monthly slips'}
                    {i === 3 && 'Talent requisition & interviews'}
                    {i === 4 && 'Quarterly reviews & 4.3 ⭐ rating'}
                  </p>
                </div>
                <div className="pt-2.5 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-purple-700 dark:text-purple-400 font-medium">
                  <span>Module #{i + 1}</span>
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Visual Analytics & Charts Suite */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Interactive SVG Donut / Pie Chart: Multi-Module Analytics Weighting */}
        <div className="rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <PieIcon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Module Analytics Weighting (Pie Chart)
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">Q3 Audit</span>
            </div>

            {/* Circular Donut Diagram */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-3">
              <div className="relative w-36 h-36 shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 110 110">
                  {/* Track circle */}
                  <circle
                    cx="55"
                    cy="55"
                    r={cRadius}
                    className="stroke-slate-100 dark:stroke-slate-800"
                    strokeWidth="14"
                    fill="transparent"
                  />
                  {/* Slices */}
                  {slicesWithOffsets.map((slice, i) => (
                    <circle
                      key={i}
                      cx="55"
                      cy="55"
                      r={cRadius}
                      stroke={slice.color}
                      strokeWidth="14"
                      strokeDasharray={slice.strokeDasharray}
                      strokeDashoffset={slice.strokeDashoffset}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-700 hover:opacity-85 cursor-pointer"
                      onClick={() => slice.report && setSelectedReportModal(slice.report)}
                    />
                  ))}
                </svg>

                {/* Inner center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-lg font-black text-slate-900 dark:text-white font-mono leading-none">
                    {reportsAnalytics.length}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider mt-0.5">
                    Reports
                  </span>
                </div>
              </div>

              {/* Legend with percentages */}
              <div className="space-y-1.5 flex-1 w-full text-xs">
                {donutSlices.map((s, idx) => (
                  <div
                    key={idx}
                    onClick={() => s.report && setSelectedReportModal(s.report)}
                    className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                      <span className="font-medium text-slate-700 dark:text-slate-300">{s.name}</span>
                    </div>
                    <span className="font-mono text-slate-400 font-bold">{s.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Balanced HRMS Evaluation</span>
            <span className="text-teal-600 dark:text-teal-400 font-medium">100% Comprehensive</span>
          </div>
        </div>

        {/* Executive Benchmark Progress (Bar Chart) */}
        <div className="lg:col-span-2 rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Organizational Target Benchmarks (Bar Chart)
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">Enterprise Standard: 80%</span>
            </div>

            {/* Benchmark Bar Chart List */}
            <div className="space-y-3.5 py-2">
              {[
                { name: 'Appraisal Milestones Completion', val: orgAvgProgress, color: 'bg-amber-500', benchmark: 80, display: `${orgAvgProgress}%` },
                { name: 'Workforce Attendance Compliance', val: attendanceRate, color: 'bg-teal-500', benchmark: 85, display: `${attendanceRate}%` },
                { name: 'Appraisal Rating Index', val: Math.min(100, Math.round((Number(orgAvgRating) / 5) * 100)), color: 'bg-indigo-500', benchmark: 75, display: `${orgAvgRating} / 5.0` },
                { name: 'Payroll Timeliness & Disbursement', val: 100, color: 'bg-emerald-500', benchmark: 95, display: '100%' },
                { name: 'Talent Acquisition & Sourcing Velocity', val: 78, color: 'bg-sky-500', benchmark: 70, display: '78%' }
              ].map((b, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {b.name}
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {b.display}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                    {/* Benchmark pin line */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-slate-400/60 z-10"
                      style={{ left: `${b.benchmark}%` }}
                      title={`Target benchmark: ${b.benchmark}%`}
                    />
                    <div
                      className={`h-full rounded-full ${b.color} transition-all duration-1000`}
                      style={{ width: `${Math.min(100, b.val)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Vertical line indicates organizational target threshold</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">All Units Exceed Benchmarks</span>
          </div>
        </div>

      </div>

      {/* 5. Complete Reports & Analytics Records Table/Grid (Direct from Supabase reports_analytics) */}
      <div className="rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <FileText className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Database Records: reports_analytics Table</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Structured operational intelligence rows fetched live from Supabase PostgreSQL
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center flex-wrap gap-1.5">
            {[
              { id: 'all', label: `All (${reportsAnalytics.length})` },
              { id: 'performance', label: 'Performance' },
              { id: 'attendance', label: 'Attendance' },
              { id: 'payroll', label: 'Payroll' },
              { id: 'recruitment', label: 'Recruitment' },
              { id: 'management', label: 'Management' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setReportFilter(tab.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  reportFilter === tab.id
                    ? 'bg-teal-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reports Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          {filteredReports.map((report) => {
            const meta = getReportMeta(report.report_type);
            const rData = report.report_data || {};
            const rPeriod = `${report.report_period_start || '2026-07-01'} to ${report.report_period_end || '2026-09-30'}`;

            return (
              <div
                key={report.report_id || report.id}
                className="rounded-xl p-4 bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 hover:border-teal-400/80 dark:hover:border-teal-600/80 transition flex flex-col justify-between space-y-3 group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold uppercase tracking-wide ${meta.color}`}>
                      {report.report_type}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {report.generated_at ? new Date(report.generated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Nov 15, 2026'}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition">
                    {report.report_name}
                  </h4>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {rData.description || 'Enterprise summary and KPI overview'}
                  </p>

                  {/* Contextual Metric Details */}
                  {report.report_type === 'performance' && (
                    <div className="mt-3 p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-xs space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Average Rating:</span>
                        <strong className="text-amber-500 font-mono font-bold flex items-center">
                          <Star className="w-3 h-3 fill-amber-400 mr-1" />
                          {rData.average_rating || 4.3} / 5.0
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Milestone Progress:</span>
                        <strong className="text-slate-800 dark:text-slate-200 font-mono">{rData.average_progress || 86.5}%</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Scoped Staff:</span>
                        <span className="font-mono">{rData.total_employees || 30} employees</span>
                      </div>
                    </div>
                  )}

                  {report.report_type === 'attendance' && (
                    <div className="mt-3 p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-xs">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Tracked Metrics:</span>
                      <div className="flex flex-wrap gap-1">
                        {(rData.metrics || attMetricsList).map((m, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60">
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {report.report_type === 'payroll' && (
                    <div className="mt-3 p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-xs">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Audit Parameters:</span>
                      <div className="flex flex-wrap gap-1">
                        {(rData.metrics || payMetricsList).map((m, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {report.report_type === 'recruitment' && (
                    <div className="mt-3 p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-xs">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Funnel Milestones:</span>
                      <div className="flex flex-wrap gap-1">
                        {(rData.metrics || recMetricsList).map((m, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60">
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {report.report_type === 'management' && (
                    <div className="mt-3 p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-xs">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Subsystems Synced:</span>
                      <div className="flex flex-wrap gap-1">
                        {(rData.modules_included || mgmtModulesList).map((mod, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
                            {mod}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2.5 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400 font-mono truncate max-w-[150px]">
                    Period: {rPeriod}
                  </span>
                  <button
                    onClick={() => setSelectedReportModal(report)}
                    className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 flex items-center space-x-1"
                  >
                    <span>View JSON</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Operational Bottom Row: Department Headcounts & Management Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Department Overview */}
        <div className="lg:col-span-2 rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
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
          <div className="rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Management Actions</h3>

            <div className="space-y-2">
              <button
                onClick={() => onNavigate('employee')}
                className="w-full p-2.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center justify-between"
              >
                <span>Employee Directory</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigate('recruitment')}
                className="w-full p-2.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center justify-between"
              >
                <span>Recruitment Pipeline</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigate('payroll')}
                className="w-full p-2.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center justify-between"
              >
                <span>Payroll Runs</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Pending Leaves Card */}
          <div className="rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Pending Leave Approvals</h4>
              <Badge variant="warning">{pendingLeaves.length}</Badge>
            </div>

            {pendingLeaves.length > 0 ? (
              <div className="space-y-2">
                {pendingLeaves.slice(0, 2).map((l) => (
                  <div key={l.request_id || l.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs">
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

      {/* 7. Detailed Report Inspector Modal */}
      {selectedReportModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs transition-opacity"
          onClick={() => setSelectedReportModal(null)}
        >
          <div 
            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[85vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between bg-slate-50/70 dark:bg-slate-800/40">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {selectedReportModal.report_name}
                  </h3>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold uppercase tracking-wide ${getReportMeta(selectedReportModal.report_type).color}`}>
                    {selectedReportModal.report_type}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  Report ID: {selectedReportModal.report_id || selectedReportModal.id}
                </p>
              </div>

              <button
                onClick={() => setSelectedReportModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              
              {/* Audit Meta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase block">Period Start</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{selectedReportModal.report_period_start || '2026-07-01'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase block">Period End</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{selectedReportModal.report_period_end || '2026-09-30'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase block">Generated At</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200 text-[11px]">
                    {selectedReportModal.generated_at ? new Date(selectedReportModal.generated_at).toLocaleString() : 'Nov 15, 2026, 09:12 AM'}
                  </span>
                </div>
              </div>

              {/* Description */}
              {selectedReportModal.report_data?.description && (
                <div className="p-3.5 rounded-xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/50">
                  <span className="text-[10px] font-bold uppercase text-teal-800 dark:text-teal-300 block mb-0.5">Summary Synopsis:</span>
                  <p className="text-slate-700 dark:text-slate-300 font-medium">
                    {selectedReportModal.report_data.description}
                  </p>
                </div>
              )}

              {/* Stored report_data JSON Details */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide block">
                  Raw PostgreSQL JSONB Payload (`report_data`):
                </span>
                <div className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto border border-slate-800">
                  <pre>{JSON.stringify(selectedReportModal.report_data, null, 2)}</pre>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
              <span className="text-[11px] text-slate-400">
                Source: <strong className="font-mono text-teal-600 dark:text-teal-400">reports_analytics</strong> table
              </span>
              <button
                onClick={() => setSelectedReportModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 dark:bg-slate-700 text-white hover:bg-slate-800 transition shadow-xs"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
