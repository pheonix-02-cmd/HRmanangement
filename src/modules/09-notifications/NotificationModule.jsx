import React, { useState, useEffect } from 'react';
import { 
  BellRing, 
  Megaphone, 
  Plus, 
  Briefcase, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Search, 
  RefreshCw,
  Users,
  Building2,
  Clock
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { fetchTableData, insertTableRow } from '../../services/dataStorage';
import { sanitizeInput } from '../../utils/security';

export const NotificationModule = () => {
  const { user, hasRole } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [jobPostings, setJobPostings] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'announcements' | 'jobs'
  const [searchQuery, setSearchQuery] = useState('');

  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    content: '',
    type: 'Announcement',
  });

  const isHR = user?.role === 'hr' || 
               user?.role === 'admin' || 
               Number(user?.department_id) === 102 || 
               String(user?.department || '').toLowerCase().includes('hr') ||
               ['EMP001', 'EMP002', 'EMP003', 'EMP004'].includes(user?.employee_id);

  const getDeptName = (deptId) => {
    const d = departments.find(item => String(item.department_id || item.id) === String(deptId));
    return d?.department_name || d?.name || `Department ${deptId}`;
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const [annRes, jobRes, deptRes] = await Promise.all([
        fetchTableData('company_announcements'),
        fetchTableData('job_postings'),
        fetchTableData('departments')
      ]);

      setAnnouncements(annRes.data || []);
      setJobPostings(jobRes.data || []);
      setDepartments(deptRes.data || []);
    } catch (err) {
      console.error('Failed to load notices & announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleCreateBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastForm.title.trim() || !broadcastForm.content.trim()) return;

    const newNotice = {
      title: sanitizeInput(broadcastForm.title),
      message: sanitizeInput(broadcastForm.content),
      announcement_type: broadcastForm.type,
      created_by: user?.employee_id || 'EMP001',
      is_published: true,
      created_at: new Date().toISOString()
    };

    await insertTableRow('company_announcements', newNotice);
    setIsBroadcastModalOpen(false);
    setBroadcastForm({ title: '', content: '', type: 'Announcement' });
    await loadAll();
  };

  // Harmonize items from company_announcements and job_postings
  const announcementItems = announcements.map(a => ({
    id: a.announcement_id || a.id || `ann-${Math.random()}`,
    source: 'announcement',
    title: a.title,
    content: a.message || a.content || '',
    type: a.announcement_type || a.type || 'Announcement',
    created_at: a.created_at,
    created_by: a.created_by || 'HR Admin'
  }));

  const jobNoticeItems = jobPostings.map(j => ({
    id: `job-notice-${j.job_id || j.id || Math.random()}`,
    source: 'job_posting',
    title: `📢 New Job Opening: ${j.job_title || j.title || 'Open Position'}`,
    content: j.job_description || j.description || `Exciting career opportunity in ${getDeptName(j.department_id)}.`,
    type: 'Job Opening',
    created_at: j.posted_date || j.created_at || new Date().toISOString(),
    created_by: j.created_by || 'HR Recruitment',
    jobData: {
      deptName: getDeptName(j.department_id),
      vacancies: j.vacancies || j.openings || 1,
      employment_type: j.employment_type || 'Full-Time',
      location: j.location || 'Headquarters (Hybrid)',
      salary_range: j.salary_range || 'Competitive',
      experience: j.experience_required || '2-4 Years'
    }
  }));

  // Merge and sort newest first
  const combinedNotices = [...announcementItems, ...jobNoticeItems].sort((a, b) => {
    const dateA = new Date(a.created_at || 0);
    const dateB = new Date(b.created_at || 0);
    return dateB - dateA;
  });

  // Filter by tab and search
  const filteredNotices = combinedNotices.filter(item => {
    if (activeFilter === 'announcements' && item.source !== 'announcement') return false;
    if (activeFilter === 'jobs' && item.source !== 'job_posting') return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.content && item.content.toLowerCase().includes(q)) ||
      (item.type && item.type.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <span>Company Notices & Announcements</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Synchronized organizational updates, corporate announcements, and active job openings
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={loadAll}
            disabled={loading}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
            title="Refresh Notices"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-teal-600' : ''}`} />
          </button>

          {isHR && (
            <button
              onClick={() => setIsBroadcastModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 flex items-center space-x-1.5 transition shadow-xs"
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>Post Company Notice</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex space-x-2 text-xs font-medium">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeFilter === 'all'
                ? 'bg-teal-600 text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All Notices ({combinedNotices.length})
          </button>

          <button
            onClick={() => setActiveFilter('announcements')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeFilter === 'announcements'
                ? 'bg-teal-600 text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Announcements ({announcementItems.length})
          </button>

          <button
            onClick={() => setActiveFilter('jobs')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeFilter === 'jobs'
                ? 'bg-teal-600 text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Job Openings ({jobNoticeItems.length})
          </button>
        </div>

        <div className="relative sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notices or openings..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-teal-500"
          />
        </div>
      </div>

      {/* Notices Feed */}
      <div className="space-y-4">
        {filteredNotices.map((item) => {
          const isJob = item.source === 'job_posting';

          return (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border transition shadow-xs ${
                isJob
                  ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-2 flex-1">
                  
                  {/* Title and Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </h3>
                    <Badge
                      variant={
                        isJob ? 'success' :
                        item.type === 'Reminder' ? 'warning' :
                        item.type === 'Alert' ? 'danger' : 'neutral'
                      }
                      size="xs"
                    >
                      {item.type}
                    </Badge>
                  </div>

                  {/* Message Content */}
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {item.content}
                  </p>

                  {/* If Job, display hiring tags */}
                  {isJob && item.jobData && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px]">
                      <div className="p-2 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-emerald-100 dark:border-emerald-900/40 flex items-center space-x-1.5">
                        <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="truncate text-slate-800 dark:text-slate-200 font-medium">
                          {item.jobData.deptName}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-emerald-100 dark:border-emerald-900/40 flex items-center space-x-1.5">
                        <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="text-slate-800 dark:text-slate-200 font-medium">
                          {item.jobData.vacancies} Openings
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-emerald-100 dark:border-emerald-900/40 flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="text-slate-800 dark:text-slate-200 font-medium">
                          {item.jobData.employment_type}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-emerald-100 dark:border-emerald-900/40 flex items-center space-x-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="text-slate-800 dark:text-slate-200 font-medium">
                          {item.jobData.salary_range}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Metadata footer */}
                  <div className="flex items-center space-x-3 text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                    <span>Posted by: <strong className="text-slate-600 dark:text-slate-300">{item.created_by}</strong></span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{new Date(item.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </span>
                  </div>

                </div>
              </div>
            </div>
          );
        })}

        {filteredNotices.length === 0 && !loading && (
          <div className="text-center py-12 px-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400">
            <Megaphone className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">No Notices Found</p>
            <p className="text-xs text-slate-400 mt-0.5">
              There are currently no company announcements or job openings matching your filter.
            </p>
          </div>
        )}

        {loading && filteredNotices.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin text-teal-600" />
            <p className="text-xs">Loading notices and announcements from Supabase...</p>
          </div>
        )}
      </div>

      {/* Broadcast Modal for HR */}
      <Modal isOpen={isBroadcastModalOpen} onClose={() => setIsBroadcastModalOpen(false)} title="Post Company Notice" maxWidth="max-w-md">
        <form onSubmit={handleCreateBroadcast} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Notice Type <span className="text-rose-500">*</span>
            </label>
            <select
              value={broadcastForm.type}
              onChange={(e) => setBroadcastForm({ ...broadcastForm, type: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-teal-500"
            >
              <option value="Announcement">Announcement</option>
              <option value="Reminder">Reminder</option>
              <option value="Alert">Alert</option>
              <option value="Notice">Notice</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Report for Diwali Celebrations in Office Compound"
              value={broadcastForm.title}
              onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Message Content <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              placeholder="Provide complete details of the announcement or notice..."
              value={broadcastForm.content}
              onChange={(e) => setBroadcastForm({ ...broadcastForm, content: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-teal-500"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsBroadcastModalOpen(false)}
              className="px-3.5 py-2 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 transition"
            >
              Publish Notice
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
