import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Users, 
  Calendar, 
  FileCheck, 
  CheckCircle2, 
  Plus, 
  Clock, 
  Video
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { fetchTableData, insertTableRow, updateTableRow } from '../../services/dataStorage';
import { sanitizeInput } from '../../utils/security';

export const RecruitmentModule = () => {
  const [activeSubTab, setActiveSubTab] = useState('jobs');
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [offerLetters, setOfferLetters] = useState([]);
  const [onboarding, setOnboarding] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [isNewJobModalOpen, setIsNewJobModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);

  const [newJob, setNewJob] = useState({
    title: '',
    department_id: '',
    employment_type: 'Full-Time',
    location: 'Headquarters (Hybrid)',
    experience_required: '3-5 Years',
    openings: 2,
    salary_range: '₹10,00,000 - ₹15,00,000 PA',
    description: '',
  });

  const [scheduleForm, setScheduleForm] = useState({
    scheduled_at: '2026-11-10T14:30',
    mode: 'Video',
    meet_link: 'https://meet.google.com/nexushr-eval',
    duration_minutes: 45
  });

  const [offerForm, setOfferForm] = useState({
    offered_salary: '1400000',
    joining_date: '2026-12-01',
    expiry_date: '2026-11-20'
  });

  const loadAll = async () => {
    const [jRes, cRes, aRes, iRes, oRes, onbRes, dRes] = await Promise.all([
      fetchTableData('job_postings'),
      fetchTableData('candidates'),
      fetchTableData('applications'),
      fetchTableData('interviews'),
      fetchTableData('offer_letters'),
      fetchTableData('onboarding'),
      fetchTableData('departments'),
    ]);
    setJobs(jRes.data || []);
    setCandidates(cRes.data || []);
    setApplications(aRes.data || []);
    setInterviews(iRes.data || []);
    setOfferLetters(oRes.data || []);
    setOnboarding(onbRes.data || []);
    const depts = dRes.data || [];
    setDepartments(depts);
    if (depts.length > 0 && !newJob.department_id) {
      setNewJob(prev => ({ ...prev, department_id: depts[0].id }));
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleCreateJob = async (e) => {
    e.preventDefault();
    const created = {
      id: `job-${Date.now().toString().slice(-4)}`,
      title: sanitizeInput(newJob.title),
      department_id: newJob.department_id,
      employment_type: newJob.employment_type,
      location: sanitizeInput(newJob.location),
      experience_required: sanitizeInput(newJob.experience_required),
      openings: Number(newJob.openings) || 1,
      salary_range: sanitizeInput(newJob.salary_range),
      description: sanitizeInput(newJob.description),
      status: 'published',
      posted_date: new Date().toISOString().split('T')[0]
    };
    await insertTableRow('job_postings', created);
    setIsNewJobModalOpen(false);
    await loadAll();
  };

  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;

    const newInterview = {
      id: `int-${Date.now().toString().slice(-4)}`,
      application_id: selectedApp.id,
      interviewer_id: 'emp-2',
      scheduled_at: new Date(scheduleForm.scheduled_at).toISOString(),
      duration_minutes: Number(scheduleForm.duration_minutes),
      mode: scheduleForm.mode,
      meet_link: scheduleForm.meet_link,
      status: 'scheduled',
      feedback: 'Interview scheduled by HR team.',
      score: null
    };

    await insertTableRow('interviews', newInterview);
    await updateTableRow('applications', selectedApp.id, { status: 'interview' });
    setIsScheduleModalOpen(false);
    await loadAll();
  };

  const handleIssueOffer = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;

    const newOffer = {
      id: `off-${Date.now().toString().slice(-4)}`,
      application_id: selectedApp.id,
      candidate_id: selectedApp.candidate_id,
      designation_id: 'des-5',
      offered_salary: parseFloat(offerForm.offered_salary) || 1200000,
      joining_date: offerForm.joining_date,
      expiry_date: offerForm.expiry_date,
      status: 'sent',
      created_at: new Date().toISOString()
    };

    await insertTableRow('offer_letters', newOffer);
    await updateTableRow('applications', selectedApp.id, { status: 'offered' });
    setIsOfferModalOpen(false);
    await loadAll();
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Recruitment & Hiring
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Job postings, applicants, and interview schedules
          </p>
        </div>

        <button
          onClick={() => setIsNewJobModalOpen(true)}
          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 flex items-center space-x-1.5 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Post Job</span>
        </button>
      </div>

      {/* Sub tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-medium space-x-6">
        <button
          onClick={() => setActiveSubTab('jobs')}
          className={`pb-2.5 border-b-2 transition ${
            activeSubTab === 'jobs'
              ? 'border-teal-600 text-teal-600 dark:text-teal-400 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Jobs ({jobs.length})
        </button>

        <button
          onClick={() => setActiveSubTab('pipeline')}
          className={`pb-2.5 border-b-2 transition ${
            activeSubTab === 'pipeline'
              ? 'border-teal-600 text-teal-600 dark:text-teal-400 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Applicants ({applications.length})
        </button>

        <button
          onClick={() => setActiveSubTab('interviews')}
          className={`pb-2.5 border-b-2 transition ${
            activeSubTab === 'interviews'
              ? 'border-teal-600 text-teal-600 dark:text-teal-400 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Interviews ({interviews.length})
        </button>

        <button
          onClick={() => setActiveSubTab('onboarding')}
          className={`pb-2.5 border-b-2 transition ${
            activeSubTab === 'onboarding'
              ? 'border-teal-600 text-teal-600 dark:text-teal-400 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Offers & Onboarding ({offerLetters.length})
        </button>
      </div>

      {/* Jobs */}
      {activeSubTab === 'jobs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job) => {
            const dept = departments.find(d => d.id === job.department_id);

            return (
              <div key={job.id} className="rounded-xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {dept?.code}
                    </span>
                    <Badge variant={job.status === 'published' ? 'success' : 'neutral'} size="xs">
                      {job.status}
                    </Badge>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mt-2">
                    {job.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {job.description}
                  </p>

                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs space-y-1 text-slate-600 dark:text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Location</span>
                      <span>{job.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Openings</span>
                      <span>{job.openings}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Applicants */}
      {activeSubTab === 'pipeline' && (
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-[11px]">
                <th className="py-2.5 px-3">Candidate</th>
                <th className="py-2.5 px-3">Position</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {applications.map((app) => {
                const cand = candidates.find(c => c.id === app.candidate_id);
                const job = jobs.find(j => j.id === app.job_posting_id);

                return (
                  <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {cand ? `${cand.first_name} ${cand.last_name}` : 'Applicant'}
                      </p>
                      <p className="text-[11px] text-slate-400">{cand?.email}</p>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                      {job?.title}
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge variant="neutral" size="xs">
                        {app.status}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 text-right space-x-1.5">
                      <button
                        onClick={() => {
                          setSelectedApp(app);
                          setIsScheduleModalOpen(true);
                        }}
                        className="px-2.5 py-1 rounded text-xs font-medium text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/40"
                      >
                        Schedule
                      </button>
                      <button
                        onClick={() => {
                          setSelectedApp(app);
                          setIsOfferModalOpen(true);
                        }}
                        className="px-2.5 py-1 rounded text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                      >
                        Offer
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Interviews */}
      {activeSubTab === 'interviews' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {interviews.map((intItem) => {
            const app = applications.find(a => a.id === intItem.application_id);
            const cand = candidates.find(c => c.id === app?.candidate_id);
            const job = jobs.find(j => j.id === app?.job_posting_id);

            return (
              <div key={intItem.id} className="rounded-xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">
                    {new Date(intItem.scheduled_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <Badge variant="neutral" size="xs">{intItem.status}</Badge>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">
                    {cand ? `${cand.first_name} ${cand.last_name}` : 'Applicant'}
                  </h4>
                  <p className="text-slate-400">{job?.title}</p>
                </div>

                {intItem.meet_link && (
                  <a
                    href={intItem.meet_link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 text-teal-600 dark:text-teal-400 hover:underline pt-1"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Join Meeting</span>
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Offers & Onboarding */}
      {activeSubTab === 'onboarding' && (
        <div className="space-y-4">
          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Issued Offers</h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {offerLetters.map((off) => {
                const cand = candidates.find(c => c.id === off.candidate_id);
                return (
                  <div key={off.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{cand?.first_name} {cand?.last_name}</p>
                      <p className="text-slate-400">Joining: {off.joining_date}</p>
                    </div>
                    <Badge variant="neutral" size="xs">{off.status}</Badge>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* New Job Modal */}
      <Modal isOpen={isNewJobModalOpen} onClose={() => setIsNewJobModalOpen(false)} title="New Job Opening" maxWidth="max-w-md">
        <form onSubmit={handleCreateJob} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Frontend Engineer"
              value={newJob.title}
              onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Department</label>
              <select
                value={newJob.department_id}
                onChange={(e) => setNewJob({ ...newJob, department_id: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Openings</label>
              <input
                type="number"
                value={newJob.openings}
                onChange={(e) => setNewJob({ ...newJob, openings: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Description</label>
            <textarea
              rows={3}
              placeholder="Responsibilities and requirements..."
              value={newJob.description}
              onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsNewJobModalOpen(false)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700"
            >
              Post Job
            </button>
          </div>
        </form>
      </Modal>

      {/* Schedule Interview Modal */}
      <Modal isOpen={isScheduleModalOpen} onClose={() => setIsScheduleModalOpen(false)} title="Schedule Interview" maxWidth="max-w-md">
        <form onSubmit={handleScheduleInterview} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Date & Time</label>
            <input
              type="datetime-local"
              required
              value={scheduleForm.scheduled_at}
              onChange={(e) => setScheduleForm({ ...scheduleForm, scheduled_at: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Meeting Link</label>
            <input
              type="url"
              value={scheduleForm.meet_link}
              onChange={(e) => setScheduleForm({ ...scheduleForm, meet_link: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsScheduleModalOpen(false)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700"
            >
              Schedule
            </button>
          </div>
        </form>
      </Modal>

      {/* Offer Modal */}
      <Modal isOpen={isOfferModalOpen} onClose={() => setIsOfferModalOpen(false)} title="Issue Offer" maxWidth="max-w-md">
        <form onSubmit={handleIssueOffer} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Annual CTC (₹)</label>
            <input
              type="number"
              required
              value={offerForm.offered_salary}
              onChange={(e) => setOfferForm({ ...offerForm, offered_salary: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Joining Date</label>
              <input
                type="date"
                required
                value={offerForm.joining_date}
                onChange={(e) => setOfferForm({ ...offerForm, joining_date: e.target.value })}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Valid Until</label>
              <input
                type="date"
                required
                value={offerForm.expiry_date}
                onChange={(e) => setOfferForm({ ...offerForm, expiry_date: e.target.value })}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsOfferModalOpen(false)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700"
            >
              Send Offer
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
