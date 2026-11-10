// High-fidelity Dataset representing the 22 database tables of the HRMS
// Schema strictly matches the live PostgreSQL / Supabase table columns

export const initialDepartments = [
  { department_id: 'dept-eng', department_name: 'Engineering & Technology', description: 'Core software engineering, QA, DevOps, and cloud infrastructure.', created_at: '2026-01-01T00:00:00Z' },
  { department_id: 'dept-hr', department_name: 'Human Resources', description: 'Talent acquisition, employee engagement, HR compliance, and payroll.', created_at: '2026-01-01T00:00:00Z' },
  { department_id: 'dept-prd', department_name: 'Product & UX Design', description: 'Product roadmap strategy, UX research, UI design, and analytics.', created_at: '2026-01-01T00:00:00Z' },
  { department_id: 'dept-mkt', department_name: 'Sales & Marketing', description: 'B2B client acquisition, digital marketing campaigns, and brand growth.', created_at: '2026-01-01T00:00:00Z' },
  { department_id: 'dept-fin', department_name: 'Finance & Accounts', description: 'Financial auditing, payroll disbursement, corporate taxation, and budgets.', created_at: '2026-01-01T00:00:00Z' },
];

export const initialDesignations = [
  { designation_id: 'des-hr-vp', designation_name: 'VP of Human Resources', description: 'Leads global people operations and organizational development.', created_at: '2026-01-01T00:00:00Z' },
  { designation_id: 'des-hr-spec', designation_name: 'Senior HR Specialist', description: 'Specializes in employee relations, policies, and retention.', created_at: '2026-01-01T00:00:00Z' },
  { designation_id: 'des-eng-dir', designation_name: 'Engineering Director', description: 'Directs overall technical architecture and engineering delivery.', created_at: '2026-01-01T00:00:00Z' },
  { designation_id: 'des-swe', designation_name: 'Full-Stack Software Engineer', description: 'Builds scalable frontend and backend enterprise applications.', created_at: '2026-01-01T00:00:00Z' },
  { designation_id: 'des-des', designation_name: 'Lead Product Designer', description: 'Designs end-to-end user workflows and interface design systems.', created_at: '2026-01-01T00:00:00Z' },
  { designation_id: 'des-rec', designation_name: 'Talent Acquisition Recruiter', description: 'Manages candidate sourcing, interviews, and offer rollouts.', created_at: '2026-01-01T00:00:00Z' },
];

// All 30 Employee Records directly matching the user's Supabase employee_records table
export const initialEmployeeRecords = [
  { employee_id: 'EMP001', first_name: 'Ananya', last_name: 'Sharma', email: 'ananya.sharma@nexushr.com', department_id: 'dept-hr', designation_id: 'des-hr-vp', manager_id: null, joining_date: '2021-01-15', employment_type: 'Full-Time', phone: '+91 98112 00001', gender: 'Female', date_of_birth: '1988-04-12' },
  { employee_id: 'EMP002', first_name: 'Rohit', last_name: 'Verma', email: 'rohit.verma@nexushr.com', department_id: 'dept-eng', designation_id: 'des-eng-dir', manager_id: null, joining_date: '2020-03-01', employment_type: 'Full-Time', phone: '+91 98223 00002', gender: 'Male', date_of_birth: '1985-08-20' },
  { employee_id: 'EMP003', first_name: 'Priya', last_name: 'Nair', email: 'priya.nair@nexushr.com', department_id: 'dept-prd', designation_id: 'des-des', manager_id: 'EMP002', joining_date: '2021-06-10', employment_type: 'Full-Time', phone: '+91 98334 00003', gender: 'Female', date_of_birth: '1990-11-05' },
  { employee_id: 'EMP004', first_name: 'Vikram', last_name: 'Singh', email: 'vikram.singh@nexushr.com', department_id: 'dept-eng', designation_id: 'des-swe', manager_id: 'EMP002', joining_date: '2022-08-01', employment_type: 'Full-Time', phone: '+91 98445 00004', gender: 'Male', date_of_birth: '1995-02-17' },
  { employee_id: 'EMP005', first_name: 'Tanvi', last_name: 'Kapoor', email: 'tanvi.kapoor@nexushr.com', department_id: 'dept-hr', designation_id: 'des-rec', manager_id: 'EMP001', joining_date: '2022-11-15', employment_type: 'Full-Time', phone: '+91 98556 00005', gender: 'Female', date_of_birth: '1994-07-28' },
  { employee_id: 'EMP006', first_name: 'Arjun', last_name: 'Mehta', email: 'arjun.mehta@nexushr.com', department_id: 'dept-eng', designation_id: 'des-swe', manager_id: 'EMP002', joining_date: '2023-01-10', employment_type: 'Full-Time', phone: '+91 98667 00006', gender: 'Male', date_of_birth: '1996-09-14' },
  { employee_id: 'EMP007', first_name: 'Rohan', last_name: 'Sen', email: 'rohan.sen@nexushr.com', department_id: 'dept-eng', designation_id: 'des-swe', manager_id: 'EMP002', joining_date: '2023-02-01', employment_type: 'Full-Time', phone: '+91 98778 00007', gender: 'Male', date_of_birth: '1997-03-22' },
  { employee_id: 'EMP008', first_name: 'Kavya', last_name: 'Iyer', email: 'kavya.iyer@nexushr.com', department_id: 'dept-prd', designation_id: 'des-des', manager_id: 'EMP003', joining_date: '2023-03-15', employment_type: 'Full-Time', phone: '+91 98889 00008', gender: 'Female', date_of_birth: '1998-05-18' },
  { employee_id: 'EMP009', first_name: 'Aditya', last_name: 'Rao', email: 'aditya.rao@nexushr.com', department_id: 'dept-mkt', designation_id: 'des-rec', manager_id: 'EMP001', joining_date: '2023-04-10', employment_type: 'Full-Time', phone: '+91 98990 00009', gender: 'Male', date_of_birth: '1995-12-04' },
  { employee_id: 'EMP010', first_name: 'Riya', last_name: 'Patel', email: 'riya.patel@nexushr.com', department_id: 'dept-fin', designation_id: 'des-hr-spec', manager_id: 'EMP001', joining_date: '2023-05-02', employment_type: 'Full-Time', phone: '+91 98111 00010', gender: 'Female', date_of_birth: '1996-08-11' },
  { employee_id: 'EMP011', first_name: 'Manav', last_name: 'Khurana', email: 'manav.khurana@nexushr.com', department_id: 'dept-eng', designation_id: 'des-swe', manager_id: 'EMP002', joining_date: '2023-06-20', employment_type: 'Full-Time', phone: '+91 98222 00011', gender: 'Male', date_of_birth: '1997-10-15' },
  { employee_id: 'EMP012', first_name: 'Anika', last_name: 'Reddy', email: 'anika.reddy@nexushr.com', department_id: 'dept-hr', designation_id: 'des-hr-spec', manager_id: 'EMP001', joining_date: '2023-07-01', employment_type: 'Full-Time', phone: '+91 98333 00012', gender: 'Female', date_of_birth: '1998-01-25' },
  { employee_id: 'EMP013', first_name: 'Kunal', last_name: 'Singhania', email: 'kunal.singhania@nexushr.com', department_id: 'dept-fin', designation_id: 'des-hr-spec', manager_id: 'EMP001', joining_date: '2023-08-12', employment_type: 'Full-Time', phone: '+91 98444 00013', gender: 'Male', date_of_birth: '1994-06-30' },
  { employee_id: 'EMP014', first_name: 'Pooja', last_name: 'Nair', email: 'pooja.nair@nexushr.com', department_id: 'dept-prd', designation_id: 'des-des', manager_id: 'EMP003', joining_date: '2023-09-05', employment_type: 'Full-Time', phone: '+91 98555 00014', gender: 'Female', date_of_birth: '1999-02-14' },
  { employee_id: 'EMP015', first_name: 'Varun', last_name: 'Deshmukh', email: 'varun.deshmukh@nexushr.com', department_id: 'dept-eng', designation_id: 'des-swe', manager_id: 'EMP002', joining_date: '2023-10-18', employment_type: 'Full-Time', phone: '+91 98666 00015', gender: 'Male', date_of_birth: '1996-04-09' },
  { employee_id: 'EMP016', first_name: 'Shreya', last_name: 'Das', email: 'shreya.das@nexushr.com', department_id: 'dept-mkt', designation_id: 'des-rec', manager_id: 'EMP001', joining_date: '2023-11-25', employment_type: 'Full-Time', phone: '+91 98777 00016', gender: 'Female', date_of_birth: '1997-11-20' },
  { employee_id: 'EMP017', first_name: 'Nikhil', last_name: 'Bajaj', email: 'nikhil.bajaj@nexushr.com', department_id: 'dept-eng', designation_id: 'des-swe', manager_id: 'EMP002', joining_date: '2024-01-08', employment_type: 'Full-Time', phone: '+91 98888 00017', gender: 'Male', date_of_birth: '1998-08-05' },
  { employee_id: 'EMP018', first_name: 'Ritu', last_name: 'Choudhary', email: 'ritu.choudhary@nexushr.com', department_id: 'dept-hr', designation_id: 'des-hr-spec', manager_id: 'EMP001', joining_date: '2024-02-14', employment_type: 'Full-Time', phone: '+91 98999 00018', gender: 'Female', date_of_birth: '1995-09-17' },
  { employee_id: 'EMP019', first_name: 'Simran', last_name: 'Kaur', email: 'simran.kaur@nexushr.com', department_id: 'dept-eng', designation_id: 'des-swe', manager_id: 'EMP002', joining_date: '2024-03-01', employment_type: 'Full-Time', phone: '+91 98123 00019', gender: 'Female', date_of_birth: '2002-09-08' },
  { employee_id: 'EMP020', first_name: 'Dev', last_name: 'Malik', email: 'dev.malik@nexushr.com', department_id: 'dept-eng', designation_id: 'des-swe', manager_id: 'EMP002', joining_date: '2024-03-15', employment_type: 'Full-Time', phone: '+91 98234 00020', gender: 'Male', date_of_birth: '1998-04-17' },
  { employee_id: 'EMP021', first_name: 'Neha', last_name: 'Sharma', email: 'neha.sharma@nexushr.com', department_id: 'dept-hr', designation_id: 'des-hr-spec', manager_id: 'EMP001', joining_date: '2024-04-01', employment_type: 'Full-Time', phone: '+91 98345 00021', gender: 'Female', date_of_birth: '2000-05-12' },
  { employee_id: 'EMP022', first_name: 'Aarav', last_name: 'Verma', email: 'aarav.verma@nexushr.com', department_id: 'dept-eng', designation_id: 'des-swe', manager_id: 'EMP002', joining_date: '2024-04-15', employment_type: 'Full-Time', phone: '+91 98456 00022', gender: 'Male', date_of_birth: '1999-12-03' },
  { employee_id: 'EMP023', first_name: 'Diya', last_name: 'Kapoor', email: 'diya.kapoor@nexushr.com', department_id: 'dept-prd', designation_id: 'des-des', manager_id: 'EMP003', joining_date: '2024-05-01', employment_type: 'Full-Time', phone: '+91 98567 00023', gender: 'Female', date_of_birth: '2001-07-19' },
  { employee_id: 'EMP024', first_name: 'Kabir', last_name: 'Malhotra', email: 'kabir.malhotra@nexushr.com', department_id: 'dept-eng', designation_id: 'des-swe', manager_id: 'EMP002', joining_date: '2024-05-15', employment_type: 'Full-Time', phone: '+91 98678 00024', gender: 'Male', date_of_birth: '1997-03-11' },
  { employee_id: 'EMP025', first_name: 'Sanya', last_name: 'Gupta', email: 'sanya.gupta@nexushr.com', department_id: 'dept-mkt', designation_id: 'des-rec', manager_id: 'EMP001', joining_date: '2024-06-01', employment_type: 'Full-Time', phone: '+91 98789 00025', gender: 'Female', date_of_birth: '2000-10-24' },
  { employee_id: 'EMP026', first_name: 'Ishaan', last_name: 'Mehta', email: 'ishaan.mehta@nexushr.com', department_id: 'dept-fin', designation_id: 'des-hr-spec', manager_id: 'EMP001', joining_date: '2024-06-15', employment_type: 'Full-Time', phone: '+91 98890 00026', gender: 'Male', date_of_birth: '1998-02-16' },
  { employee_id: 'EMP027', first_name: 'Tanya', last_name: 'Singh', email: 'tanya.singh@nexushr.com', department_id: 'dept-hr', designation_id: 'des-hr-spec', manager_id: 'EMP001', joining_date: '2024-07-01', employment_type: 'Full-Time', phone: '+91 98901 00027', gender: 'Female', date_of_birth: '2001-08-08' },
  { employee_id: 'EMP028', first_name: 'Yash', last_name: 'Arora', email: 'yash.arora@nexushr.com', department_id: 'dept-eng', designation_id: 'des-swe', manager_id: 'EMP002', joining_date: '2024-07-15', employment_type: 'Full-Time', phone: '+91 98012 00028', gender: 'Male', date_of_birth: '1999-06-14' },
  { employee_id: 'EMP029', first_name: 'Manya', last_name: 'Joshi', email: 'manya.joshi@nexushr.com', department_id: 'dept-prd', designation_id: 'des-des', manager_id: 'EMP003', joining_date: '2024-08-01', employment_type: 'Full-Time', phone: '+91 98134 00029', gender: 'Female', date_of_birth: '2002-01-30' },
  { employee_id: 'EMP030', first_name: 'Reyansh', last_name: 'Kumar', email: 'reyansh.kumar@nexushr.com', department_id: 'dept-eng', designation_id: 'des-swe', manager_id: 'EMP002', joining_date: '2024-08-15', employment_type: 'Full-Time', phone: '+91 98245 00030', gender: 'Male', date_of_birth: '2000-11-21' }
];

export const initialProfiles = initialEmployeeRecords.map((emp, index) => {
  let role = 'employee';
  if (emp.employee_id === 'EMP001') role = 'hr';
  else if (emp.employee_id === 'EMP002') role = 'admin';
  else if (emp.employee_id === 'EMP003') role = 'manager';
  else if (emp.employee_id === 'EMP005') role = 'recruiter';

  return {
    id: `usr-${emp.employee_id.toLowerCase()}`,
    employee_id: emp.employee_id,
    email: emp.email,
    full_name: `${emp.first_name} ${emp.last_name}`.trim(),
    role: role,
    created_at: '2026-01-01T00:00:00Z'
  };
});

export const initialAttendance = [
  { attendance_id: 'att-1', employee_id: 'EMP019', check_in: '09:00', check_out: '18:00', status: 'present', created_at: '2026-11-09T09:00:00Z' },
  { attendance_id: 'att-2', employee_id: 'EMP020', check_in: '09:15', check_out: '18:15', status: 'present', created_at: '2026-11-09T09:15:00Z' },
  { attendance_id: 'att-3', employee_id: 'EMP021', check_in: '09:05', check_out: '18:00', status: 'present', created_at: '2026-11-09T09:05:00Z' },
  { attendance_id: 'att-4', employee_id: 'EMP001', check_in: '09:00', check_out: '18:00', status: 'present', created_at: '2026-11-09T09:00:00Z' },
  { attendance_id: 'att-5', employee_id: 'EMP002', check_in: '09:10', check_out: '18:10', status: 'present', created_at: '2026-11-09T09:10:00Z' },
];

export const initialLeaveBalances = [
  { balance_id: 'bal-1', employee_id: 'EMP019', leave_type: 'Paid Leave', year: 2026, created_at: '2026-01-01T00:00:00Z' },
  { balance_id: 'bal-2', employee_id: 'EMP020', leave_type: 'Sick Leave', year: 2026, created_at: '2026-01-01T00:00:00Z' },
];

export const initialLeaveRequests = [
  {
    request_id: 'req-1',
    employee_id: 'EMP019',
    leave_type: 'Sick Leave',
    start_date: '2026-11-15',
    end_date: '2026-11-16',
    reason: 'Medical checkup',
    status: 'pending',
    created_at: '2026-11-08T10:00:00Z'
  },
  {
    request_id: 'req-2',
    employee_id: 'EMP020',
    leave_type: 'Paid Leave',
    start_date: '2026-11-20',
    end_date: '2026-11-22',
    reason: 'Family event out of town',
    status: 'approved',
    created_at: '2026-11-05T14:30:00Z'
  }
];

export const initialPayroll = [
  { payroll_id: 'pay-1', employee_id: 'EMP019', basic_salary: 85000, allowances: 25000, net_salary: 98500, created_at: '2026-10-31T00:00:00Z' },
  { payroll_id: 'pay-2', employee_id: 'EMP020', basic_salary: 90000, allowances: 25000, net_salary: 103000, created_at: '2026-10-31T00:00:00Z' },
];

export const initialPayslips = [
  { payslip_id: 'ps-1', payroll_id: 'pay-1' },
  { payslip_id: 'ps-2', payroll_id: 'pay-2' },
];

export const initialGrievances = [
  {
    grievance_id: 'grv-1',
    employee_id: 'EMP019',
    category: 'Workplace Environment',
    subject: 'Ergonomic seating upgrade request',
    description: 'Requesting ergonomic lumbar chair replacement for desk station.',
    priority: 'medium',
    status: 'in_review',
    assigned_to: 'EMP001'
  }
];

export const initialJobPostings = [
  {
    id: 'job-1',
    title: 'Senior Frontend Engineer (React/Tailwind)',
    department_id: 'dept-eng',
    designation_id: 'des-swe',
    employment_type: 'Full-Time',
    location: 'New Delhi (Hybrid)',
    experience_required: '4-6 Years',
    openings: 3,
    status: 'published',
    salary_range: '₹12,00,000 - ₹18,00,000 PA',
    description: 'We are seeking an experienced Frontend Developer to spearhead our next-gen enterprise UI and micro-frontends.',
    posted_date: '2026-10-15',
  }
];

export const initialCandidates = [
  { id: 'cand-1', first_name: 'Siddharth', last_name: 'Rao', email: 'siddharth.rao@example.com', phone: '+91 99112 88291', skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'], experience_years: 5, status: 'interviewing' },
];

export const initialApplications = [
  { id: 'app-1', candidate_id: 'cand-1', job_posting_id: 'job-1', applied_date: '2026-10-18', status: 'interview', rating: 4.8, notes: 'Strong architectural fundamentals in React 19.' },
];

export const initialInterviews = [
  { id: 'int-1', application_id: 'app-1', stage: 'Technical Round 2', scheduled_at: '2026-11-12T11:00:00Z', interviewer_id: 'EMP002', status: 'scheduled' }
];

export const initialOfferLetters = [
  { id: 'off-1', candidate_id: 'cand-1', designation_id: 'des-swe', base_salary: 1800000, joining_date: '2026-12-01', status: 'sent' }
];

export const initialOnboarding = [
  { id: 'onb-1', candidate_id: 'cand-1', step: 'Background Verification', status: 'in_progress', completed_percentage: 60 }
];

export const initialSalaryStructures = [
  { id: 'sal-1', designation_id: 'des-swe', basic_percentage: 50, hra_percentage: 30, special_allowance_percentage: 20 }
];

export const initialDeductionRules = [
  { id: 'ded-1', name: 'Provident Fund (PF)', percentage: 12, is_statutory: true },
];

export const initialPayrollDeductions = [
  { id: 'prd-1', payroll_id: 'pay-1', rule_id: 'ded-1', amount: 10200 }
];

export const initialGrievanceCommunications = [
  { id: 'gcom-1', grievance_id: 'grv-1', sender_id: 'EMP001', message: 'Procurement team has placed the purchase requisition.', created_at: '2026-11-09T14:00:00Z' }
];

export const initialGrievanceResolutions = [
  { grievance_id: 'grv-1', resolution_summary: 'Ergonomic chair ordered under office wellness budget.' }
];

export const initialMessagesNotifications = [
  { id: 'notif-1', title: 'System Security Hardened', message: 'NexusHR RBAC, Content Security Policy, and Supabase integration verified.', type: 'system', created_at: '2026-11-10T00:00:00Z' },
  { id: 'notif-2', title: 'Upcoming Holiday Notice', message: 'Office remains closed on upcoming national holiday. Self-service portal remains accessible 24/7.', type: 'announcement', created_at: '2026-11-08T09:00:00Z' }
];
