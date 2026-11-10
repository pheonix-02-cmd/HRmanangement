import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowRight, 
  AlertCircle,
  CheckCircle2,
  UserCheck,
  Building2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPage = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Demo user credentials from database for quick testing
  const demoUsers = [
    { name: 'Ananya Sharma', role: 'HR Manager', email: 'ananya.sharma@nexushr.com', empCode: 'NX-001' },
    { name: 'Rohit Verma', role: 'Super Admin', email: 'rohit.verma@nexushr.com', empCode: 'NX-002' },
    { name: 'Priya Nair', role: 'Dept Manager', email: 'priya.nair@nexushr.com', empCode: 'NX-003' },
    { name: 'Vikram Singh', role: 'Employee', email: 'vikram.singh@nexushr.com', empCode: 'NX-004' },
    { name: 'Tanvi Kapoor', role: 'Recruiter', email: 'tanvi.kapoor@nexushr.com', empCode: 'NX-005' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    const result = await login(email, password);
    if (!result.success) {
      setErrorMessage(result.message);
    }
    setLoading(false);
  };

  const handleQuickLogin = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('NexusHR@2026');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-200">
      
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-xl bg-teal-600 flex items-center justify-center text-white font-bold text-xl mx-auto shadow-sm">
          N
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Nexus<span className="text-teal-600 dark:text-teal-400">HR</span> Portal
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Sign in to access your Human Resource workspace
        </p>
      </div>

      {/* Main Login Card */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 sm:px-8 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start space-x-2 text-xs text-rose-700 dark:text-rose-400">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-tight">{errorMessage}</span>
              </div>
            )}

            {/* Email / Username */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Corporate Email or Employee Code
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. ananya.sharma@nexushr.com or NX-001"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </div>
          </form>

          {/* Quick Demo Logins Section */}
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-2 text-center">
              Quick Role Test Logins (Click to autofill)
            </span>
            <div className="grid grid-cols-1 gap-1.5">
              {demoUsers.map((u) => (
                <button
                  key={u.email}
                  type="button"
                  onClick={() => handleQuickLogin(u.email)}
                  className="w-full px-3 py-1.5 text-left rounded-lg text-xs border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition flex items-center justify-between group"
                >
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{u.name}</span>
                    <span className="text-[10px] text-slate-400 ml-1.5">({u.role})</span>
                  </div>
                  <span className="text-[10px] font-mono text-teal-600 dark:text-teal-400 group-hover:underline">
                    {u.empCode} →
                  </span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Security badge footer */}
        <div className="mt-4 text-center text-xs text-slate-400 flex items-center justify-center space-x-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Protected with Session Token & Brute-Force Rate Limiting</span>
        </div>
      </div>

    </div>
  );
};
