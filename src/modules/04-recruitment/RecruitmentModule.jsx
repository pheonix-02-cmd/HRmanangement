import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Users, 
  Calendar, 
  FileCheck, 
  CheckCircle2, 
  Plus, 
  Clock, 
  Video,
  Pencil,
  Building2,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { fetchTableData, insertTableRow, updateTableRow } from '../../services/dataStorage';
import { sanitizeInput } from '../../utils/security';

export const RecruitmentModule = () => {
  const { user } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState('jobs');
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [offerLetters, setOfferLetters] = useState([]);
  const [onboarding, setOnboarding] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Modals state
  const [isNewJobModalOpen, setIsNewJobModalOpen] = useState(false);
  const [isEditJobModalOpen, setIsEditJobModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  
  const [selectedApp, setSelectedApp] = useState(null);
  const [editingJob, setEditingJob] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  // Creation Mode: 'existing' | 'new_dept'
  const [jobMode, setJobMode] = useState('existing');

  // New Department Form state
  const [newDeptForm, setNewDeptForm] = useState({
    name: '',
    description: ''
  });

  // New Job Opening Form state
  const [newJob, setNewJob] = useState({
    title: '',
    department_id: '',
    employment_type: 'Full-Time',
    location: 'Headquarters (Hybrid)',
    experience_required: '2-4 Years',
    openings: 2,
    salary_range: '₹10,00,000 - ₹15,00,000 PA',
    description: '',
  });

  const [scheduleForm, setScheduleForm] = useState({
    scheduled_at: '2026-11-15T14:30',
    mode: 'Video',
    meet_link: 'https://meet.google.com/nexushr-eval',
    duration_minutes: 45
  });

  const [offerForm, setOfferForm] = useState({
    offered_salary: '1400000',
    joining_date: '2026-12-01',
    expiry_date: '2026-11-20'
  });

  // Get Suggested Titles based on Department
  const getSuggestedTitles = (deptId) => {
    const d = departments.find(item => String(item.department_id || item.id) === String(deptId));
    const name = (d?.department_name || d?.name || '').toLowerCase();
    
    if (name.includes('it') || name.includes('software') || name.includes('tech') || String(deptId) === '101') {
      return [
        'Software Developer',
        'Full-Stack Engineer',
        'Frontend Developer',
        'Backend Developer',
        'DevOps & Cloud Engineer',
        'System Architect',
        'QA Automation Engineer'
      ];
    }
    if (name.includes('hr') || name.includes('admin') || name.includes('human') || String(deptId) === '102') {
      return [
        'HR Executive',
        'HR Manager',
        'Talent Acquisition Specialist',
        'Admin Officer',
        'People Operations Lead',
        'Recruitment Specialist'
      ];
    }
    if (name.includes('finance') || name.includes('account')) {
      return [
        'Senior Financial Analyst',
        'Accounts Manager',
        'Auditor',
        'Payroll Specialist'
      ];
    }
    if (name.includes('design') || name.includes('product')) {
      return [
        'Lead Product Designer',
        'UI/UX Designer',
        'Product Manager'
      ];
    }
    return [
      'Team Lead',
      'Senior Specialist',
      'Operations Coordinator',
      'Department Associate'
    ];
  };

  const getDeptName = (deptId) => {
    const d = departments.find(item => String(item.department_id || item.id) === String(deptId));
    return d?.department_name || d?.name || `Department ${deptId}`;
  };

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
      const firstDept = depts[0];
      const firstDeptId = firstDept.department_id || firstDept.id;
      const titles = getSuggestedTitles(firstDeptId);
      
      setNewJob(prev => ({
        ...prev,
        department_id: firstDeptId,
        description: firstDept.description ? `Handles ${firstDept.department_name || 'department'} operations. Responsibilities include cross-functional collaboration and operational execution.` : prev.description,
        title: titles[0] || 'Software Developer'
      }));
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // When selecting an existing department from dropdown
  const handleDepartmentChange = (deptId) => {
    const selected = departments.find(d => String(d.department_id || d.id) === String(deptId));
    const titles = getSuggestedTitles(deptId);
    const deptDesc = selected?.description || '';

    setNewJob(prev => ({
      ...prev,
      department_id: deptId,
      description: deptDesc ? `Handles ${selected?.department_name || 'department'} operations. Key responsibilities include technical execution, cross-functional collaboration, and adherence to company standards.` : prev.description,
      title: titles[0] || prev.title
    }));
  };

  // Create Job Opening (Existing or New Department)
  const handleCreateJob = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMessage({ type: '', text: '' });

    try {
      let targetDeptId = newJob.department_id;

      // Handle New Department creation
      if (jobMode === 'new_dept') {
        if (!newDeptForm.name.trim()) {
          setStatusMessage({ type: 'error', text: 'Please enter a name for the new department.' });
          setSubmitting(false);
          return;
        }

        const maxId = departments.reduce((max, d) => {
          const num = Number(d.department_id || d.id) || 0;
          return num > max ? num : max;
        }, 100);
        const nextDeptId = maxId + 1;

        const newDeptRecord = {
          department_id: nextDeptId,
          department_name: sanitizeInput(newDeptForm.name.trim()),
          description: sanitizeInput(newDeptForm.description.trim()) || `Handles ${newDeptForm.name.trim()} operations and initiatives.`,
          created_at: new Date().toISOString()
        };

        await insertTableRow('departments', newDeptRecord);
        targetDeptId = nextDeptId;
      }

      const numericJobId = Math.floor(Date.now() % 1000000);
      const creatorId = user?.employee_id || 'EMP001';

      const created = {
        job_id: numericJobId,
        id: `job-${numericJobId}`,
        job_title: sanitizeInput(newJob.title),
        title: sanitizeInput(newJob.title),
        department_id: Number(targetDeptId),
        employment_type: 'Full-Time', // Matches DB check constraint
        location: sanitizeInput(newJob.location) || 'Headquarters (Hybrid)',
        experience_required: sanitizeInput(newJob.experience_required) || '2-4 Years',
        vacancies: Number(newJob.openings) || 1,
        openings: Number(newJob.openings) || 1,
        salary_range: sanitizeInput(newJob.salary_range) || '₹10,00,000 - ₹15,00,000 PA',
        job_description: sanitizeInput(newJob.description),
        description: sanitizeInput(newJob.description),
        status: 'Published', // Matches DB check constraint
        posted_date: new Date().toISOString().split('T')[0],
        created_by: creatorId,
        created_at: new Date().toISOString()
      };

      await insertTableRow('job_postings', created);
      setIsNewJobModalOpen(false);
      setNewDeptForm({ name: '', description: '' });
      setStatusMessage({ type: 'success', text: 'Job opening successfully posted and saved to database!' });
      await loadAll();
    } catch (err) {
      console.error('Failed to create job opening:', err);
      setStatusMessage({ type: 'error', text: err.message || 'Failed to post job opening.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Update existing job opening
  const handleEditJob = async (e) => {
    e.preventDefault();
    if (!editingJob) return;
    setSubmitting(true);
    setStatusMessage({ type: '', text: '' });

    try {
      const targetId = editingJob.job_id || editingJob.id;
      const updates = {
        job_title: sanitizeInput(editingJob.title || editingJob.job_title),
        title: sanitizeInput(editingJob.title || editingJob.job_title),
        vacancies: Number(editingJob.openings || editingJob.vacancies) || 1,
        openings: Number(editingJob.openings || editingJob.vacancies) || 1,
        job_description: sanitizeInput(editingJob.description || editingJob.job_description),
        description: sanitizeInput(editingJob.description || editingJob.job_description),
        status: editingJob.status || 'Published',
        location: sanitizeInput(editingJob.location) || 'Headquarters (Hybrid)',
        salary_range: sanitizeInput(editingJob.salary_range) || '₹10,00,000 - ₹15,00,000 PA',
        updated_at: new Date().toISOString()
      };

      await updateTableRow('job_postings', targetId, updates);
      setIsEditJobModalOpen(false);
      setEditingJob(null);
      setStatusMessage({ type: 'success', text: 'Job opening description updated successfully!' });
      await loadAll();
    } catch (err) {
      console.error('Failed to update job opening:', err);
      setStatusMessage({ type: 'error', text: err.message || 'Failed to update job opening.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;

    const newInterview = {
      id: `int-${Date.now().toString().slice(-4)}`,
      application_id: selectedApp.id,
      interviewer_id: user?.employee_id || 'EMP001',
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
      designation_id: 201,
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

  const currentTitles = getSuggestedTitles(newJob.department_id);

  return (
    <div className="space-y-6">
      
      {/* Toast Alert */}
      {statusMessage.text && (
        <div className={`p-3 rounded-xl border flex items-center justify-between text-xs transition ${
          statusMessage.type === 'error'
            ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-400'
            : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-400'
        }`}>
          <div className="flex items-center space-x-2">
            {statusMessage.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage({ type: '', text: '' })} className="underline font-semibold ml-4">Dismiss</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Recruitment & Hiring
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Job postings, applicants, and interview schedules synchronized with Supabase
          </p>
        </div>

        <button
          onClick={() => {
            setIsNewJobModalOpen(true);
            setJobMode('existing');
          }}
          className="px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 flex items-center space-x-1.5 transition shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Job Opening</span>
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
          Job Openings ({jobs.length})
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

      {/* Jobs Tab */}
      {activeSubTab === 'jobs' && (
        <div>
          {jobs.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">No Job Openings Posted Yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Create your first opening in an existing department or introduce a new department position.
              </p>
              <button
                onClick={() => {
                  setIsNewJobModalOpen(true);
                  setJobMode('existing');
                }}
                className="mt-4 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 transition"
              >
                + Post Job Opening
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobs.map((job) => {
                const deptName = getDeptName(job.department_id);
                const title = job.job_title || job.title || 'Untitled Opening';
                const description = job.job_description || job.description || 'No description provided.';
                const openings = job.vacancies || job.openings || 1;
                const status = job.status || 'Published';

                return (
                  <div key={job.job_id || job.id} className="rounded-xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-900/60 truncate max-w-[180px]">
                          {deptName}
                        </span>
                        <Badge variant={status.toLowerCase() === 'published' ? 'success' : 'neutral'} size="xs">
                          {status}
                        </Badge>
                      </div>

                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mt-2.5">
                        {title}
                      </h3>
                      
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-3 leading-relaxed">
                        {description}
                      </p>

                      <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] space-y-1.5 text-slate-600 dark:text-slate-300">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Location</span>
                          <span className="font-medium">{job.location || 'Headquarters (Hybrid)'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Openings</span>
                          <span className="font-medium font-mono">{openings} {Number(openings) === 1 ? 'Position' : 'Positions'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Package Range</span>
                          <span className="font-medium font-mono text-teal-600 dark:text-teal-400">{job.salary_range || 'Competitive'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Edit Button */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-mono">
                        ID: #{job.job_id || job.id}
                      </span>
                      <button
                        onClick={() => {
                          setEditingJob({
                            ...job,
                            title: title,
                            description: description,
                            openings: openings,
                            status: status,
                            location: job.location || 'Headquarters (Hybrid)',
                            salary_range: job.salary_range || '₹10,00,000 - ₹15,00,000 PA'
                          });
                          setIsEditJobModalOpen(true);
                        }}
                        className="inline-flex items-center space-x-1.5 px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium transition"
                      >
                        <Pencil className="w-3.5 h-3.5 text-teal-600" />
                        <span>Edit Description</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Applicants Tab */}
      {activeSubTab === 'pipeline' && (
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-x-auto shadow-xs">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-[11px] bg-slate-50/50 dark:bg-slate-800/40">
                <th className="py-2.5 px-3">Candidate</th>
                <th className="py-2.5 px-3">Position</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {applications.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-400 text-xs">No active applications in pipeline.</td>
                </tr>
              ) : (
                applications.map((app) => {
                  const cand = candidates.find(c => c.id === app.candidate_id);
                  const job = jobs.find(j => (j.job_id || j.id) === app.job_posting_id);

                  return (
                    <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-2.5 px-3">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                          {cand ? `${cand.first_name} ${cand.last_name}` : 'Applicant'}
                        </p>
                        <p className="text-[11px] text-slate-400">{cand?.email}</p>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300 font-medium">
                        {job?.job_title || job?.title || 'General Position'}
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
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Interviews Tab */}
      {activeSubTab === 'interviews' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {interviews.length === 0 ? (
            <div className="col-span-2 text-center py-8 text-slate-400 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              No interviews scheduled.
            </div>
          ) : (
            interviews.map((intItem) => {
              const app = applications.find(a => a.id === intItem.application_id);
              const cand = candidates.find(c => c.id === app?.candidate_id);
              const job = jobs.find(j => (j.job_id || j.id) === app?.job_posting_id);

              return (
                <div key={intItem.id} className="rounded-xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs shadow-xs">
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
                    <p className="text-slate-400">{job?.job_title || job?.title}</p>
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
            })
          )}
        </div>
      )}

      {/* Offers & Onboarding Tab */}
      {activeSubTab === 'onboarding' && (
        <div className="space-y-4">
          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Issued Offers</h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {offerLetters.length === 0 ? (
                <p className="py-4 text-slate-400 text-center">No offer letters generated yet.</p>
              ) : (
                offerLetters.map((off) => {
                  const cand = candidates.find(c => c.id === off.candidate_id);
                  return (
                    <div key={off.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{cand?.first_name} {cand?.last_name}</p>
                        <p className="text-slate-400">Joining: {off.joining_date} • CTC: ₹{Number(off.offered_salary).toLocaleString('en-IN')}</p>
                      </div>
                      <Badge variant="neutral" size="xs">{off.status}</Badge>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: Post New Job Opening (Existing or New Dept)     */}
      {/* ======================================================== */}
      <Modal 
        isOpen={isNewJobModalOpen} 
        onClose={() => setIsNewJobModalOpen(false)} 
        title="Post New Job Opening" 
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreateJob} className="space-y-4">
          
          {/* Department Mode Selector Tabs */}
          <div className="p-1 rounded-xl bg-slate-100 dark:bg-slate-800 grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => setJobMode('existing')}
              className={`py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition ${
                jobMode === 'existing'
                  ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Existing Department</span>
            </button>
            <button
              type="button"
              onClick={() => setJobMode('new_dept')}
              className={`py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition ${
                jobMode === 'new_dept'
                  ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Department</span>
            </button>
          </div>

          {/* MODE A: Existing Department */}
          {jobMode === 'existing' ? (
            <div className="space-y-3 p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select Department
                </label>
                <select
                  required
                  value={newJob.department_id}
                  onChange={(e) => handleDepartmentChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                >
                  {departments.map((d) => {
                    const dId = d.department_id || d.id;
                    const dName = d.department_name || d.name || `Department ${dId}`;
                    return (
                      <option key={dId} value={dId}>
                        {dName} (ID: {dId})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Department Overview Banner */}
              {(() => {
                const cur = departments.find(d => String(d.department_id || d.id) === String(newJob.department_id));
                return cur?.description ? (
                  <p className="text-[11px] text-slate-500 italic px-2 py-1 rounded bg-white dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50">
                    Dept Scope: {cur.description}
                  </p>
                ) : null;
              })()}
            </div>
          ) : (
            /* MODE B: New Department */
            <div className="space-y-3 p-3.5 rounded-xl bg-teal-50/50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/60">
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-teal-800 dark:text-teal-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Create New Department Entity</span>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  New Department Name
                </label>
                <input
                  type="text"
                  required={jobMode === 'new_dept'}
                  placeholder="e.g. Finance & Accounts, Product Design, Marketing..."
                  value={newDeptForm.name}
                  onChange={(e) => setNewDeptForm({ ...newDeptForm, name: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Department Scope & Responsibilities
                </label>
                <input
                  type="text"
                  placeholder="Brief summary of department responsibilities..."
                  value={newDeptForm.description}
                  onChange={(e) => {
                    const desc = e.target.value;
                    setNewDeptForm({ ...newDeptForm, description: desc });
                    // Auto-sync into job description if not customized
                    setNewJob(prev => ({
                      ...prev,
                      description: `Role in ${newDeptForm.name || 'New Department'}: ${desc}. Responsibilities include department roadmap execution and cross-team delivery.`
                    }));
                  }}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
            </div>
          )}

          {/* Job Title with Standard Suggestions */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Job Position / Title
              </label>
              {jobMode === 'existing' && (
                <span className="text-[10px] text-teal-600 dark:text-teal-400">
                  Select suggestion or type custom
                </span>
              )}
            </div>

            <div className="space-y-2">
              <input
                type="text"
                required
                placeholder="e.g. Software Developer, HR Executive..."
                value={newJob.title}
                onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
              />

              {/* Title Suggestion Pills for Current Department */}
              {jobMode === 'existing' && currentTitles.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-0.5">
                  <span className="text-[10px] text-slate-400 self-center mr-1">Suggested:</span>
                  {currentTitles.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setNewJob({ ...newJob, title: t })}
                      className={`text-[10px] px-2 py-0.5 rounded-full border transition ${
                        newJob.title === t
                          ? 'bg-teal-600 text-white border-teal-600 font-semibold'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-teal-500'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Openings & Location */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Number of Openings
              </label>
              <input
                type="number"
                min={1}
                required
                value={newJob.openings}
                onChange={(e) => setNewJob({ ...newJob, openings: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Work Location
              </label>
              <input
                type="text"
                value={newJob.location}
                onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
          </div>

          {/* Description (Pre-populated from Department & Fully Editable) */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Job Description & Scope
              </label>
              <span className="text-[10px] text-teal-600 dark:text-teal-400 font-medium">
                Editable • Customize or Add More
              </span>
            </div>
            <textarea
              rows={4}
              required
              placeholder="Responsibilities, requirements, and qualifications..."
              value={newJob.description}
              onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 leading-relaxed"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              disabled={submitting}
              onClick={() => setIsNewJobModalOpen(false)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 transition disabled:opacity-50"
            >
              {submitting ? 'Posting...' : 'Post Job Opening'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL 2: Edit Job Opening & Add More Description         */}
      {/* ======================================================== */}
      <Modal
        isOpen={isEditJobModalOpen}
        onClose={() => {
          setIsEditJobModalOpen(false);
          setEditingJob(null);
        }}
        title="Edit Job Opening & Description"
        maxWidth="max-w-lg"
      >
        {editingJob && (
          <form onSubmit={handleEditJob} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Job Position / Title
              </label>
              <input
                type="text"
                required
                value={editingJob.title}
                onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Vacancies / Openings
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={editingJob.openings}
                  onChange={(e) => setEditingJob({ ...editingJob, openings: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Status
                </label>
                <select
                  value={editingJob.status}
                  onChange={(e) => setEditingJob({ ...editingJob, status: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="Published">Published (Active)</option>
                  <option value="Draft">Draft</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Job Description (Add or Edit)
                </label>
                <span className="text-[10px] text-teal-600 dark:text-teal-400">
                  Add more details & requirements
                </span>
              </div>
              <textarea
                rows={5}
                required
                value={editingJob.description}
                onChange={(e) => setEditingJob({ ...editingJob, description: e.target.value })}
                placeholder="Edit or add more details to the description..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 leading-relaxed font-sans"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                disabled={submitting}
                onClick={() => {
                  setIsEditJobModalOpen(false);
                  setEditingJob(null);
                }}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 transition disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
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
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Offer Expiry</label>
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
