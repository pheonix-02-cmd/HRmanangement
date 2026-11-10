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
  const { user, hasRole } = useAuth();
  const isEmployee = user?.role === 'employee';
  const currentEmpId = user?.employee_id || user?.id;

  const [grievances, setGrievances] = useState([]);
  const [communications, setCommunications] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);

  const [ticketForm, setTicketForm] = useState({
    category: 'Workplace Environment',
    subject: '',
    description: '',
    priority: 'medium',
  });

  const loadAll = async () => {
    const [gRes, cRes, eRes] = await Promise.all([
      fetchTableData('grievances'),
      fetchTableData('grievance_communications'),
      fetchTableData('employee_records'),
    ]);
    const grvs = gRes.data || [];
    setGrievances(grvs);
    setCommunications(cRes.data || []);
    setEmployees(eRes.data || []);
  };

  useEffect(() => {
    loadAll();
  }, []);

  // Data Scoping: Employees ONLY see their own tickets
  const scopedGrievances = isEmployee
    ? grievances.filter(grv => grv.employee_id === currentEmpId)
    : grievances;

  useEffect(() => {
    if (scopedGrievances.length > 0 && !selectedTicket) {
      setSelectedTicket(scopedGrievances[0]);
    } else if (scopedGrievances.length > 0 && !scopedGrievances.find(g => (g.grievance_id || g.id) === (selectedTicket?.grievance_id || selectedTicket?.id))) {
      setSelectedTicket(scopedGrievances[0]);
    }
  }, [scopedGrievances]);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    const newId = `grv-${Date.now().toString().slice(-4)}`;

    const newTicket = {
      grievance_id: newId,
      employee_id: currentEmpId,
      category: ticketForm.category,
      subject: sanitizeInput(ticketForm.subject),
      description: sanitizeInput(ticketForm.description),
      priority: ticketForm.priority,
      status: 'submitted',
      assigned_to: 'EMP-1001'
    };

    await insertTableRow('grievances', newTicket);
    setIsNewTicketModalOpen(false);
    setTicketForm({ category: 'Workplace Environment', subject: '', description: '', priority: 'medium' });
    await loadAll();
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;
    const ticketId = selectedTicket.grievance_id || selectedTicket.id;

    const newComm = {
      id: `gc-${Date.now().toString().slice(-4)}`,
      grievance_id: ticketId,
      sender_id: currentEmpId,
      message: sanitizeInput(replyText),
      created_at: new Date().toISOString()
    };

    await insertTableRow('grievance_communications', newComm);
    setReplyText('');
    await loadAll();
  };

  const handleResolveTicket = async () => {
    if (!selectedTicket || !hasRole(['admin', 'hr'])) return;
    const ticketId = selectedTicket.grievance_id || selectedTicket.id;

    await updateTableRow('grievances', ticketId, { status: 'resolved' });
    await loadAll();
  };

  const currentTicketId = selectedTicket ? (selectedTicket.grievance_id || selectedTicket.id) : null;
  const activeTicketComms = communications.filter(c => c.grievance_id === currentTicketId);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
            <span>{isEmployee ? 'My Grievances & Concerns' : 'Grievance Redressal'}</span>
            <Lock className="w-4 h-4 ml-2 text-teal-600 dark:text-teal-400" />
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isEmployee ? 'Confidential inquiries and HR communications' : 'Confidential employee redressal portal and inquiry logs'}
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
            const grvId = grv.grievance_id || grv.id;
            const isSelected = currentTicketId === grvId;

            return (
              <div
                key={grvId}
                onClick={() => setSelectedTicket(grv)}
                className={`p-3 rounded-lg cursor-pointer transition border text-xs space-y-1 ${
                  isSelected
                    ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-500'
                    : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-mono text-slate-400 text-[10px]">{grvId}</span>
                  <Badge variant={grv.status === 'resolved' ? 'success' : 'warning'} size="xs">{grv.status}</Badge>
                </div>
                <h4 className="font-semibold text-slate-900 dark:text-white truncate">{grv.subject}</h4>
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
                  <span className="text-[10px] font-mono text-slate-400">{currentTicketId}</span>
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
                  const emp = employees.find(e => (e.employee_id || e.id) === comm.sender_id);
                  const senderName = emp ? `${emp.first_name || ''} ${emp.last_name || ''}`.trim() : comm.sender_id;

                  return (
                    <div key={comm.id} className="text-xs space-y-0.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                      <div className="flex justify-between font-medium text-slate-800 dark:text-slate-200">
                        <span>{senderName}</span>
                        <span className="text-[10px] text-slate-400">
                          {comm.created_at ? new Date(comm.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400">{comm.message}</p>
                    </div>
                  );
                })}
                {activeTicketComms.length === 0 && (
                  <p className="text-xs text-slate-400 py-3 text-center">No messages exchanged yet.</p>
                )}
              </div>
            </div>

            <form onSubmit={handleSendReply} className="flex space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <input
                type="text"
                placeholder="Write a message or update..."
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
      <Modal isOpen={isNewTicketModalOpen} onClose={() => setIsNewTicketModalOpen(false)} title="New Grievance Ticket" maxWidth="max-w-md">
        <form onSubmit={handleCreateTicket} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Category</label>
            <select
              value={ticketForm.category}
              onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            >
              <option value="Workplace Environment">Workplace Environment</option>
              <option value="Payroll & Reimbursements">Payroll & Reimbursements</option>
              <option value="Working Hours & Shifts">Working Hours & Shifts</option>
              <option value="General Query">General Inquiry</option>
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
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Details</label>
            <textarea
              rows={3}
              required
              placeholder="Describe your situation in detail..."
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
