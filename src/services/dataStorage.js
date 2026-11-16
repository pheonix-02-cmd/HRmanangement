import { getSupabaseClient, supabaseDirectFetch } from '../config/supabase';
import * as initialData from '../mock/seedData';

const STORAGE_PREFIX = 'nexus_hrms_v4_';

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

export const getPrimaryKeyColumn = (tableName) => {
  const map = {
    employee_records: 'employee_id',
    departments: 'department_id',
    designations: 'designation_id',
    job_postings: 'job_id',
    candidates: 'candidate_id',
    applications: 'application_id',
    interviews: 'interview_id',
    offer_letters: 'offer_id',
    onboarding: 'onboarding_id',
    leave_balance: 'balance_id',
    leave_requests: 'request_id',
    attendance: 'attendance_id',
    payroll: 'payroll_id',
    payslips: 'payslip_id',
    grievances: 'grievance_id',
    profiles: 'id'
  };
  return map[tableName] || 'id';
};

export const fetchTableData = async (tableName, customQuery = '') => {
  // 1. First attempt: Direct HTTP query to Supabase PostgREST (bypasses all SDK & client caching)
  try {
    let q = customQuery;
    if (!q) {
      if (tableName === 'attendance') q = 'select=*&order=attendance_date.desc&limit=1000';
      else if (tableName === 'payroll') q = 'select=*&order=pay_period.desc';
      else if (tableName === 'payslips') q = 'select=*&order=payslip_id.desc';
      else q = 'select=*';
    }
    const directData = await supabaseDirectFetch(tableName, q);
    if (directData && Array.isArray(directData) && directData.length > 0) {
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_PREFIX + tableName, JSON.stringify(directData));
        } catch (e) {}
      }
      return { data: directData, error: null, source: 'supabase_direct' };
    }
  } catch (err) {
    // fallback to SDK
  }

  // 2. Second attempt: Supabase JS SDK client
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from(tableName).select('*');
      if (!error && Array.isArray(data) && data.length > 0) {
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(STORAGE_PREFIX + tableName, JSON.stringify(data));
          } catch (e) {}
        }
        return { data, error: null, source: 'supabase' };
      }
    } catch (err) {
      // silent fallback
    }
  }

  // 3. Fallback to local storage or initial seed
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(STORAGE_PREFIX + tableName);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return { data: parsed, error: null, source: 'local_storage' };
        }
      } catch (e) {
        console.error(e);
      }
    }
    const seed = TABLE_SEEDS[tableName] || [];
    localStorage.setItem(STORAGE_PREFIX + tableName, JSON.stringify(seed));
    return { data: seed, error: null, source: 'seed' };
  }

  return { data: TABLE_SEEDS[tableName] || [], error: null, source: 'seed' };
};

export const insertTableRow = async (tableName, newRow) => {
  const supabase = getSupabaseClient();
  const pkCol = getPrimaryKeyColumn(tableName);
  let rowToInsert = { ...newRow };

  // Sanitize attendance rows for PostgreSQL schema
  if (tableName === 'attendance') {
    if (rowToInsert.attendance_id && String(rowToInsert.attendance_id).startsWith('att-')) {
      delete rowToInsert.attendance_id; // let PostgreSQL generate valid UUID
    }
    if (!rowToInsert.attendance_date) {
      rowToInsert.attendance_date = new Date().toISOString().split('T')[0];
    }
  }

  let savedRow = rowToInsert;

  if (supabase) {
    try {
      const { data, error } = await supabase.from(tableName).insert([rowToInsert]).select();
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
    const rowToSave = savedRow[pkCol] ? savedRow : { [pkCol]: `${tableName.slice(0, 3)}-${Date.now()}`, ...savedRow };
    const updated = [rowToSave, ...list];
    localStorage.setItem(STORAGE_PREFIX + tableName, JSON.stringify(updated));
    return rowToSave;
  }

  return newRow;
};

export const updateTableRow = async (tableName, idValue, updates) => {
  const supabase = getSupabaseClient();
  const pkCol = getPrimaryKeyColumn(tableName);

  if (supabase) {
    try {
      await supabase.from(tableName).update(updates).eq(pkCol, idValue);
    } catch (err) {
      // silent fallback
    }
  }

  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(STORAGE_PREFIX + tableName);
    const list = cached ? JSON.parse(cached) : (TABLE_SEEDS[tableName] || []);
    const updated = list.map(item => {
      const currentId = item[pkCol] || item.id;
      return currentId === idValue ? { ...item, ...updates } : item;
    });
    localStorage.setItem(STORAGE_PREFIX + tableName, JSON.stringify(updated));
    return updated.find(item => (item[pkCol] || item.id) === idValue);
  }

  return { [pkCol]: idValue, ...updates };
};

export const deleteTableRow = async (tableName, idValue) => {
  const supabase = getSupabaseClient();
  const pkCol = getPrimaryKeyColumn(tableName);

  if (supabase) {
    try {
      await supabase.from(tableName).delete().eq(pkCol, idValue);
    } catch (err) {
      // silent fallback
    }
  }

  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(STORAGE_PREFIX + tableName);
    const list = cached ? JSON.parse(cached) : (TABLE_SEEDS[tableName] || []);
    const updated = list.filter(item => (item[pkCol] || item.id) !== idValue);
    localStorage.setItem(STORAGE_PREFIX + tableName, JSON.stringify(updated));
    return true;
  }

  return true;
};
