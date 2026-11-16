// High-fidelity Dataset representing the 22 database tables of the HRMS
// Schema strictly matches the live PostgreSQL / Supabase table columns

export const initialDepartments = [
  { department_id: 101, department_name: 'IT & Software Development', description: 'Handles software and IT operations', created_at: '2026-11-04T15:14:19.102285+00:00' },
  { department_id: 102, department_name: 'HR & Administration', description: 'Handles human resources and admin', created_at: '2026-11-04T15:14:19.102285+00:00' },
];

export const initialDesignations = [
  { designation_id: 201, designation_name: 'Software Developer', department_id: 101, description: 'Software Developer role' },
  { designation_id: 202, designation_name: 'HR Executive', department_id: 102, description: 'Handles HR and recruitment activities' },
  { designation_id: 203, designation_name: 'Admin', department_id: 102, description: 'Administrative operations' },
  { designation_id: 204, designation_name: 'Vice President', department_id: 101, description: 'Executive leadership' },
];

// All 30 Employee Records directly matching the user's Supabase employee_records table
export const initialEmployeeRecords = [
  { employee_id: 'EMP001', first_name: 'Rahul', last_name: 'Sharma', email: 'rahul@example.com', department_id: 101, designation_id: 204, manager_id: null, joining_date: '2025-06-01', employment_type: 'Full-time', phone: '9876543210', gender: 'Male', date_of_birth: '2002-05-12' },
  { employee_id: 'EMP002', first_name: 'Priya', last_name: 'Verma', email: 'priya@example.com', department_id: 102, designation_id: 202, manager_id: 'EMP001', joining_date: '2025-07-10', employment_type: 'Full-time', phone: '9876543211', gender: 'Female', date_of_birth: '2001-08-15' },
  { employee_id: 'EMP003', first_name: 'Aman', last_name: 'Gupta', email: 'aman@example.com', department_id: 102, designation_id: 203, manager_id: 'EMP001', joining_date: '2025-08-01', employment_type: 'Full-time', phone: '9876543212', gender: 'Male', date_of_birth: '2000-01-20' },
  { employee_id: 'EMP004', first_name: 'Sneha', last_name: 'Mehta', email: 'sneha@example.com', department_id: 102, designation_id: 203, manager_id: 'EMP001', joining_date: '2025-08-15', employment_type: 'Full-time', phone: '9876543213', gender: 'Female', date_of_birth: '2001-04-10' },
  { employee_id: 'EMP005', first_name: 'Rohan', last_name: 'Kapoor', email: 'rohan@example.com', department_id: 101, designation_id: 201, manager_id: 'EMP001', joining_date: '2023-08-01', employment_type: 'Full-time', phone: '9000000005', gender: 'Male', date_of_birth: '1999-11-05' },
  { employee_id: 'EMP006', first_name: 'Ananya', last_name: 'Singh', email: 'ananya@example.com', department_id: 101, designation_id: 201, manager_id: 'EMP001', joining_date: '2023-09-01', employment_type: 'Full-time', phone: '9000000006', gender: 'Female', date_of_birth: '2000-03-14' },
  { employee_id: 'EMP007', first_name: 'Karan', last_name: 'Malhotra', email: 'karan@example.com', department_id: 101, designation_id: 201, manager_id: 'EMP001', joining_date: '2023-10-01', employment_type: 'Full-time', phone: '9000000007', gender: 'Male', date_of_birth: '1998-07-22' },
  { employee_id: 'EMP008', first_name: 'Ishita', last_name: 'Sharma', email: 'ishita@example.com', department_id: 101, designation_id: 201, manager_id: 'EMP001', joining_date: '2023-11-01', employment_type: 'Full-time', phone: '9000000008', gender: 'Female', date_of_birth: '2001-09-18' },
  { employee_id: 'EMP009', first_name: 'Arjun', last_name: 'Verma', email: 'arjun@example.com', department_id: 101, designation_id: 201, manager_id: 'EMP001', joining_date: '2024-01-05', employment_type: 'Full-time', phone: '9000000009', gender: 'Male', date_of_birth: '1999-12-04' },
  { employee_id: 'EMP010', first_name: 'Meera', last_name: 'Joshi', email: 'meera@example.com', department_id: 101, designation_id: 201, manager_id: 'EMP001', joining_date: '2024-02-10', employment_type: 'Full-time', phone: '9000000010', gender: 'Female', date_of_birth: '2000-06-11' },
  { employee_id: 'EMP011', first_name: 'Kavya', last_name: 'Mishra', email: 'kavya@example.com', department_id: 101, designation_id: 201, manager_id: 'EMP001', joining_date: '2024-04-10', employment_type: 'Full-time', phone: '9000000011', gender: 'Female', date_of_birth: '2001-02-11' },
  { employee_id: 'EMP012', first_name: 'Vivek', last_name: 'Saxena', email: 'vivek@example.com', department_id: 101, designation_id: 201, manager_id: 'EMP001', joining_date: '2023-07-15', employment_type: 'Full-time', phone: '9000000012', gender: 'Male', date_of_birth: '1999-08-19' },
  { employee_id: 'EMP013', first_name: 'Riya', last_name: 'Chauhan', email: 'riya@example.com', department_id: 101, designation_id: 201, manager_id: 'EMP001', joining_date: '2025-02-01', employment_type: 'Part-time', phone: '9000000013', gender: 'Female', date_of_birth: '2002-05-23' },
  { employee_id: 'EMP014', first_name: 'Aditya', last_name: 'Bansal', email: 'aditya@example.com', department_id: 101, designation_id: 201, manager_id: 'EMP001', joining_date: '2024-05-10', employment_type: 'Full-time', phone: '9000000014', gender: 'Male', date_of_birth: '1997-10-15' },
  { employee_id: 'EMP015', first_name: 'Pooja', last_name: 'Agarwal', email: 'pooja@example.com', department_id: 101, designation_id: 201, manager_id: 'EMP001', joining_date: '2024-06-01', employment_type: 'Full-time', phone: '9000000015', gender: 'Female', date_of_birth: '1998-01-25' },
  { employee_id: 'EMP016', first_name: 'Siddharth', last_name: 'Rao', email: 'siddharth@example.com', department_id: 101, designation_id: 201, manager_id: 'EMP001', joining_date: '2024-06-15', employment_type: 'Full-time', phone: '9000000016', gender: 'Male', date_of_birth: '1996-06-30' },
  { employee_id: 'EMP017', first_name: 'Nisha', last_name: 'Kapoor', email: 'nisha@example.com', department_id: 101, designation_id: 201, manager_id: 'EMP001', joining_date: '2024-07-01', employment_type: 'Full-time', phone: '9000000017', gender: 'Female', date_of_birth: '1999-02-14' },
  { employee_id: 'EMP018', first_name: 'Rahul', last_name: 'Yadav', email: 'rahul.y@example.com', department_id: 101, designation_id: 201, manager_id: 'EMP001', joining_date: '2024-07-15', employment_type: 'Full-time', phone: '9000000018', gender: 'Male', date_of_birth: '1998-04-09' },
  { employee_id: 'EMP019', first_name: 'Simran', last_name: 'Kaur', email: 'simran@example.com', department_id: 101, designation_id: 201, manager_id: 'EMP001', joining_date: '2024-08-01', employment_type: 'Full-time', phone: '9000000019', gender: 'Female', date_of_birth: '2002-09-08' },
  { employee_id: 'EMP020', first_name: 'Dev', last_name: 'Malik', email: 'dev@example.com', department_id: 101, designation_id: 201, manager_id: 'EMP001', joining_date: '2024-08-15', employment_type: 'Full-time', phone: '9000000020', gender: 'Male', date_of_birth: '1998-04-17' },
  { employee_id: 'EMP021', first_name: 'Neha', last_name: 'Sharma', email: 'neha.sharma@example.com', department_id: 101, designation_id: 201, manager_id: 'EMP001', joining_date: '2024-09-01', employment_type: 'Full-time', phone: '9000000021', gender: 'Female', date_of_birth: '2000-05-12' },
  { employee_id: 'EMP022', first_name: 'Aarav', last_name: 'Verma', email: 'aarav.verma@example.com', department_id: 101, designation_id: 201, manager_id: 'EMP001', joining_date: '2024-09-15', employment_type: 'Full-time', phone: '9000000022', gender: 'Male', date_of_birth: '1999-12-03' },
  { employee_id: 'EMP023', first_name: 'Diya', last_name: 'Kapoor', email: 'diya.kapoor@example.com', department_id: 101, designation_id: 201, manager_id: 'EMP001', joining_date: '2024-10-01', employment_type: 'Full-time', phone: '9000000023', gender: 'Female', date_of_birth: '2001-07-19' },
  { employee_id: 'EMP024', first_name: 'Kabir', last_name: 'Malhotra', email: 'kabir.malhotra@example.com', department_id: 101, designation_id: 201, manager_id: 'EMP001', joining_date: '2024-10-15', employment_type: 'Full-time', phone: '9000000024', gender: 'Male', date_of_birth: '1997-03-11' },
  { employee_id: 'EMP025', first_name: 'Sanya', last_name: 'Gupta', email: 'sanya.gupta@example.com', department_id: 101, designation_id: 201, manager_id: 'EMP001', joining_date: '2024-11-01', employment_type: 'Full-time', phone: '9000000025', gender: 'Female', date_of_birth: '2000-10-24' },
  { employee_id: 'EMP026', first_name: 'Ishaan', last_name: 'Mehta', email: 'ishaan.mehta@example.com', department_id: 101, designation_id: 201, manager_id: 'EMP001', joining_date: '2024-11-15', employment_type: 'Full-time', phone: '9000000026', gender: 'Male', date_of_birth: '1998-02-16' },
  { employee_id: 'EMP027', first_name: 'Tanya', last_name: 'Singh', email: 'tanya.singh@example.com', department_id: 101, designation_id: 201, manager_id: 'EMP001', joining_date: '2024-12-01', employment_type: 'Full-time', phone: '9000000027', gender: 'Female', date_of_birth: '2001-08-08' },
  { employee_id: 'EMP028', first_name: 'Yash', last_name: 'Arora', email: 'yash.arora@example.com', department_id: 101, designation_id: 201, manager_id: 'EMP001', joining_date: '2024-12-15', employment_type: 'Full-time', phone: '9000000028', gender: 'Male', date_of_birth: '1999-06-14' },
  { employee_id: 'EMP029', first_name: 'Manya', last_name: 'Joshi', email: 'manya.joshi@example.com', department_id: 101, designation_id: 201, manager_id: 'EMP001', joining_date: '2025-01-05', employment_type: 'Full-time', phone: '9000000029', gender: 'Female', date_of_birth: '2002-01-30' },
  { employee_id: 'EMP030', first_name: 'Reyansh', last_name: 'Kumar', email: 'reyansh.kumar@example.com', department_id: 101, designation_id: 201, manager_id: 'EMP001', joining_date: '2025-01-20', employment_type: 'Full-time', phone: '9000000030', gender: 'Male', date_of_birth: '2000-11-21' }
];

export const initialProfiles = initialEmployeeRecords.map((emp) => {
  let role = 'Employee';
  if (emp.designation_id === 204) role = 'Admin';
  else if (emp.designation_id === 203) role = 'Admin';
  else if (emp.designation_id === 202) role = 'HR';

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
  { attendance_id: 'att-1', employee_id: 'EMP001', check_in: '09:00', check_out: '18:00', status: 'present' },
];

export const initialLeaveBalances = [
  { balance_id: 'bal-1', employee_id: 'EMP001', leave_type: 'Paid Leave', year: 2026 },
];

export const initialLeaveRequests = [
  { request_id: 'req-1', employee_id: 'EMP001', leave_type: 'Casual Leave', start_date: '2026-11-15', end_date: '2026-11-16', reason: 'Family event', status: 'approved' },
];

export const initialPayroll = [
  { payroll_id: 1, employee_id: 'EMP001', basic_salary: 30000, allowances: 17000, net_salary: 47000, payment_status: 'Paid' },
];

export const initialPayslips = [
  { payslip_id: 1, payroll_id: 1, remarks: 'October 2026 monthly payslip' },
];

export const initialGrievances = [
  { grievance_id: 1, employee_id: 'EMP001', category: 'Payroll', subject: 'Salary Inquiry', status: 'Resolved' },
];

export const initialJobPostings = [];
export const initialCandidates = [];
export const initialApplications = [];
export const initialInterviews = [];
export const initialOfferLetters = [];
export const initialOnboarding = [];
export const initialSalaryStructures = [];
export const initialDeductionRules = [];
export const initialPayrollDeductions = [];
export const initialGrievanceCommunications = [];
export const initialGrievanceResolutions = [];
export const initialMessagesNotifications = [];

export const initialReportsAnalytics = [
  {
    report_id: "91e632bf-3903-4e2a-9bd8-81190f626a6f",
    report_name: "Employee Performance Summary",
    report_type: "performance",
    generated_by: null,
    report_period_start: "2026-07-01",
    report_period_end: "2026-09-30",
    report_data: {
      description: "Quarterly employee performance overview",
      reviewer_id: "EMP001",
      review_period: "Q3 2026",
      average_rating: 4.3,
      total_employees: 30,
      average_progress: 86.5
    },
    generated_at: "2026-11-15T09:12:04.575581+00:00"
  },
  {
    report_id: "216c8257-2633-432b-8e9c-6823d02edba9",
    report_name: "Attendance Summary",
    report_type: "attendance",
    generated_by: null,
    report_period_start: "2026-07-01",
    report_period_end: "2026-09-30",
    report_data: {
      metrics: [
        "Present days",
        "Absent days",
        "Late arrivals",
        "Attendance percentage"
      ],
      description: "Quarterly employee attendance report",
      report_category: "Attendance"
    },
    generated_at: "2026-11-15T09:12:04.575581+00:00"
  },
  {
    report_id: "253b81ca-5d50-4d75-83d6-e2445d194bf1",
    report_name: "Payroll Summary",
    report_type: "payroll",
    generated_by: null,
    report_period_start: "2026-07-01",
    report_period_end: "2026-09-30",
    report_data: {
      metrics: [
        "Gross salary",
        "Net salary",
        "Total deductions",
        "Payment status"
      ],
      description: "Quarterly payroll and salary overview",
      report_category: "Payroll"
    },
    generated_at: "2026-11-15T09:12:04.575581+00:00"
  },
  {
    report_id: "9d036f16-f53b-49d6-824f-153c2436c2d0",
    report_name: "Recruitment Summary",
    report_type: "recruitment",
    generated_by: null,
    report_period_start: "2026-07-01",
    report_period_end: "2026-09-30",
    report_data: {
      metrics: [
        "Total applications",
        "Applications shortlisted",
        "Interviews conducted",
        "Candidates selected"
      ],
      description: "Quarterly recruitment activity overview",
      report_category: "Recruitment"
    },
    generated_at: "2026-11-15T09:12:04.575581+00:00"
  },
  {
    report_id: "d381b374-b4bd-4e05-8585-ebc8cb6cad8d",
    report_name: "Management Overview",
    report_type: "management",
    generated_by: null,
    report_period_start: "2026-07-01",
    report_period_end: "2026-09-30",
    report_data: {
      description: "Consolidated HRMS management overview",
      report_category: "Management",
      modules_included: [
        "Employee Management",
        "Attendance",
        "Payroll",
        "Recruitment",
        "Performance"
      ]
    },
    generated_at: "2026-11-15T09:12:04.575581+00:00"
  }
];

