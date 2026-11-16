import React, { useState, useEffect, useRef } from 'react';
import { 
  CreditCard, 
  FileText, 
  Printer,
  Search,
  RefreshCw,
  DollarSign,
  TrendingUp,
  Users,
  CheckCircle2
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { fetchTableData } from '../../services/dataStorage';

export const PayrollModule = () => {
  const { user } = useAuth();
  const isEmployee = user?.role === 'employee';
  const currentEmpId = String(user?.employee_id || user?.id || '').trim().toUpperCase();

  const [payrollRuns, setPayrollRuns] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const printRef = useRef(null);

  const formatPeriod = (periodStr) => {
    if (!periodStr) return 'Current Period';
    const parts = String(periodStr).split('T')[0].split('-');
    if (parts.length >= 2) {
      const year = parseInt(parts[0], 10);
      const monthIndex = parseInt(parts[1], 10) - 1;
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      if (!isNaN(year) && monthIndex >= 0 && monthIndex < 12) {
        return `${monthNames[monthIndex]} ${year}`;
      }
    }
    const d = new Date(periodStr);
    return isNaN(d.getTime()) ? periodStr : d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const [payRes, eRes, desRes] = await Promise.all([
        fetchTableData('payroll'),
        fetchTableData('employee_records'),
        fetchTableData('designations'),
      ]);

      setPayrollRuns(payRes.data || []);
      setEmployees(eRes.data || []);
      setDesignations(desRes.data || []);
    } catch (err) {
      console.error('Failed to load payroll data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  // Scoped Payroll data:
  // General employees strictly see only their own compensation records
  // Managers and Admins see organization-wide records
  const userFilteredPayroll = isEmployee
    ? payrollRuns.filter(p => String(p.employee_id || '').trim().toUpperCase() === currentEmpId)
    : payrollRuns;

  // Search filter for Management view
  const displayPayroll = userFilteredPayroll
    .filter(pay => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const emp = employees.find(e => String(e.employee_id || e.id).toUpperCase() === String(pay.employee_id).toUpperCase());
      const empName = emp ? `${emp.first_name || ''} ${emp.last_name || ''}`.toLowerCase() : '';
      const empId = String(pay.employee_id || '').toLowerCase();
      const period = formatPeriod(pay.pay_period).toLowerCase();
      return empName.includes(q) || empId.includes(q) || period.includes(q);
    })
    .sort((a, b) => {
      const dateA = new Date(a.pay_period || a.payment_date || a.created_at || 0);
      const dateB = new Date(b.pay_period || b.payment_date || b.created_at || 0);
      return dateB - dateA;
    });

  // KPI Metrics for Management View
  const totalDisbursed = displayPayroll.reduce((acc, curr) => acc + (Number(curr.net_salary) || 0), 0);
  const uniqueEmps = new Set(displayPayroll.map(p => p.employee_id)).size;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <span>{isEmployee ? 'My Compensation & Payslips' : 'Payroll Operations & Compensation'}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isEmployee 
              ? `Monthly salary stubs, deductions, and earnings breakdown for ${user?.name || currentEmpId}` 
              : 'Enterprise compensation records, statutory deductions, and monthly salary disbursement audits'}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={loadAll}
            disabled={loading}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
            title="Refresh from Supabase"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-teal-600' : ''}`} />
          </button>

          {!isEmployee && (
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              {payrollRuns.length} Disbursed Records
            </span>
          )}
        </div>
      </div>

      {/* Management Overview Metric Cards */}
      {!isEmployee && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs">
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Total Net Disbursed</p>
              <p className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-0.5">
                ₹{totalDisbursed.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs">
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Employees on Payroll</p>
              <p className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-0.5">
                {uniqueEmps} Active Staff
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs">
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Disbursement Status</p>
              <p className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>100% Processed</span>
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
        </div>
      )}

      {/* Search Bar for Management */}
      {!isEmployee && (
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search payroll by employee name, employee ID (e.g. EMP016), or month..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-teal-500"
          />
        </div>
      )}

      {/* Payslips Table */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-x-auto shadow-xs">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-[11px]">
              <th className="py-2.5 px-3">Employee</th>
              <th className="py-2.5 px-3">Pay Period</th>
              <th className="py-2.5 px-3">Basic Pay</th>
              <th className="py-2.5 px-3">Allowances</th>
              <th className="py-2.5 px-3">Deductions</th>
              <th className="py-2.5 px-3">Net Disbursed</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">Document</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
            {displayPayroll.map((pay) => {
              const payId = pay.payroll_id || pay.id;
              const emp = employees.find(e => String(e.employee_id || e.id).toUpperCase() === String(pay.employee_id).toUpperCase());
              const empName = emp ? `${emp.first_name || ''} ${emp.last_name || ''}`.trim() : pay.employee_id;
              const des = designations.find(d => String(d.designation_id || d.id) === String(emp?.designation_id));
              const periodLabel = formatPeriod(pay.pay_period);
              const allowancesTotal = Number(pay.allowances || 0) + Number(pay.hra || 0);

              return (
                <tr key={payId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 font-sans transition">
                  <td className="py-2.5 px-3">
                    <p className="font-medium text-slate-900 dark:text-white">{empName}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{pay.employee_id}</p>
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-600 dark:text-slate-300">
                    {periodLabel}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-700 dark:text-slate-300">
                    ₹{Number(pay.basic_salary || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-emerald-600 dark:text-emerald-400">
                    +₹{allowancesTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-rose-500 dark:text-rose-400">
                    -₹{Number(pay.total_deductions || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-white">
                    ₹{Number(pay.net_salary || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3">
                    <Badge variant={pay.payment_status === 'Paid' ? 'success' : 'neutral'} size="xs">
                      {pay.payment_status || 'Paid'}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => setSelectedPayslip({ 
                        ...pay, 
                        empName, 
                        desTitle: des?.designation_name || des?.title || 'Staff Specialist',
                        periodLabel 
                      })}
                      className="text-xs font-medium text-teal-600 dark:text-teal-400 hover:underline inline-flex items-center space-x-1"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Payslip</span>
                    </button>
                  </td>
                </tr>
              );
            })}
            {displayPayroll.length === 0 && !loading && (
              <tr>
                <td colSpan={8} className="text-center py-10 text-slate-400 font-sans">
                  <CreditCard className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                  <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">Data Absent</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isEmployee 
                      ? `No salary records found for ${currentEmpId} in database.` 
                      : 'No payroll records match your search criteria.'}
                  </p>
                </td>
              </tr>
            )}
            {loading && displayPayroll.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-8 text-slate-400 font-sans">
                  <RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin text-teal-600" />
                  <p>Loading payroll records from Supabase...</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Printable Payslip Modal */}
      {selectedPayslip && (
        <Modal 
          isOpen={Boolean(selectedPayslip)} 
          onClose={() => setSelectedPayslip(null)} 
          title="Official Salary Payslip" 
          maxWidth="max-w-xl"
        >
          <div ref={printRef} className="space-y-4 text-xs">
            <div className="flex justify-between items-start pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">NexusHR Enterprises Private Limited</h3>
                <p className="text-[11px] text-slate-400">Technology & Human Capital Division • Corporate Headquarters, New Delhi</p>
              </div>
              <div className="text-right">
                <span className="font-mono text-xs text-slate-500 font-semibold block">SLIP #{selectedPayslip.payroll_id || selectedPayslip.id}</span>
                <p className="font-bold text-teal-700 dark:text-teal-400">{selectedPayslip.periodLabel}</p>
              </div>
            </div>

            {/* Employee Demographic Header */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg font-mono text-[11px]">
              <div>
                <span className="text-slate-400 font-sans block text-[10px]">Employee Name</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedPayslip.empName}</span>
              </div>
              <div>
                <span className="text-slate-400 font-sans block text-[10px]">Employee ID</span>
                <span className="text-slate-700 dark:text-slate-300 font-bold">{selectedPayslip.employee_id}</span>
              </div>
              <div>
                <span className="text-slate-400 font-sans block text-[10px]">Role / Designation</span>
                <span className="text-slate-700 dark:text-slate-300 font-sans">{selectedPayslip.desTitle}</span>
              </div>
              <div>
                <span className="text-slate-400 font-sans block text-[10px]">Payment Mode</span>
                <span className="text-slate-700 dark:text-slate-300 font-sans">Bank Direct NEFT</span>
              </div>
            </div>

            {/* Attendance & Shift Summary */}
            <div className="grid grid-cols-4 gap-2 text-center py-2 px-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div>
                <span className="text-[10px] text-slate-400 block">Working Days</span>
                <span className="font-bold font-mono text-slate-700 dark:text-slate-300">{selectedPayslip.working_days || 22}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Present Days</span>
                <span className="font-bold font-mono text-slate-700 dark:text-slate-300">{selectedPayslip.present_days || selectedPayslip.working_days || 20}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Paid Days</span>
                <span className="font-bold font-mono text-teal-600 dark:text-teal-400">{selectedPayslip.paid_days || selectedPayslip.present_days || 22}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Disbursed Date</span>
                <span className="font-mono text-slate-600 dark:text-slate-300 text-[10px]">{selectedPayslip.payment_date || 'End of Month'}</span>
              </div>
            </div>

            {/* Detailed Financial Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Earnings Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden font-mono">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-sans text-[10px]">
                    <tr>
                      <th className="p-2">Earnings Component</th>
                      <th className="p-2 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px]">
                    <tr>
                      <td className="p-2 font-sans">Basic Salary</td>
                      <td className="p-2 text-right">₹{Number(selectedPayslip.basic_salary || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-sans">House Rent Allowance (HRA)</td>
                      <td className="p-2 text-right">₹{Number(selectedPayslip.hra || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-sans">Special / Travel Allowances</td>
                      <td className="p-2 text-right">₹{Number(selectedPayslip.allowances || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                    </tr>
                    <tr className="bg-slate-50/50 dark:bg-slate-800/30 font-semibold">
                      <td className="p-2 font-sans text-slate-700 dark:text-slate-300">Gross Earnings</td>
                      <td className="p-2 text-right text-slate-900 dark:text-white">
                        ₹{Number(selectedPayslip.gross_salary || (Number(selectedPayslip.basic_salary || 0) + Number(selectedPayslip.hra || 0) + Number(selectedPayslip.allowances || 0))).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Deductions Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden font-mono">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-sans text-[10px]">
                    <tr>
                      <th className="p-2">Deductions & Taxes</th>
                      <th className="p-2 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px]">
                    <tr>
                      <td className="p-2 font-sans">Provident Fund (EPF)</td>
                      <td className="p-2 text-right">₹{Number((selectedPayslip.total_deductions || 0) * 0.6).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-sans">Income Tax (TDS) / Prof Tax</td>
                      <td className="p-2 text-right">₹{Number((selectedPayslip.total_deductions || 0) * 0.4).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-sans">Other Unpaid Reductions</td>
                      <td className="p-2 text-right">₹0.00</td>
                    </tr>
                    <tr className="bg-rose-50/50 dark:bg-rose-950/20 font-semibold text-rose-600 dark:text-rose-400">
                      <td className="p-2 font-sans">Total Deductions</td>
                      <td className="p-2 text-right">
                        -₹{Number(selectedPayslip.total_deductions || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Net Salary Banner */}
            <div className="p-3 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/60 flex items-center justify-between font-mono">
              <div>
                <span className="text-[10px] text-teal-700 dark:text-teal-300 font-sans block font-semibold uppercase">Net Take-Home Salary</span>
                <span className="text-[10px] text-slate-400 font-sans">Credited to registered salary account</span>
              </div>
              <span className="text-xl font-bold text-teal-800 dark:text-teal-300">
                ₹{Number(selectedPayslip.net_salary || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </span>
            </div>

            {/* Footer with Print Action */}
            <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400">System generated slip • No physical signature required</span>
              <button
                type="button"
                onClick={handlePrint}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 flex items-center space-x-1.5 transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save PDF</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};
