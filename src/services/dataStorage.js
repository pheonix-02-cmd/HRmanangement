import { getSupabaseClient, supabaseDirectFetch, supabaseDirectInsert, supabaseDirectUpdate } from '../config/supabase';
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
  reports_analytics: initialData.initialReportsAnalytics,
  report_analytics: initialData.initialReportsAnalytics,
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
    company_announcements: 'announcement_id',
    messages_notifications: 'notification_id',
    performance: 'performance_id',
    reports_analytics: 'report_id',
    report_analytics: 'report_id',
    profiles: 'id'
  };
  return map[tableName] || 'id';
};

const normalizeTableRows = (tableName, rows) => {
  if (!Array.isArray(rows)) return rows;
  if (tableName === 'job_postings') {
    return rows.map(j => ({
      ...j,
      id: j.job_id !== undefined ? j.job_id : j.id,
      title: j.job_title || j.title || '',
      description: j.job_description || j.description || '',
      openings: j.vacancies !== undefined ? j.vacancies : (j.openings || 1)
    }));
  }
  if (tableName === 'company_announcements') {
    return rows.map(a => ({
      ...a,
      id: a.announcement_id || a.id,
      content: a.message || a.content || '',
      type: a.announcement_type || a.type || 'Announcement'
    }));
  }
  if (tableName === 'messages_notifications') {
    return rows.map(m => ({
      ...m,
      id: m.notification_id || m.id,
      desc: m.message || m.desc || '',
      unread: !m.is_read
    }));
  }
  if (tableName === 'reports_analytics' || tableName === 'report_analytics') {
    return rows.map(r => ({
      ...r,
      id: r.report_id || r.id,
      report_id: r.report_id || r.id,
      report_data: typeof r.report_data === 'string' ? JSON.parse(r.report_data) : (r.report_data || {})
    }));
  }
  return rows;
};

export const fetchTableData = async (tableName, customQuery = '') => {
  const targetTable = (tableName === 'report_analytics') ? 'reports_analytics' : tableName;
  // 1. First attempt: Direct HTTP query to Supabase PostgREST (bypasses all SDK & client caching)
  try {
    let q = customQuery;
    if (!q) {
      if (targetTable === 'attendance') q = 'select=*&order=attendance_date.desc&limit=1000';
      else if (targetTable === 'payroll') q = 'select=*&order=pay_period.desc';
      else if (targetTable === 'payslips') q = 'select=*&order=payslip_id.desc';
      else if (targetTable === 'company_announcements') q = 'select=*&order=created_at.desc';
      else if (targetTable === 'messages_notifications') q = 'select=*&order=created_at.desc';
      else if (targetTable === 'job_postings') q = 'select=*&order=created_at.desc';
      else if (targetTable === 'performance') q = 'select=*&order=created_at.desc';
      else if (targetTable === 'reports_analytics') q = 'select=*&order=generated_at.desc';
      else q = 'select=*';
    }
    const directData = await supabaseDirectFetch(targetTable, q);
    if (directData !== null && Array.isArray(directData)) {
      const normalized = normalizeTableRows(tableName, directData);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_PREFIX + tableName, JSON.stringify(normalized));
        } catch (e) {}
      }
      return { data: normalized, error: null, source: 'supabase_direct' };
    }
  } catch (err) {
    // fallback to SDK
  }

  // 2. Second attempt: Supabase JS SDK client
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from(targetTable).select('*');
      if (!error && Array.isArray(data)) {
        const normalized = normalizeTableRows(tableName, data);
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(STORAGE_PREFIX + tableName, JSON.stringify(normalized));
          } catch (e) {}
        }
        return { data: normalized, error: null, source: 'supabase' };
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
          return { data: normalizeTableRows(tableName, parsed), error: null, source: 'local_storage' };
        }
      } catch (e) {
        console.error(e);
      }
    }
    const seed = normalizeTableRows(tableName, TABLE_SEEDS[tableName] || []);
    localStorage.setItem(STORAGE_PREFIX + tableName, JSON.stringify(seed));
    return { data: seed, error: null, source: 'seed' };
  }

  return { data: normalizeTableRows(tableName, TABLE_SEEDS[tableName] || []), error: null, source: 'seed' };
};

export const insertTableRow = async (tableName, newRow) => {
  const pkCol = getPrimaryKeyColumn(tableName);
  let rowToInsert = { ...newRow };

  // Sanitize attendance rows for PostgreSQL schema
  if (tableName === 'attendance') {
    if (rowToInsert.attendance_id && (String(rowToInsert.attendance_id).startsWith('att-') || !rowToInsert.attendance_id)) {
      delete rowToInsert.attendance_id; // let PostgreSQL generate valid UUID
    }
    if (!rowToInsert.attendance_date) {
      rowToInsert.attendance_date = new Date().toISOString().split('T')[0];
    }
    delete rowToInsert.punch_in;
    delete rowToInsert.punch_out;
    delete rowToInsert.id;
  }

  // Sanitize job_postings rows for PostgreSQL schema
  if (tableName === 'job_postings') {
    const validCols = [
      'job_id', 'job_title', 'department_id', 'job_description',
      'required_skills', 'qualification', 'experience_required',
      'employment_type', 'salary_range', 'vacancies', 'location',
      'posted_date', 'closing_date', 'created_by', 'status', 'created_at', 'updated_at'
    ];
    if (!rowToInsert.job_title && rowToInsert.title) rowToInsert.job_title = rowToInsert.title;
    if (!rowToInsert.job_description && rowToInsert.description) rowToInsert.job_description = rowToInsert.description;
    if (rowToInsert.vacancies === undefined && rowToInsert.openings !== undefined) rowToInsert.vacancies = Number(rowToInsert.openings);
    if (!rowToInsert.employment_type) rowToInsert.employment_type = 'Full-Time';
    if (!rowToInsert.status) rowToInsert.status = 'Published';
    if (!rowToInsert.created_by) rowToInsert.created_by = 'EMP001';
    if (!rowToInsert.posted_date) rowToInsert.posted_date = new Date().toISOString().split('T')[0];
    if (!rowToInsert.created_at) rowToInsert.created_at = new Date().toISOString();
    if (!rowToInsert.updated_at) rowToInsert.updated_at = new Date().toISOString();
    // Delete non-schema and client mock fields so PostgreSQL/PostgREST does not reject
    delete rowToInsert.job_id; // sequence generates valid integer
    delete rowToInsert.id;
    delete rowToInsert.title;
    delete rowToInsert.description;
    delete rowToInsert.openings;

    const sanitized = {};
    for (const col of validCols) {
      if (rowToInsert[col] !== undefined) sanitized[col] = rowToInsert[col];
    }
    rowToInsert = sanitized;
  }

  // Sanitize company_announcements rows for PostgreSQL schema
  if (tableName === 'company_announcements') {
    const validCols = [
      'announcement_id', 'title', 'message', 'announcement_type',
      'created_by', 'created_at', 'expires_at', 'is_published'
    ];
    if (!rowToInsert.message && rowToInsert.content) rowToInsert.message = rowToInsert.content;
    if (!rowToInsert.announcement_type && rowToInsert.type) rowToInsert.announcement_type = rowToInsert.type;
    if (rowToInsert.is_published === undefined) rowToInsert.is_published = true;
    if (!rowToInsert.created_by) rowToInsert.created_by = 'EMP001';
    if (!rowToInsert.created_at) rowToInsert.created_at = new Date().toISOString();
    if (rowToInsert.announcement_id && (String(rowToInsert.announcement_id).startsWith('ann-') || !rowToInsert.announcement_id)) {
      delete rowToInsert.announcement_id;
    }
    delete rowToInsert.id;
    delete rowToInsert.content;
    delete rowToInsert.type;

    const sanitized = {};
    for (const col of validCols) {
      if (rowToInsert[col] !== undefined) sanitized[col] = rowToInsert[col];
    }
    rowToInsert = sanitized;
  }

  // Sanitize messages_notifications rows for PostgreSQL schema
  if (tableName === 'messages_notifications') {
    const validCols = [
      'notification_id', 'sender_employee_id', 'receiver_employee_id',
      'title', 'message', 'notification_type', 'is_read', 'created_at'
    ];
    if (!rowToInsert.message && rowToInsert.desc) rowToInsert.message = rowToInsert.desc;
    if (!rowToInsert.notification_type && rowToInsert.type) rowToInsert.notification_type = rowToInsert.type;
    if (rowToInsert.is_read === undefined) rowToInsert.is_read = false;
    if (!rowToInsert.created_at) rowToInsert.created_at = new Date().toISOString();
    if (rowToInsert.notification_id && (String(rowToInsert.notification_id).startsWith('notif-') || !rowToInsert.notification_id)) {
      delete rowToInsert.notification_id;
    }
    delete rowToInsert.id;
    delete rowToInsert.desc;
    delete rowToInsert.type;

    const sanitized = {};
    for (const col of validCols) {
      if (rowToInsert[col] !== undefined) sanitized[col] = rowToInsert[col];
    }
    rowToInsert = sanitized;
  }

  let savedRow = null;

  // 1. Direct HTTP insert
  try {
    const directRes = await supabaseDirectInsert(tableName, rowToInsert);
    if (directRes) {
      savedRow = directRes;
    }
  } catch (err) {
    console.warn(`Direct insert failed for ${tableName}:`, err);
  }

  // 2. Supabase SDK insert fallback
  if (!savedRow) {
    const supabase = getSupabaseClient();
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
  }

  const finalRow = savedRow || rowToInsert;

  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(STORAGE_PREFIX + tableName);
    const list = cached ? JSON.parse(cached) : (TABLE_SEEDS[tableName] || []);
    const rowToSave = finalRow[pkCol] ? finalRow : { [pkCol]: `${tableName.slice(0, 3)}-${Date.now()}`, ...finalRow };
    const updated = [rowToSave, ...list];
    localStorage.setItem(STORAGE_PREFIX + tableName, JSON.stringify(updated));
    return rowToSave;
  }

  return finalRow;
};

export const updateTableRow = async (tableName, idValue, updates) => {
  const pkCol = getPrimaryKeyColumn(tableName);
  let cleanUpdates = { ...updates };

  if (tableName === 'attendance') {
    delete cleanUpdates.punch_in;
    delete cleanUpdates.punch_out;
    delete cleanUpdates.id;
  }

  if (tableName === 'job_postings') {
    if (!cleanUpdates.job_title && cleanUpdates.title) cleanUpdates.job_title = cleanUpdates.title;
    if (!cleanUpdates.job_description && cleanUpdates.description) cleanUpdates.job_description = cleanUpdates.description;
    if (cleanUpdates.vacancies === undefined && cleanUpdates.openings !== undefined) cleanUpdates.vacancies = Number(cleanUpdates.openings);
    delete cleanUpdates.id;
    delete cleanUpdates.title;
    delete cleanUpdates.description;
    delete cleanUpdates.openings;
  }

  if (tableName === 'company_announcements') {
    if (!cleanUpdates.message && cleanUpdates.content) cleanUpdates.message = cleanUpdates.content;
    if (!cleanUpdates.announcement_type && cleanUpdates.type) cleanUpdates.announcement_type = cleanUpdates.type;
    delete cleanUpdates.id;
    delete cleanUpdates.content;
    delete cleanUpdates.type;
  }

  if (tableName === 'messages_notifications') {
    if (!cleanUpdates.message && cleanUpdates.desc) cleanUpdates.message = cleanUpdates.desc;
    delete cleanUpdates.id;
    delete cleanUpdates.desc;
  }

  let updatedRow = null;

  // 1. Direct HTTP update
  try {
    const directRes = await supabaseDirectUpdate(tableName, pkCol, idValue, cleanUpdates);
    if (directRes) {
      updatedRow = directRes;
    }
  } catch (err) {
    console.warn(`Direct update failed for ${tableName}:`, err);
  }

  // 2. Supabase SDK fallback
  if (!updatedRow) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from(tableName).update(cleanUpdates).eq(pkCol, idValue);
      } catch (err) {
        // silent fallback
      }
    }
  }

  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(STORAGE_PREFIX + tableName);
    const list = cached ? JSON.parse(cached) : (TABLE_SEEDS[tableName] || []);
    const updated = list.map(item => {
      const currentId = item[pkCol] || item.id;
      return currentId === idValue ? { ...item, ...cleanUpdates } : item;
    });
    localStorage.setItem(STORAGE_PREFIX + tableName, JSON.stringify(updated));
    return updated.find(item => (item[pkCol] || item.id) === idValue);
  }

  return { [pkCol]: idValue, ...cleanUpdates };
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
