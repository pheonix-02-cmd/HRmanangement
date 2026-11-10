import { getSupabaseClient } from '../config/supabase';
import * as initialData from '../mock/seedData';

const STORAGE_PREFIX = 'nexus_hrms_';

const TABLE_SEEDS = {
  departments: initialData.initialDepartments,
  designations: initialData.initialDesignations,
  profiles: initialData.initialProfiles,
  employee_records: initialData.initialEmployeeRecords,
  job_postings: initialData.initialJobPostings,
  candidates: initialData.initialCandidates,
  applications: initialData.initialApplications,
  interviews: initialData.initialInterviews,
  offer_letters: initialData.initialOfferLetters,
  onboarding: initialData.initialOnboarding,
  attendance: initialData.initialAttendance,
  leave_balance: initialData.initialLeaveBalances,
  leave_requests: initialData.initialLeaveRequests,
  salary_structures: initialData.initialSalaryStructures,
  deduction_rules: initialData.initialDeductionRules,
  payroll: initialData.initialPayroll,
  payroll_deductions: initialData.initialPayrollDeductions,
  payslips: initialData.initialPayslips,
  grievances: initialData.initialGrievances,
  grievance_communications: initialData.initialGrievanceCommunications,
  grievance_resolutions: initialData.initialGrievanceResolutions,
  messages_notifications: initialData.initialMessagesNotifications,
};

export const fetchTableData = async (tableName) => {
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const { data, error } = await supabase.from(tableName).select('*');
      if (!error && data && data.length > 0) {
        return { data, error: null };
      }
    } catch (err) {
      // silent fallback
    }
  }

  // Fallback to local storage or initial seed
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(STORAGE_PREFIX + tableName);
    if (cached) {
      try {
        return { data: JSON.parse(cached), error: null };
      } catch (e) {
        console.error(e);
      }
    }
    const seed = TABLE_SEEDS[tableName] || [];
    localStorage.setItem(STORAGE_PREFIX + tableName, JSON.stringify(seed));
    return { data: seed, error: null };
  }

  return { data: TABLE_SEEDS[tableName] || [], error: null };
};

export const insertTableRow = async (tableName, newRow) => {
  const supabase = getSupabaseClient();
  let savedRow = newRow;

  if (supabase) {
    try {
      const { data, error } = await supabase.from(tableName).insert([newRow]).select();
      if (!error && data && data.length > 0) {
        savedRow = data[0];
      }
    } catch (err) {
      // silent fallback
    }
  }

  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(STORAGE_PREFIX + tableName);
    const list = cached ? JSON.parse(cached) : (TABLE_SEEDS[tableName] || []);
    const rowToSave = { id: `${tableName.slice(0, 3)}-${Date.now()}`, ...savedRow };
    const updated = [rowToSave, ...list];
    localStorage.setItem(STORAGE_PREFIX + tableName, JSON.stringify(updated));
    return rowToSave;
  }

  return newRow;
};

export const updateTableRow = async (tableName, id, updates) => {
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      await supabase.from(tableName).update(updates).eq('id', id);
    } catch (err) {
      // silent fallback
    }
  }

  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(STORAGE_PREFIX + tableName);
    const list = cached ? JSON.parse(cached) : (TABLE_SEEDS[tableName] || []);
    const updated = list.map(item => item.id === id ? { ...item, ...updates } : item);
    localStorage.setItem(STORAGE_PREFIX + tableName, JSON.stringify(updated));
    return updated.find(item => item.id === id);
  }

  return { id, ...updates };
};

export const deleteTableRow = async (tableName, id) => {
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      await supabase.from(tableName).delete().eq('id', id);
    } catch (err) {
      // silent fallback
    }
  }

  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(STORAGE_PREFIX + tableName);
    const list = cached ? JSON.parse(cached) : (TABLE_SEEDS[tableName] || []);
    const updated = list.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_PREFIX + tableName, JSON.stringify(updated));
    return true;
  }

  return true;
};
