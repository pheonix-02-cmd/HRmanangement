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
  const { user, hasRole, canAccessEmployee } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState('payslips');
  
  const [payslips, setPayslips] = useState([]);
  const [salaryStructures, setSalaryStructures] = useState([]);
  const [deductionRules, setDeductionRules] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [designations, setDesignations] = useState([]);

  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const printRef = useRef(null);

  const loadAll = async () => {
    const [psRes, ssRes, drRes, eRes, pRes, desRes] = await Promise.all([
      fetchTableData('payslips'),
      fetchTableData('salary_structures'),
      fetchTableData('deduction_rules'),
      fetchTableData('employee_records'),
      fetchTableData('profiles'),
      fetchTableData('designations'),
    ]);
    setPayslips(psRes.data || []);
    setSalaryStructures(ssRes.data || []);
    setDeductionRules(drRes.data || []);
    setEmployees(eRes.data || []);
    setProfiles(pRes.data || []);
    setDesignations(desRes.data || []);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleRunPayroll = async () => {
    if (!hasRole(['admin', 'hr'])) return;

    const newRun = {
      id: `pay-${Date.now().toString().slice(-4)}`,
      payroll_month: 11,
      payroll_year: 2026,
      total_disbursed: 742800,
      status: 'disbursed',
      processed_at: new Date().toISOString(),
      processed_by: user?.emp_id || 'emp-1'
    };
    await insertTableRow('payroll', newRun);
    await loadAll();
    alert('Payroll processed successfully');
  };

  // Data Scoping: Employees only see their own payslips
  const scopedPayslips = payslips.filter(ps => canAccessEmployee(ps.employee_id));

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Payroll & Payslips
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {user?.role === 'employee' ? 'Your compensation details and payslips' : 'Salary structures, deductions, and payroll records'}
          </p>
        </div>

        {hasRole(['admin', 'hr']) && (
          <button
            onClick={handleRunPayroll}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 transition"
          >
            Process Payroll
          </button>
        )}
      </div>

      {/* Sub Tabs: Only Admin/HR can see Salary Structures and Deductions config */}
      {hasRole(['admin', 'hr']) && (
        <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-medium space-x-6">
          <button
            onClick={() => setActiveSubTab('payslips')}
            className={`pb-2.5 border-b-2 transition ${
              activeSubTab === 'payslips'
                ? 'border-teal-600 text-teal-600 dark:text-teal-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Payslips ({scopedPayslips.length})
          </button>

          <button
            onClick={() => setActiveSubTab('structures')}
            className={`pb-2.5 border-b-2 transition ${
              activeSubTab === 'structures'
                ? 'border-teal-600 text-teal-600 dark:text-teal-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Salary Structures ({salaryStructures.length})
          </button>

          <button
            onClick={() => setActiveSubTab('rules')}
            className={`pb-2.5 border-b-2 transition ${
              activeSubTab === 'rules'
                ? 'border-teal-600 text-teal-600 dark:text-teal-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Deductions ({deductionRules.length})
          </button>
        </div>
      )}

      {/* Scoped Payslips */}
      {activeSubTab === 'payslips' && (
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-[11px]">
                <th className="py-2.5 px-3">Employee</th>
                <th className="py-2.5 px-3">Month</th>
                <th className="py-2.5 px-3">Basic</th>
                <th className="py-2.5 px-3">Allowances</th>
                <th className="py-2.5 px-3">Deductions</th>
                <th className="py-2.5 px-3">Net Pay</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {scopedPayslips.map((ps) => {
                const emp = employees.find(e => e.id === ps.employee_id);
                const prof = profiles.find(p => p.id === emp?.profile_id);
                const des = designations.find(d => d.id === emp?.designation_id);

                return (
                  <tr key={ps.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 font-sans">
                    <td className="py-2.5 px-3">
                      <p className="font-medium text-slate-900 dark:text-white">{prof?.full_name}</p>
                      <p className="text-[10px] text-slate-400">{des?.title}</p>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">October 2026</td>
                    <td className="py-2.5 px-3 font-mono">₹{ps.basic_salary.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-3 font-mono text-emerald-600 dark:text-emerald-400">+₹{ps.total_allowances.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-3 font-mono text-rose-600 dark:text-rose-400">-₹{ps.total_deductions.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-white">₹{ps.net_salary.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => setSelectedPayslip({ ...ps, emp, prof, des })}
                        className="text-xs font-medium text-teal-600 dark:text-teal-400 hover:underline"
                      >
                        View Payslip
                      </button>
                    </td>
                  </tr>
                );
              })}
              {scopedPayslips.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-slate-400 font-sans">
                    No payslips found for this account.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Salary Structures (Admin/HR Only) */}
      {activeSubTab === 'structures' && hasRole(['admin', 'hr']) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {salaryStructures.map((sal) => {
            const des = designations.find(d => d.id === sal.designation_id);
            const gross = sal.base_salary + sal.hra + sal.transport_allowance + sal.medical_allowance + sal.special_allowance;

            return (
              <div key={sal.id} className="rounded-xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-slate-900 dark:text-white">{des?.title}</h4>
                  <span className="font-mono text-slate-500">{des?.level}</span>
                </div>
                <div className="space-y-1 text-slate-600 dark:text-slate-400 font-mono">
                  <div className="flex justify-between">
                    <span className="font-sans">Basic:</span>
                    <span>₹{sal.base_salary.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans">HRA:</span>
                    <span>₹{sal.hra.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans">Special:</span>
                    <span>₹{sal.special_allowance.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-slate-100 dark:border-slate-800 pt-1 text-slate-900 dark:text-white">
                    <span className="font-sans">Monthly Gross:</span>
                    <span>₹{gross.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Deductions (Admin/HR Only) */}
      {activeSubTab === 'rules' && hasRole(['admin', 'hr']) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {deductionRules.map((rule) => (
            <div key={rule.id} className="rounded-xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
              <h4 className="font-semibold text-slate-900 dark:text-white">{rule.name}</h4>
              <p className="text-slate-500 font-mono">
                {rule.deduction_type === 'percentage' ? `${rule.value}% of ${rule.applies_to}` : `₹${rule.value} fixed`}
              </p>
            </div>
          ))}
        </div>
      )}

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
                <span className="font-mono text-slate-400">#{selectedPayslip.id}</span>
                <p className="font-medium text-slate-700 dark:text-slate-300">October 2026</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800">
              <div>
                <span className="text-slate-400">Employee:</span>
                <p className="font-medium text-slate-900 dark:text-white">{selectedPayslip.prof?.full_name}</p>
              </div>
              <div>
                <span className="text-slate-400">Designation:</span>
                <p className="font-medium text-slate-900 dark:text-white">{selectedPayslip.des?.title}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 font-mono">
              <div className="space-y-1">
                <span className="font-sans font-semibold text-slate-500 uppercase text-[10px]">Earnings</span>
                <div className="flex justify-between">
                  <span className="font-sans text-slate-400">Basic</span>
                  <span>₹{selectedPayslip.basic_salary.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sans text-slate-400">Allowances</span>
                  <span>₹{selectedPayslip.total_allowances.toLocaleString('en-IN')}</span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="font-sans font-semibold text-slate-500 uppercase text-[10px]">Deductions</span>
                <div className="flex justify-between">
                  <span className="font-sans text-slate-400">Statutory</span>
                  <span>₹{selectedPayslip.total_deductions.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 flex justify-between items-center font-medium">
              <span>Net Take-Home</span>
              <span className="font-mono font-bold text-sm text-teal-600 dark:text-teal-400">
                ₹{selectedPayslip.net_salary.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setSelectedPayslip(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700"
              >
                Close
              </button>
              <button
                onClick={handlePrint}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-600 text-white hover:bg-teal-700 flex items-center space-x-1"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};
