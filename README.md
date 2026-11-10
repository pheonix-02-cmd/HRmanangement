# NexusHR — Enterprise Human Resource Management System (HRMS)

> A modern, integrated single-page enterprise HRMS built for **Delhi University Sem V Software Engineering Course Project**, backed by a unified **22-table database schema** and integrated with **Supabase**.

---

## 🌟 Key Features

1. **Flowy & Ultra-Professional UI**:
   - Built with Tailwind CSS, glassmorphism cards, and fluid animations.
   - **Full Light and Dark Theme Support** with instant switching and local persistence.
2. **22-Table Architecture**:
   - Zero duplication across all 22 required database tables.
   - Comprehensive PostgreSQL / Supabase DDL schema with foreign keys, indexes, triggers, and Row-Level Security (RLS) policies.
3. **Live Supabase Synchronization + Intelligent Fallback**:
   - Configured with project URL: `https://czifnqksfzuxhpdlrvwy.supabase.co`.
   - In-app connection manager to test and paste your `VITE_SUPABASE_ANON_KEY`.
   - Rich interactive demo dataset ensures smooth evaluation even before the database key is supplied.
4. **Persona & Role-Based Access Control (RBAC)**:
   - Instant 1-click persona switcher in the navbar to test perspectives:
     - 👑 **Super Admin** (Rohit Verma — Director)
     - 💼 **HR Manager** (Ananya Sharma — VP of HR)
     - 👥 **Department Manager** (Priya Nair — Lead Product Designer)
     - 💻 **Employee** (Vikram Singh — Software Engineer)
     - 🎯 **Talent Recruiter** (Tanvi Kapoor — Talent Acquisition)

---

## 🗄️ Unified 22-Table Schema Mapping

| # | Database Table | Module | Primary Purpose & Integration |
|---|---|---|---|
| 1 | `departments` | Org Structure | Enterprise organizational divisions and annual budgets |
| 2 | `designations` | Org Structure | Career ladder, levels (L1–L7), and pay bands |
| 3 | `profiles` | Employees / Auth | User identities, roles, avatar images, contact info |
| 4 | `employee_records` | Employees | Core employee master records, reporting manager (`reports_to`), KYC |
| 5 | `job_postings` | Recruitment | Open requisitions, department allocations, salary ranges |
| 6 | `candidates` | Recruitment | Talent applicant profiles, resumes, and skill tags |
| 7 | `applications` | Recruitment | Candidate applications linked to job requisitions |
| 8 | `interviews` | Recruitment | Interview schedules, meeting links, scores, and feedback |
| 9 | `offer_letters` | Recruitment | CTC proposals, joining dates, and acceptance workflows |
| 10 | `onboarding` | Recruitment | New hire onboarding checklists and provisioning status |
| 11 | `attendance` | Attendance | Clock In / Out timestamps, work duration, overtime hours |
| 12 | `leave_balance` | Leave Mgmt | Annual entitlements for Casual, Sick, and Earned leaves |
| 13 | `leave_requests` | Leave Mgmt | Leave filing, manager approval/rejection workflows |
| 14 | `salary_structures` | Payroll | Base salary, HRA, transport, medical, and special allowances |
| 15 | `deduction_rules` | Payroll | Statutory rules for EPF (12%), Professional Tax, and TDS |
| 16 | `payroll` | Payroll | Monthly disbursement runs and total payout aggregates |
| 17 | `payroll_deductions` | Payroll | Per-employee deductions applied to payroll runs |
| 18 | `payslips` | Payroll | Generated monthly payslips with printable PDF/HTML view |
| 19 | `grievances` | Grievance | Confidential employee relations tickets and priority tracking |
| 20 | `grievance_communications` | Grievance | Audit trail and discussion messages between HR and employee |
| 21 | `grievance_resolutions` | Grievance | Formal resolution summaries and sign-off records |
| 22 | `messages_notifications` | Notices & Comms | Company-wide announcements and direct alert broadcasts |

---

## 🚀 Running the Project

```bash
# 1. Install dependencies
npm install

# 2. Start the Vite development server
npm run dev

# 3. Open in your browser
http://localhost:5173
```

---

## 🔑 Supabase Configuration

To connect directly to your live Supabase project:
1. Open the application at `http://localhost:5173`.
2. Click on the **Database Status Badge** in the top navbar or navigate to **Settings**.
3. Paste your `anon` public key from your [Supabase API Settings](https://supabase.com/dashboard/project/czifnqksfzuxhpdlrvwy/settings/api).
4. Click **Test & Activate Live Connection**.
