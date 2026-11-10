import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Mail, 
  Building2, 
  Network, 
  Eye
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { fetchTableData, insertTableRow } from '../../services/dataStorage';
import { sanitizeInput } from '../../utils/security';

export const EmployeeModule = () => {
  const [employees, setEmployees] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [activeView, setActiveView] = useState('directory');
  
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [newEmpForm, setNewEmpForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: 'employee',
    emp_code: `NX-00${Math.floor(Math.random() * 90 + 10)}`,
    department_id: '',
    designation_id: '',
    reports_to: '',
    employment_type: 'Full-Time',
    blood_group: 'B+',
    emergency_contact: '',
  });

  const loadData = async () => {
    const [empRes, profRes, deptRes, desRes] = await Promise.all([
      fetchTableData('employee_records'),
      fetchTableData('profiles'),
      fetchTableData('departments'),
      fetchTableData('designations'),
    ]);
    setEmployees(empRes.data || []);
    setProfiles(profRes.data || []);
    setDepartments(deptRes.data || []);
    setDesignations(desRes.data || []);
    if (deptRes.data?.length > 0 && !newEmpForm.department_id) {
      setNewEmpForm(prev => ({
        ...prev,
        department_id: deptRes.data[0].id,
        designation_id: desRes.data?.[0]?.id || ''
      }));
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const enrichedEmployees = employees.map(emp => {
    const prof = profiles.find(p => p.id === emp.profile_id) || {};
    const dept = departments.find(d => d.id === emp.department_id) || { name: 'Unassigned', code: 'N/A' };
    const des = designations.find(d => d.id === emp.designation_id) || { title: 'Employee', level: 'L1' };
    const managerEmp = employees.find(e => e.id === emp.reports_to);
    const managerProf = managerEmp ? profiles.find(p => p.id === managerEmp.profile_id) : null;

    return {
      ...emp,
      profile: prof,
      department: dept,
      designation: des,
      managerName: managerProf?.full_name || 'Executive Board',
    };
  });

  const filteredEmployees = enrichedEmployees.filter(emp => {
    const nameMatch = (emp.profile?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (emp.emp_code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (emp.profile?.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    const deptMatch = selectedDept === 'all' || emp.department_id === selectedDept;
    return nameMatch && deptMatch;
  });

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    const newProfileId = `usr-${Date.now().toString().slice(-4)}`;
    
    const newProfile = {
      id: newProfileId,
      full_name: sanitizeInput(newEmpForm.full_name),
      email: sanitizeInput(newEmpForm.email).toLowerCase(),
      phone: sanitizeInput(newEmpForm.phone),
      role: newEmpForm.role,
      avatar_url: `https://images.unsplash.com/photo-1534528741775?w=150`,
      status: 'active'
    };
    await insertTableRow('profiles', newProfile);

    const newRecord = {
      id: `emp-${Date.now().toString().slice(-4)}`,
      profile_id: newProfileId,
      emp_code: sanitizeInput(newEmpForm.emp_code),
      department_id: newEmpForm.department_id,
      designation_id: newEmpForm.designation_id,
      reports_to: newEmpForm.reports_to || null,
      date_of_joining: new Date().toISOString().split('T')[0],
      employment_type: newEmpForm.employment_type,
      blood_group: newEmpForm.blood_group,
      emergency_contact: sanitizeInput(newEmpForm.emergency_contact),
      status: 'active'
    };
    await insertTableRow('employee_records', newRecord);

    setIsAddModalOpen(false);
    await loadData();
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Employees
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Directory and organizational structure
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 flex text-xs font-medium">
            <button
              onClick={() => setActiveView('directory')}
              className={`px-3 py-1.5 rounded-md transition ${
                activeView === 'directory' ? 'bg-white dark:bg-slate-700 shadow-xs text-slate-900 dark:text-white' : 'text-slate-500'
              }`}
            >
              Directory
            </button>
            <button
              onClick={() => setActiveView('orgchart')}
              className={`px-3 py-1.5 rounded-md transition flex items-center space-x-1 ${
                activeView === 'orgchart' ? 'bg-white dark:bg-slate-700 shadow-xs text-slate-900 dark:text-white' : 'text-slate-500'
              }`}
            >
              <Network className="w-3.5 h-3.5 mr-1" />
              <span>Org Chart</span>
            </button>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 flex items-center space-x-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {activeView === 'directory' ? (
        <>
          {/* Search & Filter Toolbar */}
          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div className="flex items-center space-x-1.5 w-full sm:w-auto overflow-x-auto">
              <button
                onClick={() => setSelectedDept('all')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                  selectedDept === 'all'
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                All
              </button>
              {departments.map((dept) => (
                <button
                  key={dept.id}
                  onClick={() => setSelectedDept(dept.id)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                    selectedDept === dept.id
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {dept.code}
                </button>
              ))}
            </div>
          </div>

          {/* Employee Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEmployees.map((emp) => (
              <div
                key={emp.id}
                className="rounded-xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={emp.profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775?w=150'}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                          {emp.profile?.full_name}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {emp.designation?.title}
                        </p>
                      </div>
                    </div>
                    <Badge variant="neutral" size="xs">
                      {emp.emp_code}
                    </Badge>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center">
                      <Building2 className="w-3.5 h-3.5 mr-2 text-slate-400" />
                      <span>{emp.department?.name}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="w-3.5 h-3.5 mr-2 text-slate-400" />
                      <span className="truncate">{emp.profile?.email}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Joined {emp.date_of_joining}
                  </span>
                  <button
                    onClick={() => setSelectedEmp(emp)}
                    className="text-xs font-medium text-teal-600 dark:text-teal-400 hover:underline flex items-center space-x-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Profile</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* Simple Org Chart */
        <div className="rounded-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6">Reporting Hierarchy</h3>

          <div className="flex flex-col items-center space-y-6">
            {enrichedEmployees.filter(e => !e.reports_to).map(director => (
              <div key={director.id} className="flex flex-col items-center">
                <div className="p-3.5 rounded-xl bg-teal-600 text-white text-center w-52 shadow-sm">
                  <img src={director.profile?.avatar_url} alt="" className="w-10 h-10 rounded-full mx-auto object-cover mb-1.5" />
                  <h4 className="font-semibold text-xs">{director.profile?.full_name}</h4>
                  <p className="text-[11px] text-teal-100">{director.designation?.title}</p>
                </div>

                <div className="w-px h-6 bg-slate-300 dark:bg-slate-700" />
                <div className="w-3/4 max-w-xl h-px bg-slate-300 dark:bg-slate-700" />

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3">
                  {enrichedEmployees.filter(e => e.reports_to === director.id).map(report => (
                    <div key={report.id} className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-center w-40">
                      <img src={report.profile?.avatar_url} alt="" className="w-8 h-8 rounded-full mx-auto object-cover mb-1" />
                      <h5 className="font-medium text-xs text-slate-900 dark:text-white truncate">{report.profile?.full_name}</h5>
                      <p className="text-[10px] text-slate-400 truncate">{report.designation?.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Employee Details Modal */}
      {selectedEmp && (
        <Modal isOpen={Boolean(selectedEmp)} onClose={() => setSelectedEmp(null)} title="Employee Details" maxWidth="max-w-md">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img
                src={selectedEmp.profile?.avatar_url}
                alt=""
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{selectedEmp.profile?.full_name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{selectedEmp.designation?.title}</p>
                <span className="text-[10px] font-mono text-teal-600 dark:text-teal-400">{selectedEmp.emp_code}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                <span className="text-slate-400">Email</span>
                <p className="font-medium text-slate-800 dark:text-slate-200 truncate mt-0.5">{selectedEmp.profile?.email}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                <span className="text-slate-400">Phone</span>
                <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">{selectedEmp.profile?.phone || 'N/A'}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                <span className="text-slate-400">Department</span>
                <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">{selectedEmp.department?.name}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                <span className="text-slate-400">Joining Date</span>
                <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">{selectedEmp.date_of_joining}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                <span className="text-slate-400">Reports To</span>
                <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">{selectedEmp.managerName}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                <span className="text-slate-400">Type</span>
                <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">{selectedEmp.employment_type}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedEmp(null)}
                className="px-4 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Employee Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Employee" maxWidth="max-w-md">
        <form onSubmit={handleCreateEmployee} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Rahul Sharma"
              value={newEmpForm.full_name}
              onChange={(e) => setNewEmpForm({ ...newEmpForm, full_name: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Email</label>
            <input
              type="email"
              required
              placeholder="rahul.sharma@nexushr.com"
              value={newEmpForm.email}
              onChange={(e) => setNewEmpForm({ ...newEmpForm, email: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Department</label>
              <select
                value={newEmpForm.department_id}
                onChange={(e) => setNewEmpForm({ ...newEmpForm, department_id: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Designation</label>
              <select
                value={newEmpForm.designation_id}
                onChange={(e) => setNewEmpForm({ ...newEmpForm, designation_id: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                {designations.map((des) => (
                  <option key={des.id} value={des.id}>{des.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Role</label>
              <select
                value={newEmpForm.role}
                onChange={(e) => setNewEmpForm({ ...newEmpForm, role: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="hr">HR</option>
                <option value="recruiter">Recruiter</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Reports To</label>
              <select
                value={newEmpForm.reports_to}
                onChange={(e) => setNewEmpForm({ ...newEmpForm, reports_to: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                <option value="">Executive Board</option>
                {enrichedEmployees.map((e) => (
                  <option key={e.id} value={e.id}>{e.profile?.full_name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700"
            >
              Save Employee
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
