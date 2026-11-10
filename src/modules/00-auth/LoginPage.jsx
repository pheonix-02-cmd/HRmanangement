import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  User, 
  Building2, 
  AlertCircle,
  Database,
  CheckCircle2,
  HelpCircle,
  Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPage = () => {
  const { login, checkLiveSupabaseCount } = useAuth();
  const [activePortal, setActivePortal] = useState('employee'); // 'employee' | 'management'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState({ online: false, count: 0 });

  useEffect(() => {
    const fetchStatus = async () => {
      const res = await checkLiveSupabaseCount();
      setDbStatus(res);
    };
    fetchStatus();
  }, []);

  // Quick accounts filtered strictly by portal role
  const employeeAccounts = [
    { name: 'Vikram Singh', id: 'EMP-1004', email: 'vikram.singh@nexushr.com', role: 'Employee', dept: 'Engineering' },
    { name: 'Arjun Mehta', id: 'EMP-1006', email: 'arjun.mehta@nexushr.com', role: 'Employee', dept: 'Engineering' },
  ];

  const managementAccounts = [
    { name: 'Ananya Sharma', id: 'EMP-1001', email: 'ananya.sharma@nexushr.com', role: 'HR Manager', dept: 'Human Resources' },
    { name: 'Rohit Verma', id: 'EMP-1002', email: 'rohit.verma@nexushr.com', role: 'Super Admin', dept: 'Engineering' },
    { name: 'Priya Nair', id: 'EMP-1003', email: 'priya.nair@nexushr.com', role: 'Dept Manager', dept: 'Product & Design' },
    { name: 'Tanvi Kapoor', id: 'EMP-1005', email: 'tanvi.kapoor@nexushr.com', role: 'Recruiter', dept: 'Human Resources' },
  ];

  const handlePortalSwitch = (portal) => {
    setActivePortal(portal);
    setErrorMessage('');
    setIdentifier('');
    setPassword('');
  };

  const handleQuickFill = (acc) => {
    setIdentifier(acc.email);
    setPassword('NexusHR@2026');
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    const result = await login(identifier, password, activePortal);
    if (!result.success) {
      setErrorMessage(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-xl bg-teal-600 flex items-center justify-center text-white font-bold text-xl mx-auto shadow-sm">
          N
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Nexus<span className="text-teal-600 dark:text-teal-400">HR</span> Portal
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Enterprise Human Resource Management System
        </p>
      </div>

      {/* Main Container */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        
        {/* Portal Switcher Tabs */}
        <div className="bg-slate-200/80 dark:bg-slate-800/80 p-1 rounded-xl grid grid-cols-2 gap-1 mb-4">
          <button
            type="button"
            onClick={() => handlePortalSwitch('employee')}
            className={`py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center space-x-2 transition ${
              activePortal === 'employee'
                ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Employee Portal</span>
          </button>
          <button
            type="button"
            onClick={() => handlePortalSwitch('management')}
            className={`py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center space-x-2 transition ${
              activePortal === 'management'
                ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Management Portal</span>
          </button>
        </div>

        {/* Portal Scope Alert */}
        <div className="mb-4 px-3 py-2 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/60 text-[11px] text-teal-800 dark:text-teal-300 flex items-center justify-between">
          <span>
            {activePortal === 'employee' 
              ? 'Employee Portal: Restricted exclusively to standard employees. Managers & Admins are blocked.'
              : 'Management Portal: For HR Managers, Department Heads, and System Admins.'}
          </span>
          <span className="font-semibold uppercase tracking-wider text-[9px] bg-teal-100 dark:bg-teal-900/60 px-1.5 py-0.5 rounded">
            {activePortal}
          </span>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-slate-900 py-7 px-6 sm:px-8 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start space-x-2 text-xs text-rose-700 dark:text-rose-400">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-tight">{errorMessage}</span>
              </div>
            )}

            {/* Email / Employee ID */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Corporate Email or Employee ID
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder={activePortal === 'employee' ? 'vikram.singh@nexushr.com or EMP-1004' : 'ananya.sharma@nexushr.com or EMP-1001'}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  Default: NexusHR@2026
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-9 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition shadow-xs disabled:opacity-50"
              >
                {loading ? 'Verifying Credentials...' : `Sign In to ${activePortal === 'employee' ? 'Employee Portal' : 'Management Portal'}`}
              </button>
            </div>
          </form>

          {/* Quick autofill accounts matching the selected section */}
          <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                {activePortal === 'employee' ? 'Employee Accounts' : 'Management Accounts'}
              </span>
              <span className="text-[10px] text-slate-400">Click to autofill</span>
            </div>
            
            <div className="space-y-1.5">
              {(activePortal === 'employee' ? employeeAccounts : managementAccounts).map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleQuickFill(acc)}
                  className="w-full px-3 py-1.5 text-left rounded-lg text-xs border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition flex items-center justify-between group"
                >
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{acc.name}</span>
                    <span className="text-[10px] text-slate-400 ml-1.5">({acc.role})</span>
                  </div>
                  <span className="text-[10px] font-mono text-teal-600 dark:text-teal-400 group-hover:underline">
                    {acc.id} →
                  </span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Database Status Footer */}
        <div className="mt-4 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <Database className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>Supabase API:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {dbStatus.online ? 'Connected' : 'Active'}
            </span>
            <span className="text-slate-400">({dbStatus.count} rows in employee_records)</span>
          </div>
          <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400">
            RLS Active
          </span>
        </div>

      </div>

    </div>
  );
};
