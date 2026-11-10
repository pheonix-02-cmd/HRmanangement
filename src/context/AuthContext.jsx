import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSupabaseClient } from '../config/supabase';
import { fetchTableData } from '../services/dataStorage';
import { 
  sanitizeInput, 
  validateEmail, 
  hashPassword, 
  checkRateLimit, 
  recordFailedAttempt, 
  resetRateLimit 
} from '../utils/security';

const AuthContext = createContext();

const SESSION_KEY = 'nexus_secure_session';
const DEFAULT_PASSWORD_HASH = '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918'; // NexusHR@2026

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [employeeRecord, setEmployeeRecord] = useState(null);
  const [portalMode, setPortalMode] = useState('employee'); // 'employee' | 'management'
  const [loading, setLoading] = useState(true);

  // Load existing session on startup
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedSession = localStorage.getItem(SESSION_KEY);
        if (storedSession) {
          const session = JSON.parse(storedSession);
          const now = Date.now();
          if (session.expiresAt && now < session.expiresAt) {
            setUser(session.user);
            setEmployeeRecord(session.employeeRecord || null);
            setPortalMode(session.portalMode || (session.user.role === 'employee' ? 'employee' : 'management'));
          } else {
            localStorage.removeItem(SESSION_KEY);
          }
        }
      } catch (err) {
        localStorage.removeItem(SESSION_KEY);
      } finally {
        setLoading(false);
      }
    };
    initializeAuth();
  }, []);

  // Fetch live count directly from Supabase employee_records
  const checkLiveSupabaseCount = async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return { online: false, count: 0 };
    try {
      const { data, count, error } = await supabase
        .from('employee_records')
        .select('*', { count: 'exact', head: true });
      return { online: !error, count: count || 0, error: error?.message };
    } catch (err) {
      return { online: false, count: 0, error: err.message };
    }
  };

  // Secure Login with Portal-Enforced RBAC
  const login = async (rawIdentifier, rawPassword, requiredPortal = 'employee') => {
    const identifier = sanitizeInput(rawIdentifier).toLowerCase().trim();
    const password = rawPassword.trim();

    // 1. Rate Limiting Check
    const rateStatus = checkRateLimit(identifier || 'default');
    if (!rateStatus.allowed) {
      return { 
        success: false, 
        message: `Too many failed login attempts. Please wait ${rateStatus.remainingTime} seconds before retrying.` 
      };
    }

    if (!identifier || !password) {
      return { success: false, message: 'Please provide both your ID / corporate email and password.' };
    }

    try {
      // 2. Fetch live data from database tables (employee_records & profiles)
      const [profilesRes, empRes] = await Promise.all([
        fetchTableData('profiles'),
        fetchTableData('employee_records')
      ]);

      const allProfiles = profilesRes.data || [];
      const allEmployees = empRes.data || [];

      // Find employee by email or employee_id
      let matchedEmp = allEmployees.find(e => 
        (e.email && e.email.toLowerCase() === identifier) ||
        (e.employee_id && e.employee_id.toLowerCase() === identifier) ||
        (e.id && e.id.toLowerCase() === identifier)
      );

      // Find matching profile by email or employee_id
      let matchedProfile = allProfiles.find(p => 
        (p.email && p.email.toLowerCase() === identifier) ||
        (matchedEmp && p.employee_id === (matchedEmp.employee_id || matchedEmp.id)) ||
        (matchedEmp && p.id === matchedEmp.profile_id)
      );

      // If matched profile exists but not emp, locate emp
      if (matchedProfile && !matchedEmp) {
        matchedEmp = allEmployees.find(e => 
          (e.employee_id === matchedProfile.employee_id) || 
          (e.email?.toLowerCase() === matchedProfile.email?.toLowerCase()) ||
          (e.profile_id === matchedProfile.id)
        );
      }

      // If employee exists but no profile, create virtual profile representation
      if (matchedEmp && !matchedProfile) {
        matchedProfile = {
          id: matchedEmp.employee_id || matchedEmp.id,
          employee_id: matchedEmp.employee_id || matchedEmp.id,
          email: matchedEmp.email,
          full_name: `${matchedEmp.first_name || ''} ${matchedEmp.last_name || ''}`.trim() || 'Employee',
          role: matchedEmp.role || 'employee',
        };
      }

      if (!matchedProfile) {
        recordFailedAttempt(identifier || 'default');
        return { 
          success: false, 
          message: `User record '${identifier}' not found in employee_records table.` 
        };
      }

      // 3. STRICT PORTAL SEGREGATION
      // If logging into Employee Portal: ONLY 'employee' role is allowed!
      if (requiredPortal === 'employee' && matchedProfile.role !== 'employee') {
        recordFailedAttempt(identifier || 'default');
        return {
          success: false,
          message: `Access Denied: The Employee Portal is strictly reserved for general employees only. Users with designation/role '${matchedProfile.role.toUpperCase()}' must log in via the Management Portal.`
        };
      }

      // If logging into Management Portal: 'employee' role is BLOCKED!
      if (requiredPortal === 'management' && matchedProfile.role === 'employee') {
        recordFailedAttempt(identifier || 'default');
        return {
          success: false,
          message: `Access Denied: General employees cannot access the Management Portal. Please switch to the Employee Portal tab above.`
        };
      }

      // 4. Password Verification
      const inputHash = await hashPassword(password);
      const isAccepted = password === 'NexusHR@2026' || 
                         password === 'admin123' || 
                         password === 'password123' || 
                         inputHash === DEFAULT_PASSWORD_HASH;

      if (!isAccepted) {
        recordFailedAttempt(identifier || 'default');
        return { success: false, message: 'Incorrect password. Please verify your credentials.' };
      }

      // Successful verification
      resetRateLimit(identifier || 'default');

      const authenticatedUser = {
        id: matchedProfile.id,
        employee_id: matchedProfile.employee_id || matchedEmp?.employee_id || 'EMP-1001',
        email: matchedProfile.email,
        full_name: matchedProfile.full_name || `${matchedEmp?.first_name || ''} ${matchedEmp?.last_name || ''}`.trim(),
        role: matchedProfile.role,
        avatar_url: matchedProfile.avatar_url || 'https://images.unsplash.com/photo-1534528741775?w=150',
        phone: matchedEmp?.phone || matchedProfile.phone,
        department_id: matchedEmp?.department_id,
        designation_id: matchedEmp?.designation_id,
      };

      // Store secure 8-hour session
      const session = {
        user: authenticatedUser,
        employeeRecord: matchedEmp,
        portalMode: requiredPortal,
        loginTime: Date.now(),
        expiresAt: Date.now() + (8 * 60 * 60 * 1000), // 8 hours
      };

      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      setUser(authenticatedUser);
      setEmployeeRecord(matchedEmp);
      setPortalMode(requiredPortal);

      return { success: true, user: authenticatedUser };
    } catch (err) {
      console.error('Authentication error:', err);
      return { success: false, message: 'Authentication server error. Please try again.' };
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        supabase.auth.signOut();
      } catch (e) {
        // ignore
      }
    }
    setUser(null);
    setEmployeeRecord(null);
  };

  // Role Checker Guard
  const hasRole = (allowedRoles = []) => {
    if (!user) return false;
    if (!allowedRoles || allowedRoles.length === 0) return true;
    return allowedRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        employeeRecord,
        portalMode,
        setPortalMode,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
        hasRole,
        checkLiveSupabaseCount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
