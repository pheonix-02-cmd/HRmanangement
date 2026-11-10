import React, { useState, useEffect } from 'react';
import { CalendarDays, Plus, Check, X } from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { fetchTableData, insertTableRow, updateTableRow } from '../../services/dataStorage';
import { sanitizeInput } from '../../utils/security';

export const LeaveModule = () => {
  const { user, hasRole } = useAuth();
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [profiles, setProfiles] = useState([]);

  const isEmployee = user?.role === 'employee';
  const currentEmpId = user?.employee_id || user?.id;

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applyForm, setApplyForm] = useState({
    leave_type: 'Casual Leave',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    reason: '',
  });

  const loadData = async () => {
    const [bRes, rRes, eRes, pRes] = await Promise.all([
      fetchTableData('leave_balance'),
      fetchTableData('leave_requests'),
      fetchTableData('employee_records'),
      fetchTableData('profiles'),
    ]);
    setLeaveBalances(bRes.data || []);
    setLeaveRequests(rRes.data || []);
    setEmployees(eRes.data || []);
    setProfiles(pRes.data || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    const d1 = new Date(applyForm.start_date);
    const d2 = new Date(applyForm.end_date);
    const diffDays = Math.max(1, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)) + 1);
    const newRequestId = `req-${Date.now().toString().slice(-4)}`;

    const newRequest = {
      request_id: newRequestId,
      employee_id: currentEmpId,
      leave_type: applyForm.leave_type,
      start_date: applyForm.start_date,
      end_date: applyForm.end_date,
      reason: sanitizeInput(applyForm.reason),
      status: 'pending',
      created_at: new Date().toISOString()
    };

    await insertTableRow('leave_requests', newRequest);
    setIsApplyModalOpen(false);
    setApplyForm({ leave_type: 'Casual Leave', start_date: '', end_date: '', reason: '' });
    await loadData();
  };

  const handleApprove = async (reqKey) => {
    await updateTableRow('leave_requests', reqKey, {
      status: 'approved'
    });
    await loadData();
  };

  const handleReject = async (reqKey) => {
    await updateTableRow('leave_requests', reqKey, {
      status: 'rejected'
    });
    await loadData();
  };

  // Data Scoping: Employees ONLY see their own requests
  const scopedRequests = isEmployee
    ? leaveRequests.filter(req => req.employee_id === currentEmpId)
    : leaveRequests;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {isEmployee ? 'My Leaves & Applications' : 'Leave Management'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isEmployee ? 'Personal leave quota and application history' : 'Leave balance overview and management approval queue'}
          </p>
        </div>

        <button
          onClick={() => setIsApplyModalOpen(true)}
          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 flex items-center space-x-1.5 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Apply Leave</span>
        </button>
      </div>

      {/* Quota Balance Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs font-medium text-slate-400">Paid Leave (PL)</span>
          <div className="flex items-baseline space-x-1 mt-1">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">12</h3>
            <span className="text-xs text-slate-400">/ 14 days</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs font-medium text-slate-400">Sick Leave (SL)</span>
          <div className="flex items-baseline space-x-1 mt-1">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">8</h3>
            <span className="text-xs text-slate-400">/ 10 days</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs font-medium text-slate-400">Casual Leave (CL)</span>
          <div className="flex items-baseline space-x-1 mt-1">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">6</h3>
            <span className="text-xs text-slate-400">/ 7 days</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs font-medium text-slate-400">Compensatory Off</span>
          <div className="flex items-baseline space-x-1 mt-1">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">2</h3>
            <span className="text-xs text-slate-400">days</span>
          </div>
        </div>
      </div>

      {/* Scoped Requests Table */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
          {isEmployee ? 'My Leave Applications' : 'Leave Approval Queue'}
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-[11px]">
                <th className="py-2.5 px-3">Employee ID</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Duration</th>
                <th className="py-2.5 px-3">Reason</th>
                <th className="py-2.5 px-3">Status</th>
                {!isEmployee && <th className="py-2.5 px-3 text-right">Approval</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {scopedRequests.map((req) => {
                const reqKey = req.request_id || req.id;
                const emp = employees.find(e => (e.employee_id || e.id) === req.employee_id);
                const empName = emp ? `${emp.first_name || ''} ${emp.last_name || ''}`.trim() : req.employee_id;

                return (
                  <tr key={reqKey} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white">
                      <span>{empName}</span>
                      <span className="text-[10px] text-slate-400 font-mono ml-1.5">({req.employee_id})</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300 font-medium">
                      {req.leave_type}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                      {req.start_date} – {req.end_date}
                    </td>
                    <td className="py-2.5 px-3 max-w-xs truncate text-slate-500">
                      {req.reason}
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge
                        variant={
                          req.status === 'approved' ? 'success' :
                          req.status === 'pending' ? 'warning' : 'danger'
                        }
                        size="xs"
                      >
                        {req.status}
                      </Badge>
                    </td>
                    {!isEmployee && (
                      <td className="py-2.5 px-3 text-right">
                        {req.status === 'pending' && hasRole(['admin', 'hr', 'manager']) ? (
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => handleApprove(reqKey)}
                              className="p-1 rounded text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                              title="Approve"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleReject(reqKey)}
                              className="p-1 rounded text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                              title="Reject"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">
                            {req.status === 'approved' ? 'Approved' : 'Reviewed'}
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Leave Modal */}
      <Modal isOpen={isApplyModalOpen} onClose={() => setIsApplyModalOpen(false)} title="Apply for Leave" maxWidth="max-w-md">
        <form onSubmit={handleApplyLeave} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Leave Category</label>
            <select
              value={applyForm.leave_type}
              onChange={(e) => setApplyForm({ ...applyForm, leave_type: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            >
              <option value="Paid Leave">Paid Leave (PL)</option>
              <option value="Sick Leave">Sick Leave (SL)</option>
              <option value="Casual Leave">Casual Leave (CL)</option>
              <option value="Unpaid Leave">Unpaid Leave (LOP)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Start Date</label>
              <input
                type="date"
                required
                value={applyForm.start_date}
                onChange={(e) => setApplyForm({ ...applyForm, start_date: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">End Date</label>
              <input
                type="date"
                required
                value={applyForm.end_date}
                onChange={(e) => setApplyForm({ ...applyForm, end_date: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Reason for Leave</label>
            <textarea
              rows={3}
              required
              placeholder="State clear purpose of leave..."
              value={applyForm.reason}
              onChange={(e) => setApplyForm({ ...applyForm, reason: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsApplyModalOpen(false)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700"
            >
              Submit Application
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
