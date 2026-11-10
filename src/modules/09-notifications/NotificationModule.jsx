import React, { useState, useEffect } from 'react';
import { BellRing, Megaphone, Plus } from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { fetchTableData, insertTableRow, updateTableRow } from '../../services/dataStorage';
import { sanitizeInput } from '../../utils/security';

export const NotificationModule = () => {
  const { user, hasRole } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);

  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    content: '',
    type: 'announcement',
  });

  const loadAll = async () => {
    const [nRes, pRes] = await Promise.all([
      fetchTableData('messages_notifications'),
      fetchTableData('profiles'),
    ]);
    setNotifications(nRes.data || []);
    setProfiles(pRes.data || []);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleCreateBroadcast = async (e) => {
    e.preventDefault();
    const newNotice = {
      id: `notif-${Date.now().toString().slice(-4)}`,
      recipient_id: null,
      sender_id: user.id,
      title: sanitizeInput(broadcastForm.title),
      content: sanitizeInput(broadcastForm.content),
      type: broadcastForm.type,
      is_read: false,
      created_at: new Date().toISOString()
    };

    await insertTableRow('messages_notifications', newNotice);
    setIsBroadcastModalOpen(false);
    setBroadcastForm({ title: '', content: '', type: 'announcement' });
    await loadAll();
  };

  const handleMarkAsRead = async (id) => {
    await updateTableRow('messages_notifications', id, { is_read: true });
    await loadAll();
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Announcements & Notices
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Internal company broadcasts and alerts
          </p>
        </div>

        {hasRole(['admin', 'hr']) && (
          <button
            onClick={() => setIsBroadcastModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 flex items-center space-x-1.5 transition"
          >
            <Megaphone className="w-4 h-4" />
            <span>Post Notice</span>
          </button>
        )}
      </div>

      {/* Notifications Feed */}
      <div className="space-y-3">
        {notifications.map((item) => {
          const sender = profiles.find(p => p.id === item.sender_id);

          return (
            <div
              key={item.id}
              className={`p-4 rounded-xl border bg-white dark:bg-slate-900 transition ${
                !item.is_read
                  ? 'border-teal-500/40'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{item.title}</h4>
                    <Badge variant="neutral" size="xs">
                      {item.type}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    {item.content}
                  </p>

                  <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-2">
                    <span>{sender?.full_name || 'HR Admin'}</span>
                    <span>•</span>
                    <span>{new Date(item.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>

                {!item.is_read && (
                  <button
                    onClick={() => handleMarkAsRead(item.id)}
                    className="text-[11px] text-teal-600 dark:text-teal-400 hover:underline"
                  >
                    Mark read
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Broadcast Modal */}
      <Modal isOpen={isBroadcastModalOpen} onClose={() => setIsBroadcastModalOpen(false)} title="Post Notice" maxWidth="max-w-md">
        <form onSubmit={handleCreateBroadcast} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Type</label>
            <select
              value={broadcastForm.type}
              onChange={(e) => setBroadcastForm({ ...broadcastForm, type: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            >
              <option value="announcement">Announcement</option>
              <option value="alert">Alert</option>
              <option value="reminder">Reminder</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Title</label>
            <input
              type="text"
              required
              placeholder="Notice title..."
              value={broadcastForm.title}
              onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Content</label>
            <textarea
              rows={3}
              required
              placeholder="Message details..."
              value={broadcastForm.content}
              onChange={(e) => setBroadcastForm({ ...broadcastForm, content: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsBroadcastModalOpen(false)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700"
            >
              Publish
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
