-- ==============================================================================
-- NexusHR PostgreSQL / Supabase Schema Reference & Sample Data Seeder
-- Run this in your Supabase Dashboard SQL Editor (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. Insert Departments (if not existing)
INSERT INTO departments (department_id, department_name, description) VALUES
('dept-eng', 'Engineering & Technology', 'Core software engineering, QA, DevOps, and cloud infrastructure.'),
('dept-hr', 'Human Resources', 'Talent acquisition, employee engagement, HR compliance, and payroll.'),
('dept-prd', 'Product & UX Design', 'Product roadmap strategy, UX research, UI design, and analytics.'),
('dept-mkt', 'Sales & Marketing', 'B2B client acquisition, digital marketing campaigns, and brand growth.'),
('dept-fin', 'Finance & Accounts', 'Financial auditing, payroll disbursement, corporate taxation, and budgets.')
ON CONFLICT (department_id) DO NOTHING;

-- 2. Insert Designations (if not existing)
INSERT INTO designations (designation_id, designation_name, description) VALUES
('des-hr-vp', 'VP of Human Resources', 'Leads global people operations and organizational development.'),
('des-hr-spec', 'Senior HR Specialist', 'Specializes in employee relations, policies, and retention.'),
('des-eng-dir', 'Engineering Director', 'Directs overall technical architecture and engineering delivery.'),
('des-swe', 'Full-Stack Software Engineer', 'Builds scalable frontend and backend enterprise applications.'),
('des-des', 'Lead Product Designer', 'Designs end-to-end user workflows and interface design systems.'),
('des-rec', 'Talent Acquisition Recruiter', 'Manages candidate sourcing, interviews, and offer rollouts.')
ON CONFLICT (designation_id) DO NOTHING;

-- 3. Insert Employee Records into employee_records table
INSERT INTO employee_records (
    employee_id, first_name, last_name, email, department_id, designation_id, 
    manager_id, joining_date, employment_type, phone, address, emergency_contact, gender, date_of_birth
) VALUES
('EMP-1001', 'Ananya', 'Sharma', 'ananya.sharma@nexushr.com', 'dept-hr', 'des-hr-vp', NULL, '2022-01-15', 'Full-Time', '+91 98112 34567', 'New Delhi, India', '+91 98110 00001', 'Female', '1988-04-12'),
('EMP-1002', 'Rohit', 'Verma', 'rohit.verma@nexushr.com', 'dept-eng', 'des-eng-dir', NULL, '2021-03-01', 'Full-Time', '+91 98223 45678', 'Noida, India', '+91 98220 00002', 'Male', '1985-08-20'),
('EMP-1003', 'Priya', 'Nair', 'priya.nair@nexushr.com', 'dept-prd', 'des-des', 'EMP-1002', '2022-06-10', 'Full-Time', '+91 98334 56789', 'Gurugram, India', '+91 98330 00003', 'Female', '1990-11-05'),
('EMP-1004', 'Vikram', 'Singh', 'vikram.singh@nexushr.com', 'dept-eng', 'des-swe', 'EMP-1002', '2023-08-01', 'Full-Time', '+91 98445 67890', 'South Delhi, India', '+91 98440 00004', 'Male', '1995-02-17'),
('EMP-1005', 'Tanvi', 'Kapoor', 'tanvi.kapoor@nexushr.com', 'dept-hr', 'des-rec', 'EMP-1001', '2023-11-15', 'Full-Time', '+91 98556 78901', 'Faridabad, India', '+91 98550 00005', 'Female', '1994-07-28'),
('EMP-1006', 'Arjun', 'Mehta', 'arjun.mehta@nexushr.com', 'dept-eng', 'des-swe', 'EMP-1002', '2024-02-01', 'Full-Time', '+91 98667 89012', 'West Delhi, India', '+91 98660 00006', 'Male', '1997-09-14')
ON CONFLICT (employee_id) DO NOTHING;

-- 4. Insert Profiles into profiles table (linked by employee_id)
INSERT INTO profiles (id, employee_id, email, full_name, role) VALUES
('11111111-1111-1111-1111-111111111111', 'EMP-1001', 'ananya.sharma@nexushr.com', 'Ananya Sharma', 'hr'),
('22222222-2222-2222-2222-222222222222', 'EMP-1002', 'rohit.verma@nexushr.com', 'Rohit Verma', 'admin'),
('33333333-3333-3333-3333-333333333333', 'EMP-1003', 'priya.nair@nexushr.com', 'Priya Nair', 'manager'),
('44444444-4444-4444-4444-444444444444', 'EMP-1004', 'vikram.singh@nexushr.com', 'Vikram Singh', 'employee'),
('55555555-5555-5555-5555-555555555555', 'EMP-1005', 'tanvi.kapoor@nexushr.com', 'Tanvi Kapoor', 'recruiter'),
('66666666-6666-6666-6666-666666666666', 'EMP-1006', 'arjun.mehta@nexushr.com', 'Arjun Mehta', 'employee')
ON CONFLICT (id) DO NOTHING;

-- 5. RLS Public Read Access Policy (Allow anon read on verified tables)
ALTER TABLE employee_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE designations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Allow public select on employee_records" ON employee_records FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow public select on profiles" ON profiles FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow public select on departments" ON departments FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow public select on designations" ON designations FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
