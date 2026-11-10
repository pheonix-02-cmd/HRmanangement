import React, { useState, useEffect, useRef } from 'react';
import { 
  CreditCard, 
  FileText, 
  Printer
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { fetchTableData, insertTableRow } from '../../services/dataStorage';

export const PayrollModule = () => {
  const { user, hasRole } = useAuth();
  const isEmployee = user?.role === 'employee';
  const currentEmpId = user?.employee_id || user?.id;

  const [activeSubTab, setActiveSubTab] = useState('payslips');
  const [payrollRuns, setPayrollRuns] = useState([]);
  const [payslips, setPayslips] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [designations, setDesignations] = useState([]);

  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const printRef = useRef(null);

  const loadAll = async () => {
    const [payRes, psRes, eRes, desRes] = await Promise.all([
      fetchTableData('payroll'),
      fetchTableData('payslips'),
      fetchTableData('employee_records'),
      fetchTableData('designations'),
    ]);
    setPayrollRuns(payRes.data || []);
    setPayslips(psRes.data || []);
    setEmployees(eRes.data || []);
    setDesignations(desRes.data || []);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  // Scoped Payroll / Payslip data: Employees strictly only see their own records
  const scopedPayroll = isEmployee
    ? payrollRuns.filter(p => p.employee_id === currentEmpId)
    : payrollRuns;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {isEmployee ? 'My Compensation & Payslips' : 'Payroll Operations'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isEmployee ? 'Monthly salary stubs and earnings breakdown' : 'Compensation records, salary structures, and payslips'}
          </p>
        </div>

        {!isEmployee && (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400">Payroll Cycle: Monthly</span>
          </div>
        )}
      </div>

      {/* Payslips Table */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-[11px]">
              <th className="py-2.5 px-3">Employee</th>
              <th className="py-2.5 px-3">Period</th>
              <th className="py-2.5 px-3">Basic Pay</th>
              <th className="py-2.5 px-3">Allowances</th>
              <th className="py-2.5 px-3">Net Disbursed</th>
              <th className="py-2.5 px-3 text-right">Document</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
            {scopedPayroll.map((pay) => {
              const payId = pay.payroll_id || pay.id;
              const emp = employees.find(e => (e.employee_id || e.id) === pay.employee_id);
              const empName = emp ? `${emp.first_name || ''} ${emp.last_name || ''}`.trim() : pay.employee_id;
              const des = designations.find(d => (d.designation_id || d.id) === emp?.designation_id);

              return (
                <tr key={payId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 font-sans">
                  <td className="py-2.5 px-3">
                    <p className="font-medium text-slate-900 dark:text-white">{empName}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{pay.employee_id}</p>
                  </td>
                  <td className="py-2.5 px-3 text-slate-500">October 2026</td>
                  <td className="py-2.5 px-3 font-mono">₹{Number(pay.basic_salary || 85000).toLocaleString('en-IN')}</td>
                  <td className="py-2.5 px-3 font-mono text-emerald-600 dark:text-emerald-400">+₹{Number(pay.allowances || 25000).toLocaleString('en-IN')}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-white">₹{Number(pay.net_salary || 98500).toLocaleString('en-IN')}</td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => setSelectedPayslip({ ...pay, empName, desTitle: des?.designation_name || des?.title || 'Staff' })}
                      className="text-xs font-medium text-teal-600 dark:text-teal-400 hover:underline inline-flex items-center space-x-1"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Payslip</span>
                    </button>
                  </td>
                </tr>
              );
            })}
            {scopedPayroll.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-6 text-slate-400 font-sans">
                  No salary records found for this account.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Printable Payslip Modal */}
      {selectedPayslip && (
        <Modal isOpen={Boolean(selectedPayslip)} onClose={() => setSelectedPayslip(null)} title="Salary Payslip" maxWidth="max-w-lg">
          <div ref={printRef} className="space-y-4 text-xs">
            <div className="flex justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">NexusHR Enterprises</h3>
                <p className="text-slate-400">New Delhi, India</p>
              </div>
              <div className="text-right">
                <span className="font-mono text-slate-400">#{selectedPayslip.payroll_id || selectedPayslip.id}</span>
                <p className="font-medium text-slate-700 dark:text-slate-300">October 2026</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 py-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg font-mono">
              <div>
                <span className="text-slate-400 font-sans block text-[11px]">Employee Name</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedPayslip.empName}</span>
              </div>
              <div>
                <span className="text-slate-400 font-sans block text-[11px]">Employee ID</span>
                <span className="text-slate-700 dark:text-slate-300">{selectedPayslip.employee_id}</span>
              </div>
              <div>
                <span className="text-slate-400 font-sans block text-[11px]">Role / Designation</span>
                <span className="text-slate-700 dark:text-slate-300 font-sans">{selectedPayslip.desTitle}</span>
              </div>
              <div>
                <span className="text-slate-400 font-sans block text-[11px]">Payment Mode</span>
                <span className="text-slate-700 dark:text-slate-300 font-sans">Bank Direct Transfer</span>
              </div>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden font-mono">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-sans text-[11px]">
                  <tr>
                    <th className="p-2">Earnings Component</th>
                    <th className="p-2 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="p-2 font-sans">Basic Salary</td>
                    <td className="p-2 text-right">₹{Number(selectedPayslip.basic_salary || 85000).toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-sans">House Rent Allowance (HRA)</td>
                    <td className="p-2 text-right">₹15,000</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-sans">Special / Performance Allowance</td>
                    <td className="p-2 text-right">₹10,000</td>
                  </tr>
                  <tr className="bg-teal-50/50 dark:bg-teal-950/20 font-bold text-slate-900 dark:text-white">
                    <td className="p-2 font-sans">Net Take-Home Pay</td>
                    <td className="p-2 text-right text-teal-600 dark:text-teal-400">
                      ₹{Number(selectedPayslip.net_salary || 98500).toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-[10px] text-slate-400">Confidential payroll slip generated by NexusHR</span>
              <div className="space-x-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 flex items-center space-x-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save PDF</span>
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};
