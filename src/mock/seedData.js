// High-fidelity Mock & Initial Dataset representing all 22 database tables of NexusHR

export const initialDepartments = [
  { id: 'dept-1', name: 'Engineering & Technology', code: 'ENG', head_id: 'emp-2', budget: 12000000, description: 'Core software engineering, QA, DevOps, and cloud infrastructure.' },
  { id: 'dept-2', name: 'Human Resources', code: 'HR', head_id: 'emp-1', budget: 3500000, description: 'Talent acquisition, employee engagement, HR compliance, and payroll.' },
  { id: 'dept-3', name: 'Product & UX Design', code: 'PRD', head_id: 'emp-3', budget: 4500000, description: 'Product roadmap strategy, UX research, UI design, and analytics.' },
  { id: 'dept-4', name: 'Sales & Marketing', code: 'MKT', head_id: 'emp-4', budget: 6000000, description: 'B2B client acquisition, digital marketing campaigns, and brand growth.' },
  { id: 'dept-5', name: 'Finance & Accounts', code: 'FIN', head_id: 'emp-5', budget: 2500000, description: 'Financial auditing, payroll disbursement, corporate taxation, and budgets.' },
];

export const initialDesignations = [
  { id: 'des-1', title: 'VP of Human Resources', department_id: 'dept-2', level: 'L7', min_salary: 1800000, max_salary: 2800000 },
  { id: 'des-2', title: 'Senior HR Specialist', department_id: 'dept-2', level: 'L4', min_salary: 750000, max_salary: 1200000 },
  { id: 'des-3', title: 'Engineering Director', department_id: 'dept-1', level: 'L7', min_salary: 2500000, max_salary: 3800000 },
  { id: 'des-4', title: 'Staff Software Architect', department_id: 'dept-1', level: 'L5', min_salary: 1600000, max_salary: 2400000 },
  { id: 'des-5', title: 'Full-Stack Software Engineer', department_id: 'dept-1', level: 'L3', min_salary: 800000, max_salary: 1400000 },
  { id: 'des-6', title: 'Lead Product Designer', department_id: 'dept-3', level: 'L5', min_salary: 1400000, max_salary: 2100000 },
  { id: 'des-7', title: 'Talent Acquisition Recruiter', department_id: 'dept-2', level: 'L3', min_salary: 600000, max_salary: 950000 },
  { id: 'des-8', title: 'Financial Analyst', department_id: 'dept-5', level: 'L3', min_salary: 700000, max_salary: 1100000 },
];

export const initialProfiles = [
  { id: 'usr-1', email: 'ananya.sharma@nexushr.com', full_name: 'Ananya Sharma', role: 'hr', avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', phone: '+91 98112 34567', status: 'active' },
  { id: 'usr-2', email: 'rohit.verma@nexushr.com', full_name: 'Rohit Verma', role: 'admin', avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', phone: '+91 98223 45678', status: 'active' },
  { id: 'usr-3', email: 'priya.nair@nexushr.com', full_name: 'Priya Nair', role: 'manager', avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', phone: '+91 98334 56789', status: 'active' },
  { id: 'usr-4', email: 'vikram.singh@nexushr.com', full_name: 'Vikram Singh', role: 'employee', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', phone: '+91 98445 67890', status: 'active' },
  { id: 'usr-5', email: 'tanvi.kapoor@nexushr.com', full_name: 'Tanvi Kapoor', role: 'recruiter', avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', phone: '+91 98556 78901', status: 'active' },
  { id: 'usr-6', email: 'arjun.mehta@nexushr.com', full_name: 'Arjun Mehta', role: 'employee', avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', phone: '+91 98667 89012', status: 'active' },
];

export const initialEmployeeRecords = [
  { id: 'emp-1', profile_id: 'usr-1', emp_code: 'NX-001', department_id: 'dept-2', designation_id: 'des-1', reports_to: 'emp-2', date_of_joining: '2022-01-15', employment_type: 'Full-Time', blood_group: 'B+', emergency_contact: '+91 98110 00001', status: 'active' },
  { id: 'emp-2', profile_id: 'usr-2', emp_code: 'NX-002', department_id: 'dept-1', designation_id: 'des-3', reports_to: null, date_of_joining: '2021-03-01', employment_type: 'Full-Time', blood_group: 'O+', emergency_contact: '+91 98220 00002', status: 'active' },
  { id: 'emp-3', profile_id: 'usr-3', emp_code: 'NX-003', department_id: 'dept-3', designation_id: 'des-6', reports_to: 'emp-2', date_of_joining: '2022-06-10', employment_type: 'Full-Time', blood_group: 'A+', emergency_contact: '+91 98330 00003', status: 'active' },
  { id: 'emp-4', profile_id: 'usr-4', emp_code: 'NX-004', department_id: 'dept-1', designation_id: 'des-5', reports_to: 'emp-2', date_of_joining: '2023-08-01', employment_type: 'Full-Time', blood_group: 'AB+', emergency_contact: '+91 98440 00004', status: 'active' },
  { id: 'emp-5', profile_id: 'usr-5', emp_code: 'NX-005', department_id: 'dept-2', designation_id: 'des-7', reports_to: 'emp-1', date_of_joining: '2023-11-15', employment_type: 'Full-Time', blood_group: 'O-', emergency_contact: '+91 98550 00005', status: 'active' },
  { id: 'emp-6', profile_id: 'usr-6', emp_code: 'NX-006', department_id: 'dept-1', designation_id: 'des-4', reports_to: 'emp-2', date_of_joining: '2024-02-01', employment_type: 'Full-Time', blood_group: 'A-', emergency_contact: '+91 98660 00006', status: 'active' },
];

export const initialJobPostings = [
  {
    id: 'job-1',
    title: 'Senior Frontend Engineer (React/Tailwind)',
    department_id: 'dept-1',
    designation_id: 'des-5',
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
    department_id: 'dept-3',
    designation_id: 'des-6',
    employment_type: 'Full-Time',
    location: 'Remote, India',
    experience_required: '5+ Years',
    openings: 1,
    status: 'published',
    salary_range: '₹14,00,000 - ₹20,00,000 PA',
    description: 'Oversee UI/UX design systems, user journey mapping, and usability testing for B2B portal products.',
    posted_date: '2026-10-20',
  },
  {
    id: 'job-3',
    title: 'Financial Planning & Tax Associate',
    department_id: 'dept-5',
    designation_id: 'des-8',
    employment_type: 'Full-Time',
    location: 'Gurugram',
    experience_required: '2-4 Years',
    openings: 2,
    status: 'draft',
    salary_range: '₹7,00,000 - ₹10,00,000 PA',
    description: 'Responsible for statutory tax filings, payroll audits, and financial reporting compliance.',
    posted_date: '2026-11-01',
  },
];

export const initialCandidates = [
  { id: 'cand-1', first_name: 'Siddharth', last_name: 'Rao', email: 'siddharth.rao@example.com', phone: '+91 99112 88291', skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'], experience_years: 5, status: 'interviewing' },
  { id: 'cand-2', first_name: 'Meera', last_name: 'Iyer', email: 'meera.iyer@example.com', phone: '+91 99223 77382', skills: ['Figma', 'Design Systems', 'User Research'], experience_years: 6, status: 'offered' },
  { id: 'cand-3', first_name: 'Kabir', last_name: 'Dutta', email: 'kabir.dutta@example.com', phone: '+91 99334 66473', skills: ['React', 'Next.js', 'Tailwind CSS'], experience_years: 3, status: 'screening' },
  { id: 'cand-4', first_name: 'Sneha', last_name: 'Bose', email: 'sneha.bose@example.com', phone: '+91 99445 55564', skills: ['Talent Sourcing', 'ATS', 'Campus Hiring'], experience_years: 4, status: 'hired' },
];

export const initialApplications = [
  { id: 'app-1', candidate_id: 'cand-1', job_posting_id: 'job-1', applied_date: '2026-10-18', status: 'interview', rating: 4.8, notes: 'Strong architectural fundamentals in React 19.' },
  { id: 'app-2', candidate_id: 'cand-2', job_posting_id: 'job-2', applied_date: '2026-10-22', status: 'offered', rating: 4.9, notes: 'Outstanding design portfolio and systems experience.' },
  { id: 'app-3', candidate_id: 'cand-3', job_posting_id: 'job-1', applied_date: '2026-10-25', status: 'screening', rating: 3.8, notes: 'Good profile, pending technical screening call.' },
];

export const initialInterviews = [
  {
    id: 'int-1',
    application_id: 'app-1',
    interviewer_id: 'emp-2',
    scheduled_at: '2026-11-06T14:30:00Z',
    duration_minutes: 60,
    mode: 'Video',
    meet_link: 'https://meet.google.com/hr-tech-eval',
    status: 'scheduled',
    feedback: 'Scheduled technical deep-dive round.',
    score: null,
  },
  {
    id: 'int-2',
    application_id: 'app-2',
    interviewer_id: 'emp-3',
    scheduled_at: '2026-10-28T11:00:00Z',
    duration_minutes: 45,
    mode: 'Video',
    meet_link: 'https://meet.google.com/design-review',
    status: 'completed',
    feedback: 'Candidate demonstrated exemplary empathy for B2B users and clear design tokens architecture.',
    score: 9.5,
  },
];

export const initialOfferLetters = [
  {
    id: 'off-1',
    application_id: 'app-2',
    candidate_id: 'cand-2',
    designation_id: 'des-6',
    offered_salary: 1750000,
    joining_date: '2026-12-01',
    expiry_date: '2026-11-15',
    status: 'sent',
  },
];

export const initialOnboarding = [
  {
    id: 'onb-1',
    candidate_id: 'cand-4',
    employee_id: 'emp-5',
    status: 'completed',
    start_date: '2026-11-01',
    completion_date: '2026-11-04',
    checklist_items: [
      { task: 'ID Verification & Aadhaar / PAN KYC', done: true },
      { task: 'Company Laptop & Hardware Provisioning', done: true },
      { task: 'Email & Slack Workspace Credentials', done: true },
      { task: 'HR Induction & Code of Conduct Briefing', done: true },
    ]
  }
];

export const initialAttendance = [
  { id: 'att-1', employee_id: 'emp-1', date: '2026-11-04', punch_in: '09:05:12', punch_out: '18:12:00', work_hours: 9.1, status: 'present', overtime_hours: 0.1 },
  { id: 'att-2', employee_id: 'emp-2', date: '2026-11-04', punch_in: '08:58:30', punch_out: '18:45:00', work_hours: 9.7, status: 'present', overtime_hours: 0.7 },
  { id: 'att-3', employee_id: 'emp-3', date: '2026-11-04', punch_in: '09:30:15', punch_out: '18:30:00', work_hours: 9.0, status: 'late', overtime_hours: 0.0 },
  { id: 'att-4', employee_id: 'emp-4', date: '2026-11-04', punch_in: '09:00:00', punch_out: null, work_hours: 5.5, status: 'present', overtime_hours: 0.0 },
  { id: 'att-5', employee_id: 'emp-6', date: '2026-11-04', punch_in: null, punch_out: null, work_hours: 0, status: 'on_leave', overtime_hours: 0 },
  { id: 'att-6', employee_id: 'emp-4', date: '2026-11-03', punch_in: '09:02:10', punch_out: '18:15:30', work_hours: 9.2, status: 'present', overtime_hours: 0.2 },
  { id: 'att-7', employee_id: 'emp-1', date: '2026-11-03', punch_in: '09:12:00', punch_out: '18:05:00', work_hours: 8.8, status: 'present', overtime_hours: 0.0 },
];

export const initialLeaveBalances = [
  { id: 'lb-1', employee_id: 'emp-1', year: 2026, casual_leave: 8, sick_leave: 10, earned_leave: 15, maternity_paternity_leave: 30 },
  { id: 'lb-2', employee_id: 'emp-2', year: 2026, casual_leave: 10, sick_leave: 12, earned_leave: 20, maternity_paternity_leave: 15 },
  { id: 'lb-3', employee_id: 'emp-3', year: 2026, casual_leave: 7, sick_leave: 8, earned_leave: 14, maternity_paternity_leave: 0 },
  { id: 'lb-4', employee_id: 'emp-4', year: 2026, casual_leave: 6, sick_leave: 9, earned_leave: 12, maternity_paternity_leave: 0 },
  { id: 'lb-5', employee_id: 'emp-6', year: 2026, casual_leave: 5, sick_leave: 4, earned_leave: 10, maternity_paternity_leave: 0 },
];

export const initialLeaveRequests = [
  {
    id: 'lr-1',
    employee_id: 'emp-6',
    leave_type: 'Sick Leave',
    start_date: '2026-11-04',
    end_date: '2026-11-05',
    total_days: 2,
    reason: 'Viral fever and prescribed medical rest.',
    status: 'approved',
    approver_id: 'emp-2',
    comments: 'Approved. Take care and recover soon.',
  },
  {
    id: 'lr-2',
    employee_id: 'emp-4',
    leave_type: 'Casual Leave',
    start_date: '2026-11-12',
    end_date: '2026-11-14',
    total_days: 3,
    reason: 'Family wedding event in hometown.',
    status: 'pending',
    approver_id: 'emp-2',
    comments: null,
  },
  {
    id: 'lr-3',
    employee_id: 'emp-3',
    leave_type: 'Earned Leave',
    start_date: '2026-12-24',
    end_date: '2026-12-31',
    total_days: 6,
    reason: 'Year-end vacation with family.',
    status: 'pending',
    approver_id: 'emp-2',
    comments: null,
  },
];

export const initialSalaryStructures = [
  { id: 'sal-1', designation_id: 'des-1', base_salary: 110000, hra: 45000, transport_allowance: 8000, medical_allowance: 5000, special_allowance: 25000 },
  { id: 'sal-2', designation_id: 'des-3', base_salary: 140000, hra: 55000, transport_allowance: 10000, medical_allowance: 5000, special_allowance: 40000 },
  { id: 'sal-3', designation_id: 'des-5', base_salary: 60000, hra: 24000, transport_allowance: 4000, medical_allowance: 3000, special_allowance: 15000 },
  { id: 'sal-4', designation_id: 'des-6', base_salary: 85000, hra: 34000, transport_allowance: 6000, medical_allowance: 4000, special_allowance: 21000 },
  { id: 'sal-5', designation_id: 'des-7', base_salary: 42000, hra: 17000, transport_allowance: 3000, medical_allowance: 2000, special_allowance: 8000 },
  { id: 'sal-6', designation_id: 'des-4', base_salary: 105000, hra: 42000, transport_allowance: 8000, medical_allowance: 4000, special_allowance: 26000 },
];

export const initialDeductionRules = [
  { id: 'ded-1', name: 'Provident Fund (EPF)', deduction_type: 'percentage', value: 12, applies_to: 'base_salary', is_mandatory: true },
  { id: 'ded-2', name: 'Professional Tax (PT)', deduction_type: 'fixed', value: 200, applies_to: 'gross_salary', is_mandatory: true },
  { id: 'ded-3', name: 'Tax Deducted at Source (TDS)', deduction_type: 'percentage', value: 10, applies_to: 'taxable_income', is_mandatory: true },
  { id: 'ded-4', name: 'Health Insurance Premium', deduction_type: 'fixed', value: 1250, applies_to: 'gross_salary', is_mandatory: false },
];

export const initialPayroll = [
  { id: 'pay-1', payroll_month: 10, payroll_year: 2026, total_disbursed: 684500, status: 'disbursed', processed_at: '2026-10-31T17:00:00Z', processed_by: 'emp-1' },
  { id: 'pay-2', payroll_month: 11, payroll_year: 2026, total_disbursed: 712000, status: 'draft', processed_at: null, processed_by: null },
];

export const initialPayrollDeductions = [
  { id: 'pd-1', payroll_id: 'pay-1', employee_id: 'emp-4', rule_id: 'ded-1', amount: 7200, note: 'EPF 12% deduction on basic' },
  { id: 'pd-2', payroll_id: 'pay-1', employee_id: 'emp-4', rule_id: 'ded-2', amount: 200, note: 'State professional tax' },
  { id: 'pd-3', payroll_id: 'pay-1', employee_id: 'emp-4', rule_id: 'ded-3', amount: 6500, note: 'Estimated TDS bracket' },
  { id: 'pd-4', payroll_id: 'pay-1', employee_id: 'emp-4', rule_id: 'ded-4', amount: 1250, note: 'Group health insurance' },
];

export const initialPayslips = [
  {
    id: 'ps-1',
    payroll_id: 'pay-1',
    employee_id: 'emp-4',
    basic_salary: 60000,
    total_allowances: 46000,
    total_deductions: 15150,
    net_salary: 90850,
    payment_status: 'paid',
    payslip_url: '#',
    generated_at: '2026-10-31T18:00:00Z'
  },
  {
    id: 'ps-2',
    payroll_id: 'pay-1',
    employee_id: 'emp-1',
    basic_salary: 110000,
    total_allowances: 83000,
    total_deductions: 28400,
    net_salary: 164600,
    payment_status: 'paid',
    payslip_url: '#',
    generated_at: '2026-10-31T18:00:00Z'
  },
  {
    id: 'ps-3',
    payroll_id: 'pay-1',
    employee_id: 'emp-3',
    basic_salary: 85000,
    total_allowances: 65000,
    total_deductions: 21800,
    net_salary: 128200,
    payment_status: 'paid',
    payslip_url: '#',
    generated_at: '2026-10-31T18:00:00Z'
  }
];

export const initialGrievances = [
  {
    id: 'grv-1',
    ticket_no: 'GRV-2026-081',
    employee_id: 'emp-4',
    category: 'Workplace Ergonomics',
    subject: 'Request for Ergonomic Chair and Monitor Arm',
    description: 'Experiencing continuous lower back strain due to worn-out seating at Workstation 4B. Requesting ergonomic replacement.',
    priority: 'medium',
    status: 'in_progress',
    filed_at: '2026-10-28T10:15:00Z',
  },
  {
    id: 'grv-2',
    ticket_no: 'GRV-2026-074',
    employee_id: 'emp-6',
    category: 'Payroll & Reimbursements',
    subject: 'October Overtime & Travel Allowance Discrepancy',
    description: 'The client site travel allowance of ₹4,200 for October 14-16 was omitted from the October salary disbursement.',
    priority: 'high',
    status: 'resolved',
    filed_at: '2026-10-30T14:20:00Z',
  },
  {
    id: 'grv-3',
    ticket_no: 'GRV-2026-092',
    employee_id: 'emp-3',
    category: 'Policy & Workplace Culture',
    subject: 'Flexible Core Working Hours Discussion',
    description: 'Requesting clarification on shifting daily core hours to accommodate international client timezones without triggering late clock-in flags.',
    priority: 'low',
    status: 'under_review',
    filed_at: '2026-11-02T09:45:00Z',
  }
];

export const initialGrievanceCommunications = [
  {
    id: 'gc-1',
    grievance_id: 'grv-1',
    sender_id: 'emp-1',
    message: 'Hello Vikram, we have noted your ticket. Our IT and Facilities team has been assigned to inspect workstation 4B tomorrow morning.',
    timestamp: '2026-10-29T11:00:00Z',
    is_internal_note: false
  },
  {
    id: 'gc-2',
    grievance_id: 'grv-1',
    sender_id: 'emp-4',
    message: 'Thank you Ananya, looking forward to the replacement.',
    timestamp: '2026-10-29T11:45:00Z',
    is_internal_note: false
  },
  {
    id: 'gc-3',
    grievance_id: 'grv-2',
    sender_id: 'emp-1',
    message: 'Verified with finance department. The ₹4,200 voucher was cleared after the payroll cutoff date and will be credited as an adjustment in the November payout.',
    timestamp: '2026-11-01T15:30:00Z',
    is_internal_note: false
  }
];

export const initialGrievanceResolutions = [
  {
    id: 'gr-1',
    grievance_id: 'grv-2',
    resolved_by: 'emp-1',
    resolution_summary: 'Discrepancy acknowledged. Travel allowance added to November supplementary credit run.',
    action_taken: 'Manual adjustment voucher #VCH-9812 logged in payroll records.',
    employee_feedback: 'Satisfied with the quick response.',
    resolved_at: '2026-11-02T16:00:00Z'
  }
];

export const initialMessagesNotifications = [
  {
    id: 'notif-1',
    recipient_id: 'usr-1',
    sender_id: 'usr-4',
    title: 'New Leave Application',
    content: 'Vikram Singh has submitted a Casual Leave request for 3 days (Nov 12 - Nov 14).',
    type: 'alert',
    is_read: false,
    created_at: '2026-11-04T10:00:00Z'
  },
  {
    id: 'notif-2',
    recipient_id: 'usr-4',
    sender_id: 'usr-1',
    title: 'October Payslip Ready',
    content: 'Your payslip for October 2026 has been generated and is ready for download.',
    type: 'task',
    is_read: true,
    created_at: '2026-10-31T18:05:00Z'
  },
  {
    id: 'notif-3',
    recipient_id: null, // broadcast
    sender_id: 'usr-2',
    title: 'Townhall & Annual Review Meeting',
    content: 'All-hands quarterly briefing is scheduled for Friday at 4:00 PM IST in the Main Auditorium & online.',
    type: 'announcement',
    is_read: false,
    created_at: '2026-11-03T11:00:00Z'
  },
  {
    id: 'notif-4',
    recipient_id: 'usr-1',
    sender_id: 'usr-5',
    title: 'Candidate Interview Completed',
    content: 'Meera Iyer completed the Lead Product Designer review with a 9.5 rating.',
    type: 'task',
    is_read: false,
    created_at: '2026-10-28T12:00:00Z'
  }
];
