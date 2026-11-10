import React, { useState, useEffect } from 'react';
import { 
  MessageSquareWarning, 
  Plus, 
  Send, 
  CheckCircle2,
  Lock
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { fetchTableData, insertTableRow, updateTableRow } from '../../services/dataStorage';
import { sanitizeInput } from '../../utils/security';

export const GrievanceModule = () => {
  const { user, hasRole, canAccessEmployee } = useAuth();
  const [grievances, setGrievances] = useState([]);
  const [communications, setCommunications] = useState([]);
  const [resolutions, setResolutions] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [profiles, setProfiles] = useState([]);

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);

  const [ticketForm, setTicketForm] = useState({
    category: 'Workplace Ergonomics',
    subject: '',
    description: '',
    priority: 'medium',
  });

  const loadAll = async () => {
    const [gRes, cRes, rRes, eRes, pRes] = await Promise.all([
      fetchTableData('grievances'),
      fetchTableData('grievance_communications'),
      fetchTableData('grievance_resolutions'),
      fetchTableData('employee_records'),
      fetchTableData('profiles'),
    ]);
    const grvs = gRes.data || [];
    setGrievances(grvs);
    setCommunications(cRes.data || []);
    setResolutions(rRes.data || []);
    setEmployees(eRes.data || []);
    setProfiles(pRes.data || []);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const currentEmp = employees.find(e => e.profile_id === user?.id || e.id === user?.emp_id) || employees[0];

  // Data Scoping: Employees only see their own tickets
  const scopedGrievances = grievances.filter(grv => {
    const emp = employees.find(e => e.id === grv.employee_id);
    return canAccessEmployee(grv.employee_id, emp?.reports_to);
  });

  useEffect(() => {
    if (scopedGrievances.length > 0 && !selectedTicket) {
      setSelectedTicket(scopedGrievances[0]);
    } else if (scopedGrievances.length > 0 && !scopedGrievances.find(g => g.id === selectedTicket?.id)) {
      setSelectedTicket(scopedGrievances[0]);
    }
  }, [scopedGrievances]);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    const ticketNo = `GRV-2026-${Math.floor(Math.random() * 900 + 100)}`;

    const newTicket = {
      id: `grv-${Date.now().toString().slice(-4)}`,
      ticket_no: ticketNo,
      employee_id: currentEmp?.id || 'emp-4',
      category: ticketForm.category,
      subject: sanitizeInput(ticketForm.subject),
      description: sanitizeInput(ticketForm.description),
      priority: ticketForm.priority,
      status: 'submitted',
      filed_at: new Date().toISOString()
    };

    await insertTableRow('grievances', newTicket);
    setIsNewTicketModalOpen(false);
    setTicketForm({ category: 'Workplace Ergonomics', subject: '', description: '', priority: 'medium' });
    await loadAll();
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    const newComm = {
      id: `gc-${Date.now().toString().slice(-4)}`,
      grievance_id: selectedTicket.id,
      sender_id: currentEmp?.id || 'emp-1',
      message: sanitizeInput(replyText),
      timestamp: new Date().toISOString(),
      is_internal_note: false
    };

    await insertTableRow('grievance_communications', newComm);
    setReplyText('');
    await loadAll();
  };

  const handleResolveTicket = async () => {
    if (!selectedTicket || !hasRole(['admin', 'hr'])) return;

    const newResolution = {
      id: `gr-${Date.now().toString().slice(-4)}`,
      grievance_id: selectedTicket.id,
      resolved_by: currentEmp?.id || 'emp-1',
      resolution_summary: 'Resolved through administrative action.',
      action_taken: 'Remedial action taken.',
      employee_feedback: 'Acknowledged',
      resolved_at: new Date().toISOString()
    };

    await insertTableRow('grievance_resolutions', newResolution);
    await updateTableRow('grievances', selectedTicket.id, { status: 'resolved' });
    await loadAll();
  };

  const activeTicketComms = communications.filter(c => c.grievance_id === selectedTicket?.id);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
            <span>Grievances</span>
            <Lock className="w-4 h-4 ml-2 text-teal-600 dark:text-teal-400" />
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {user?.role === 'employee' ? 'Your confidential tickets and communications' : 'Confidential employee redressal portal'}
          </p>
        </div>

        <button
          onClick={() => setIsNewTicketModalOpen(true)}
          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 flex items-center space-x-1.5 transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Ticket</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Scoped Ticket List */}
        <div className="rounded-xl p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          {scopedGrievances.map((grv) => {
            const isSelected = selectedTicket?.id === grv.id;

            return (
              <div
                key={grv.id}
                onClick={() => setSelectedTicket(grv)}
                className={`p-3 rounded-lg cursor-pointer transition border text-xs space-y-1 ${
                  isSelected
                    ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-500'
                    : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-mono text-slate-400">{grv.ticket_no}</span>
                  <Badge variant="neutral" size="xs">{grv.status}</Badge>
                </div>
                <h4 className="font-semibold text-slate-900 dark:text-white">{grv.subject}</h4>
                <p className="text-slate-400 text-[11px] line-clamp-1">{grv.description}</p>
              </div>
            );
          })}
          {scopedGrievances.length === 0 && (
            <p className="text-xs text-slate-400 p-4 text-center">No grievance tickets found.</p>
          )}
        </div>

        {/* Right: Conversation Thread */}
        {selectedTicket && (
          <div className="lg:col-span-2 rounded-xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex justify-between items-start pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-mono text-slate-400">{selectedTicket.ticket_no}</span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{selectedTicket.subject}</h3>
                  <p className="text-xs text-slate-500 mt-1">{selectedTicket.description}</p>
                </div>

                {hasRole(['admin', 'hr']) && selectedTicket.status !== 'resolved' && (
                  <button
                    onClick={handleResolveTicket}
                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition"
                  >
                    Mark Resolved
                  </button>
                )}
              </div>

              {/* Messages */}
              <div className="space-y-3 py-4 max-h-64 overflow-y-auto">
                {activeTicketComms.map((comm) => {
                  const emp = employees.find(e => e.id === comm.sender_id);
                  const prof = profiles.find(p => p.id === emp?.profile_id);

                  return (
                    <div key={comm.id} className="text-xs space-y-0.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                      <div className="flex justify-between font-medium text-slate-800 dark:text-slate-200">
                        <span>{prof?.full_name}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(comm.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400">{comm.message}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleSendReply} className="flex space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <input
                type="text"
                placeholder="Reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 transition"
              >
                Send
              </button>
            </form>
          </div>
        )}

      </div>

      {/* New Ticket Modal */}
      <Modal isOpen={isNewTicketModalOpen} onClose={() => setIsNewTicketModalOpen(false)} title="New Ticket" maxWidth="max-w-md">
        <form onSubmit={handleCreateTicket} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Category</label>
            <select
              value={ticketForm.category}
              onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            >
              <option value="Workplace Ergonomics">Workplace Ergonomics</option>
              <option value="Payroll & Reimbursements">Payroll & Reimbursements</option>
              <option value="Policy & Workplace Culture">Policy & Working Hours</option>
              <option value="General">General</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Subject</label>
            <input
              type="text"
              required
              placeholder="Brief summary..."
              value={ticketForm.subject}
              onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Description</label>
            <textarea
              rows={3}
              required
              placeholder="Details..."
              value={ticketForm.description}
              onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsNewTicketModalOpen(false)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700"
            >
              Submit Ticket
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
