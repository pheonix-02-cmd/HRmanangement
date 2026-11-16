import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Search, 
  Menu, 
  ChevronDown, 
  LogOut, 
  ShieldCheck,
  X,
  CheckCircle2,
  Clock,
  User,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../common/ThemeToggle';
import { fetchTableData, updateTableRow } from '../../services/dataStorage';

export const Navbar = ({ onToggleMobileSidebar, currentTab, setCurrentTab }) => {
  const { user, logout } = useAuth();
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationsList, setNotificationsList] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const loadNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const res = await fetchTableData('messages_notifications');
      const all = res.data || [];
      const userEmpId = user?.employee_id || user?.id || '';

      // Filter notifications: show ones addressed to this employee or broadcast, or all for admin/hr
      const filtered = all.filter(n => {
        if (['admin', 'hr'].includes(user?.role)) return true;
        if (!n.receiver_employee_id) return true;
        const receiver = String(n.receiver_employee_id).trim().toUpperCase();
        return receiver === String(userEmpId).toUpperCase() || receiver === 'ALL';
      }).sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

      setNotificationsList(filtered);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    const timer = setInterval(loadNotifications, 30000);
    return () => clearInterval(timer);
  }, [user]);

  const unreadCount = notificationsList.filter(n => !n.is_read).length;

  const handleMarkAllRead = async () => {
    const unread = notificationsList.filter(n => !n.is_read);
    if (unread.length === 0) return;

    // Optimistic local update
    setNotificationsList(prev => prev.map(n => ({ ...n, is_read: true, unread: false })));

    // Update in Supabase
    try {
      for (const item of unread) {
        const id = item.notification_id || item.id;
        if (id) {
          await updateTableRow('messages_notifications', id, { is_read: true });
        }
      }
    } catch (e) {
      console.error('Error marking all as read:', e);
    }
    await loadNotifications();
  };

  const handleNotificationClick = async (item) => {
    setSelectedNotification(item);
    if (!item.is_read) {
      const id = item.notification_id || item.id;
      // Mark as read in local state immediately
      setNotificationsList(prev => prev.map(n => 
        (n.notification_id || n.id) === id ? { ...n, is_read: true, unread: false } : n
      ));
      if (id) {
        try {
          await updateTableRow('messages_notifications', id, { is_read: true });
        } catch (e) {
          console.error('Error marking as read:', e);
        }
      }
    }
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffSec = Math.floor((now - date) / 1000);
      if (diffSec < 60) return 'Just now';
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch (e) {
      return '';
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Left: Mobile Toggle & Brand */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onToggleMobileSidebar}
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2 md:hidden">
              <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold text-sm">
                N
              </div>
              <span className="font-semibold text-base text-slate-900 dark:text-white">
                NexusHR
              </span>
            </div>
          </div>

          {/* Center: Search */}
          <div className="hidden sm:flex items-center flex-1 max-w-sm mx-6">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 transition placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Right Action Items */}
          <div className="flex items-center space-x-2.5">
            {/* Theme Toggle Button */}
            <ThemeToggle />

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications) loadNotifications();
                }}
                className="relative p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 transition"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900 animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-slate-900 dark:text-white">Notifications</span>
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-mono font-medium">
                        {notificationsList.length}
                      </span>
                    </div>
                    {unreadCount > 0 ? (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 hover:underline transition"
                      >
                        Mark all read
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400">All read</span>
                    )}
                  </div>

                  {/* Scrollable container: displays 3 at a time with smooth scrollbar */}
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-[225px] overflow-y-auto">
                    {notificationsList.map((n) => {
                      const id = n.notification_id || n.id;
                      const isUnread = !n.is_read;

                      return (
                        <div 
                          key={id} 
                          onClick={() => handleNotificationClick(n)}
                          className={`px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer text-xs transition relative ${
                            isUnread ? 'bg-teal-50/30 dark:bg-teal-950/20' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                              {n.title}
                            </p>
                            {isUnread && (
                              <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                            {n.message || n.desc}
                          </p>
                          <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                            <span>{n.notification_type || 'Notification'}</span>
                            <span>{formatTimeAgo(n.created_at)}</span>
                          </div>
                        </div>
                      );
                    })}

                    {notificationsList.length === 0 && !loadingNotifications && (
                      <div className="py-8 text-center text-slate-400 text-xs">
                        <Bell className="w-6 h-6 mx-auto mb-1.5 text-slate-300 dark:text-slate-600" />
                        <p className="font-medium text-slate-600 dark:text-slate-400">No notifications</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">You're all caught up!</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile & Sign Out Dropdown */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowPersonaMenu(!showPersonaMenu)}
                  className="flex items-center space-x-2 p-1.5 pl-2 pr-2.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  <img
                    src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775?w=150'}
                    alt={user.full_name}
                    className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                  />
                  <div className="hidden lg:block text-left text-xs">
                    <span className="font-semibold text-slate-900 dark:text-slate-100 block leading-none">
                      {user.full_name}
                    </span>
                    <span className="text-[10px] text-teal-600 dark:text-teal-400 uppercase font-semibold">
                      {user.role}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showPersonaMenu && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 text-xs">
                      <span className="text-slate-400 block text-[10px]">Logged in as</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{user.full_name}</span>
                      <span className="text-[11px] text-slate-500 block truncate">{user.email}</span>
                      <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded font-mono bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300">
                        ID: {user.employee_id || user.id}
                      </span>
                    </div>

                    <div className="p-1">
                      <button
                        onClick={logout}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition flex items-center space-x-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>
      </header>

      {/* Blurred Background Popup Box for Complete Notification */}
      {selectedNotification && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
          onClick={() => setSelectedNotification(null)}
        >
          <div 
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-4 text-slate-900 dark:text-white animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                    {selectedNotification.notification_type || 'Notification'}
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>
                      {selectedNotification.created_at ? new Date(selectedNotification.created_at).toLocaleString([], { 
                        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                      }) : ''}
                    </span>
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white pt-1">
                  {selectedNotification.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedNotification(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 leading-relaxed text-sm whitespace-pre-wrap">
                {selectedNotification.message || selectedNotification.desc || 'No content provided in this notification.'}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400 pt-1">
                <div className="flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>From: <strong className="text-slate-700 dark:text-slate-300">{selectedNotification.sender_employee_id || 'HR Administration'}</strong></span>
                </div>
                <div>
                  <span>Target Recipient: <strong className="text-slate-700 dark:text-slate-300">{selectedNotification.receiver_employee_id || 'All Employees'}</strong></span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Marked as read</span>
              </div>
              <button
                onClick={() => setSelectedNotification(null)}
                className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
