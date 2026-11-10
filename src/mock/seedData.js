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

export const initialEmployeeRecords = [
  {
    employee_id: 'EMP-1001',
    first_name: 'Ananya',
    last_name: 'Sharma',
    email: 'ananya.sharma@nexushr.com',
    department_id: 'dept-hr',
    designation_id: 'des-hr-vp',
    manager_id: null,
    joining_date: '2022-01-15',
    employment_type: 'Full-Time',
    phone: '+91 98112 34567',
    address: 'New Delhi, India',
    emergency_contact: '+91 98110 00001',
    gender: 'Female',
    date_of_birth: '1988-04-12',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  },
  {
    employee_id: 'EMP-1002',
    first_name: 'Rohit',
    last_name: 'Verma',
    email: 'rohit.verma@nexushr.com',
    department_id: 'dept-eng',
    designation_id: 'des-eng-dir',
    manager_id: null,
    joining_date: '2021-03-01',
    employment_type: 'Full-Time',
    phone: '+91 98223 45678',
    address: 'Noida, India',
    emergency_contact: '+91 98220 00002',
    gender: 'Male',
    date_of_birth: '1985-08-20',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  },
  {
    employee_id: 'EMP-1003',
    first_name: 'Priya',
    last_name: 'Nair',
    email: 'priya.nair@nexushr.com',
    department_id: 'dept-prd',
    designation_id: 'des-des',
    manager_id: 'EMP-1002',
    joining_date: '2022-06-10',
    employment_type: 'Full-Time',
    phone: '+91 98334 56789',
    address: 'Gurugram, India',
    emergency_contact: '+91 98330 00003',
    gender: 'Female',
    date_of_birth: '1990-11-05',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  },
  {
    employee_id: 'EMP-1004',
    first_name: 'Vikram',
    last_name: 'Singh',
    email: 'vikram.singh@nexushr.com',
    department_id: 'dept-eng',
    designation_id: 'des-swe',
    manager_id: 'EMP-1002',
    joining_date: '2023-08-01',
    employment_type: 'Full-Time',
    phone: '+91 98445 67890',
    address: 'South Delhi, India',
    emergency_contact: '+91 98440 00004',
    gender: 'Male',
    date_of_birth: '1995-02-17',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  },
  {
    employee_id: 'EMP-1005',
    first_name: 'Tanvi',
    last_name: 'Kapoor',
    email: 'tanvi.kapoor@nexushr.com',
    department_id: 'dept-hr',
    designation_id: 'des-rec',
    manager_id: 'EMP-1001',
    joining_date: '2023-11-15',
    employment_type: 'Full-Time',
    phone: '+91 98556 78901',
    address: 'Faridabad, India',
    emergency_contact: '+91 98550 00005',
    gender: 'Female',
    date_of_birth: '1994-07-28',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  },
  {
    employee_id: 'EMP-1006',
    first_name: 'Arjun',
    last_name: 'Mehta',
    email: 'arjun.mehta@nexushr.com',
    department_id: 'dept-eng',
    designation_id: 'des-swe',
    manager_id: 'EMP-1002',
    joining_date: '2024-02-01',
    employment_type: 'Full-Time',
    phone: '+91 98667 89012',
    address: 'West Delhi, India',
    emergency_contact: '+91 98660 00006',
    gender: 'Male',
    date_of_birth: '1997-09-14',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  }
];

export const initialProfiles = [
  { id: '11111111-1111-1111-1111-111111111111', employee_id: 'EMP-1001', email: 'ananya.sharma@nexushr.com', full_name: 'Ananya Sharma', role: 'hr', created_at: '2026-01-01T00:00:00Z' },
  { id: '22222222-2222-2222-2222-222222222222', employee_id: 'EMP-1002', email: 'rohit.verma@nexushr.com', full_name: 'Rohit Verma', role: 'admin', created_at: '2026-01-01T00:00:00Z' },
  { id: '33333333-3333-3333-3333-333333333333', employee_id: 'EMP-1003', email: 'priya.nair@nexushr.com', full_name: 'Priya Nair', role: 'manager', created_at: '2026-01-01T00:00:00Z' },
  { id: '44444444-4444-4444-4444-444444444444', employee_id: 'EMP-1004', email: 'vikram.singh@nexushr.com', full_name: 'Vikram Singh', role: 'employee', created_at: '2026-01-01T00:00:00Z' },
  { id: '55555555-5555-5555-5555-555555555555', employee_id: 'EMP-1005', email: 'tanvi.kapoor@nexushr.com', full_name: 'Tanvi Kapoor', role: 'recruiter', created_at: '2026-01-01T00:00:00Z' },
  { id: '66666666-6666-6666-6666-666666666666', employee_id: 'EMP-1006', email: 'arjun.mehta@nexushr.com', full_name: 'Arjun Mehta', role: 'employee', created_at: '2026-01-01T00:00:00Z' },
];

export const initialAttendance = [
  { attendance_id: 'att-1', employee_id: 'EMP-1001', check_in: '09:00', check_out: '18:00', status: 'present', created_at: '2026-11-09T09:00:00Z' },
  { attendance_id: 'att-2', employee_id: 'EMP-1002', check_in: '09:15', check_out: '18:15', status: 'present', created_at: '2026-11-09T09:15:00Z' },
  { attendance_id: 'att-3', employee_id: 'EMP-1003', check_in: '09:30', check_out: '18:30', status: 'present', created_at: '2026-11-09T09:30:00Z' },
  { attendance_id: 'att-4', employee_id: 'EMP-1004', check_in: '09:05', check_out: '18:00', status: 'present', created_at: '2026-11-09T09:05:00Z' },
  { attendance_id: 'att-5', employee_id: 'EMP-1005', check_in: '09:20', check_out: '18:10', status: 'present', created_at: '2026-11-09T09:20:00Z' },
  { attendance_id: 'att-6', employee_id: 'EMP-1006', check_in: '09:10', check_out: '18:05', status: 'present', created_at: '2026-11-09T09:10:00Z' },
];

export const initialLeaveBalances = [
  { balance_id: 'bal-1', employee_id: 'EMP-1004', leave_type: 'Paid Leave', year: 2026, created_at: '2026-01-01T00:00:00Z' },
  { balance_id: 'bal-2', employee_id: 'EMP-1004', leave_type: 'Sick Leave', year: 2026, created_at: '2026-01-01T00:00:00Z' },
  { balance_id: 'bal-3', employee_id: 'EMP-1006', leave_type: 'Paid Leave', year: 2026, created_at: '2026-01-01T00:00:00Z' },
];

export const initialLeaveRequests = [
  {
    request_id: 'req-1',
    employee_id: 'EMP-1004',
    leave_type: 'Sick Leave',
    start_date: '2026-11-15',
    end_date: '2026-11-16',
    reason: 'Medical consultation and recovery',
    status: 'pending',
    created_at: '2026-11-08T10:00:00Z'
  },
  {
    request_id: 'req-2',
    employee_id: 'EMP-1006',
    leave_type: 'Paid Leave',
    start_date: '2026-11-20',
    end_date: '2026-11-22',
    reason: 'Family event out of town',
    status: 'approved',
    created_at: '2026-11-05T14:30:00Z'
  }
];

export const initialPayroll = [
  { payroll_id: 'pay-1', employee_id: 'EMP-1004', basic_salary: 85000, allowances: 25000, net_salary: 98500, created_at: '2026-10-31T00:00:00Z' },
  { payroll_id: 'pay-2', employee_id: 'EMP-1006', basic_salary: 90000, allowances: 25000, net_salary: 103000, created_at: '2026-10-31T00:00:00Z' },
];

export const initialPayslips = [
  { payslip_id: 'ps-1', payroll_id: 'pay-1' },
  { payslip_id: 'ps-2', payroll_id: 'pay-2' },
];

export const initialGrievances = [
  {
    grievance_id: 'grv-1',
    employee_id: 'EMP-1004',
    category: 'Workplace Environment',
    subject: 'Ergonomic seating upgrade request',
    description: 'Requesting ergonomic lumbar chair replacement for desk station.',
    priority: 'medium',
    status: 'in_review',
    assigned_to: 'EMP-1001'
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
  },
  {
    id: 'job-2',
    title: 'Lead Product Designer',
    department_id: 'dept-prd',
    designation_id: 'des-des',
    employment_type: 'Full-Time',
    location: 'Remote, India',
    experience_required: '5+ Years',
    openings: 1,
    status: 'published',
    salary_range: '₹14,00,000 - ₹20,00,000 PA',
    description: 'Oversee UI/UX design systems, user journey mapping, and usability testing for B2B portal products.',
    posted_date: '2026-10-20',
  }
];

export const initialCandidates = [
  { id: 'cand-1', first_name: 'Siddharth', last_name: 'Rao', email: 'siddharth.rao@example.com', phone: '+91 99112 88291', skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'], experience_years: 5, status: 'interviewing' },
  { id: 'cand-2', first_name: 'Meera', last_name: 'Iyer', email: 'meera.iyer@example.com', phone: '+91 99223 77382', skills: ['Figma', 'Design Systems', 'User Research'], experience_years: 6, status: 'offered' },
];

export const initialApplications = [
  { id: 'app-1', candidate_id: 'cand-1', job_posting_id: 'job-1', applied_date: '2026-10-18', status: 'interview', rating: 4.8, notes: 'Strong architectural fundamentals in React 19.' },
  { id: 'app-2', candidate_id: 'cand-2', job_posting_id: 'job-2', applied_date: '2026-10-22', status: 'offered', rating: 4.9, notes: 'Outstanding design portfolio and systems experience.' },
];

export const initialInterviews = [
  { id: 'int-1', application_id: 'app-1', stage: 'Technical Round 2', scheduled_at: '2026-11-12T11:00:00Z', interviewer_id: 'EMP-1002', status: 'scheduled' }
];

export const initialOfferLetters = [
  { id: 'off-1', candidate_id: 'cand-2', designation_id: 'des-des', base_salary: 1800000, joining_date: '2026-12-01', status: 'sent' }
];

export const initialOnboarding = [
  { id: 'onb-1', candidate_id: 'cand-2', step: 'Background Verification', status: 'in_progress', completed_percentage: 60 }
];

export const initialSalaryStructures = [
  { id: 'sal-1', designation_id: 'des-swe', basic_percentage: 50, hra_percentage: 30, special_allowance_percentage: 20 }
];

export const initialDeductionRules = [
  { id: 'ded-1', name: 'Provident Fund (PF)', percentage: 12, is_statutory: true },
  { id: 'ded-2', name: 'Professional Tax', fixed_amount: 200, is_statutory: true }
];

export const initialPayrollDeductions = [
  { id: 'prd-1', payroll_id: 'pay-1', rule_id: 'ded-1', amount: 10200 }
];

export const initialGrievanceCommunications = [
  { id: 'gcom-1', grievance_id: 'grv-1', sender_id: 'EMP-1001', message: 'Procurement team has placed the purchase requisition.', created_at: '2026-11-09T14:00:00Z' }
];

export const initialGrievanceResolutions = [
  { grievance_id: 'grv-1', resolution_summary: 'Ergonomic chair ordered under office wellness budget.' }
];

export const initialMessagesNotifications = [
  { id: 'notif-1', title: 'System Security Hardened', message: 'NexusHR RBAC, Content Security Policy, and Supabase integration verified.', type: 'system', created_at: '2026-11-10T00:00:00Z' },
  { id: 'notif-2', title: 'Upcoming Holiday Notice', message: 'Office remains closed on upcoming national holiday. Self-service portal remains accessible 24/7.', type: 'announcement', created_at: '2026-11-08T09:00:00Z' }
];
