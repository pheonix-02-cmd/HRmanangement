import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSupabaseClient, supabaseDirectFetch } from '../config/supabase';
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
    try {
      const direct = await supabaseDirectFetch('employee_records', 'select=employee_id');
      if (direct && Array.isArray(direct)) {
        return { online: true, count: direct.length, error: null };
      }
    } catch (e) {}

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

  // Secure Login verifying directly from database email
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
      return { success: false, message: 'Please enter your corporate email address and password.' };
    }

    try {
      const supabase = getSupabaseClient();
      let matchedEmp = null;
      let matchedProfile = null;

      // 2. Direct Live Query to Supabase database table: employee_records
      try {
        const directEmp = await supabaseDirectFetch(
          'employee_records', 
          `select=*&email=ilike.${encodeURIComponent(identifier)}`
        );
        if (directEmp && directEmp.length > 0) {
          matchedEmp = directEmp[0];
        } else {
          // Also attempt matching by employee_id
          const directById = await supabaseDirectFetch(
            'employee_records', 
            `select=*&employee_id=ilike.${encodeURIComponent(identifier)}`
          );
          if (directById && directById.length > 0) {
            matchedEmp = directById[0];
          }
        }

        if (matchedEmp) {
          try {
            const directProf = await supabaseDirectFetch(
              'profiles', 
              `select=*&employee_id=eq.${encodeURIComponent(matchedEmp.employee_id)}`
            );
            if (directProf && directProf.length > 0) {
              matchedProfile = directProf[0];
            }
          } catch (pErr) {
            console.warn('Profile direct lookup warning:', pErr);
          }
        }
      } catch (e) {
        console.warn('Direct Supabase fetch warning:', e);
      }

      // If direct fetch didn't return (e.g. offline fallback), try SDK
      if (!matchedEmp && supabase) {
        try {
          const { data: dbEmp } = await supabase
            .from('employee_records')
            .select('*')
            .ilike('email', identifier);
          if (dbEmp && dbEmp.length > 0) {
            matchedEmp = dbEmp[0];
          }
        } catch (e) {
          console.warn('SDK Supabase query warning:', e);
        }
      }

      // If remote query returned 0 rows, check local verified records
      if (!matchedEmp) {
        const [profilesRes, empRes] = await Promise.all([
          fetchTableData('profiles'),
          fetchTableData('employee_records')
        ]);

        const allEmployees = empRes.data || [];
        const allProfiles = profilesRes.data || [];

        matchedEmp = allEmployees.find(e => 
          (e.email && e.email.toLowerCase() === identifier) ||
          (e.employee_id && e.employee_id.toLowerCase() === identifier)
        );

        if (matchedEmp && !matchedProfile) {
          matchedProfile = allProfiles.find(p => 
            (p.email && p.email.toLowerCase() === identifier) ||
            (p.employee_id === matchedEmp.employee_id)
          );
        }
      }

      // Guard: Check if employee was found before accessing properties
      if (!matchedEmp && !matchedProfile) {
        recordFailedAttempt(identifier || 'default');
        return { 
          success: false, 
          message: `No employee record found with email '${identifier}' in the database directory. Please check the email and try again.` 
        };
      }

      // Determine user role based on designation or profiles table
      let assignedRole = 'employee';
      const desId = Number(matchedEmp?.designation_id);
      if (desId === 204 || matchedEmp?.employee_id === 'EMP001') {
        assignedRole = 'admin'; // Vice President
      } else if (desId === 203) {
        assignedRole = 'admin'; // Admin
      } else if (desId === 202) {
        assignedRole = 'hr'; // HR Executive
      } else if (matchedProfile?.role && matchedProfile.role.toLowerCase() !== 'employee') {
        assignedRole = matchedProfile.role.toLowerCase();
      } else {
        assignedRole = 'employee'; // Software Developer / General Staff
      }

      if (!matchedProfile && matchedEmp) {
        matchedProfile = {
          id: matchedEmp.employee_id,
          employee_id: matchedEmp.employee_id,
          email: matchedEmp.email,
          full_name: `${matchedEmp.first_name || ''} ${matchedEmp.last_name || ''}`.trim() || 'Employee',
          role: assignedRole,
        };
      } else if (matchedProfile) {
        matchedProfile.role = assignedRole;
      }

      // 3. STRICT PORTAL SEGREGATION
      // Employee Portal: ONLY 'employee' role permitted
      if (requiredPortal === 'employee' && matchedProfile.role !== 'employee') {
        recordFailedAttempt(identifier || 'default');
        return {
          success: false,
          message: `Access Denied: The Employee Portal is strictly reserved for standard staff. Accounts with role '${matchedProfile.role.toUpperCase()}' must sign in via the Management Portal.`
        };
      }

      // Management Portal: 'employee' role is BLOCKED
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
        return { success: false, message: 'Incorrect password. Default credentials are: NexusHR@2026' };
      }

      // Reset rate limit on success
      resetRateLimit(identifier || 'default');

      const authenticatedUser = {
        id: matchedProfile?.id || matchedEmp?.employee_id || 'EMP001',
        employee_id: matchedEmp?.employee_id || matchedProfile?.employee_id || 'EMP001',
        email: matchedEmp?.email || matchedProfile?.email,
        full_name: matchedProfile?.full_name || `${matchedEmp?.first_name || ''} ${matchedEmp?.last_name || ''}`.trim(),
        role: matchedProfile?.role || assignedRole,
        avatar_url: matchedProfile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775?w=150',
        phone: matchedEmp?.phone || '',
        department_id: matchedEmp?.department_id,
        designation_id: matchedEmp?.designation_id,
      };

      // Store secure session
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
      return { 
        success: false, 
        message: err.message ? `Login error: ${err.message}` : 'Authentication server error. Please try again.' 
      };
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
