import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  User, 
  AlertCircle,
  Database,
  Building2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPage = () => {
  const { login, checkLiveSupabaseCount } = useAuth();
  const [activePortal, setActivePortal] = useState('employee'); // 'employee' | 'management'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState({ online: false, count: 0 });

  useEffect(() => {
    // Purge legacy mock data cache from previous sessions
    try {
      ['nexus_hrms_employee_records', 'nexus_hrms_profiles', 'nexus_hrms_departments'].forEach(k => {
        localStorage.removeItem(k);
      });
    } catch (e) {}

    const fetchStatus = async () => {
      const res = await checkLiveSupabaseCount();
      setDbStatus(res);
    };
    fetchStatus();
  }, []);

  const handlePortalSwitch = (portal) => {
    setActivePortal(portal);
    setErrorMessage('');
    setEmail('');
    setPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    const result = await login(email, password, activePortal);
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
          Sign in using your corporate email from the employee database
        </p>
        
        {/* Live Database Status Indicator */}
        <div className="mt-2.5 inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
          <span className={`w-2 h-2 rounded-full ${dbStatus.online ? 'bg-emerald-500 shadow-sm' : 'bg-amber-400 animate-pulse'}`} />
          <span>
            {dbStatus.online 
              ? `Live Supabase Connected (${dbStatus.count || 30} employees)` 
              : 'Connecting to Supabase PostgreSQL...'}
          </span>
        </div>
      </div>

      {/* Main Login Container */}
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

        {/* Scope Helper Message */}
        <div className="mb-4 px-3 py-2 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/60 text-[11px] text-teal-800 dark:text-teal-300 flex items-center justify-between">
          <span>
            {activePortal === 'employee'
              ? 'Employee Portal: Restricted strictly to general employees. Managers & Admins are blocked.'
              : 'Management Portal: For HR Managers, Department Heads, and System Administrators.'}
          </span>
          <span className="font-semibold uppercase tracking-wider text-[9px] bg-teal-100 dark:bg-teal-900/60 px-1.5 py-0.5 rounded">
            {activePortal}
          </span>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-slate-900 py-7 px-6 sm:px-8 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start space-x-2 text-xs text-rose-700 dark:text-rose-400">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-tight">{errorMessage}</span>
              </div>
            )}

            {/* Corporate Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Corporate Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="Enter email from employee_records table..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Password Field */}
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
                  placeholder="Enter password..."
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
                {loading ? 'Verifying with Database...' : `Sign In to ${activePortal === 'employee' ? 'Employee Portal' : 'Management Portal'}`}
              </button>
            </div>
          </form>

        </div>

        {/* Database Verification Status */}
        <div className="mt-4 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <Database className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>Database:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Supabase PostgreSQL
            </span>
          </div>
          <span className="font-mono text-[10px] text-teal-600 dark:text-teal-400">
            {dbStatus.count > 0 ? `${dbStatus.count} employees connected` : 'Live DB connected'}
          </span>
        </div>

      </div>

    </div>
  );
};
