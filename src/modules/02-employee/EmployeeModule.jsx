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
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: 'employee',
    department_id: '',
    designation_id: '',
    manager_id: '',
    employment_type: 'Full-Time',
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
        department_id: deptRes.data[0].department_id || deptRes.data[0].id,
        designation_id: desRes.data?.[0]?.designation_id || desRes.data?.[0]?.id || ''
      }));
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const enrichedEmployees = employees.map(emp => {
    const empId = emp.employee_id || emp.id;
    const prof = profiles.find(p => p.employee_id === empId || p.id === emp.profile_id) || {};
    const dept = departments.find(d => (d.department_id || d.id) === emp.department_id) || { department_name: 'Unassigned', name: 'Unassigned' };
    const des = designations.find(d => (d.designation_id || d.id) === emp.designation_id) || { designation_name: 'Staff', title: 'Staff' };
    const managerEmp = employees.find(e => (e.employee_id || e.id) === (emp.manager_id || emp.reports_to));
    const managerName = managerEmp ? `${managerEmp.first_name || ''} ${managerEmp.last_name || ''}`.trim() : 'Executive Board';

    const fullName = prof.full_name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || 'Employee';

    return {
      ...emp,
      employee_id: empId,
      full_name: fullName,
      profile: prof,
      department: dept,
      designation: des,
      managerName,
      deptName: dept.department_name || dept.name,
      desigTitle: des.designation_name || des.title,
    };
  });

  const filteredEmployees = enrichedEmployees.filter(emp => {
    const nameMatch = (emp.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (emp.employee_id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (emp.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    const deptMatch = selectedDept === 'all' || emp.department_id === selectedDept;
    return nameMatch && deptMatch;
  });

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    const newEmpId = `EMP-${Math.floor(1000 + Math.random() * 9000)}`;
    const newProfileId = crypto.randomUUID ? crypto.randomUUID() : `usr-${Date.now()}`;
    const firstName = sanitizeInput(newEmpForm.first_name);
    const lastName = sanitizeInput(newEmpForm.last_name);
    const fullName = `${firstName} ${lastName}`.trim();
    const cleanEmail = sanitizeInput(newEmpForm.email).toLowerCase();

    // 1. Insert into employee_records table
    const newRecord = {
      employee_id: newEmpId,
      first_name: firstName,
      last_name: lastName,
      email: cleanEmail,
      department_id: newEmpForm.department_id,
      designation_id: newEmpForm.designation_id,
      manager_id: newEmpForm.manager_id || null,
      joining_date: new Date().toISOString().split('T')[0],
      employment_type: newEmpForm.employment_type,
      phone: sanitizeInput(newEmpForm.phone),
      emergency_contact: sanitizeInput(newEmpForm.emergency_contact),
      address: 'Corporate HQ',
      gender: 'Unspecified',
      date_of_birth: '1995-01-01',
    };
    await insertTableRow('employee_records', newRecord);

    // 2. Insert into profiles table
    const newProfile = {
      id: newProfileId,
      employee_id: newEmpId,
      email: cleanEmail,
      full_name: fullName,
      role: newEmpForm.role,
    };
    await insertTableRow('profiles', newProfile);

    setIsAddModalOpen(false);
    await loadData();
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Employee Directory
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Active staff members fetched from database
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
                placeholder="Search by name, ID or email..."
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
                All Departments
              </button>
              {departments.map((dept) => {
                const deptId = dept.department_id || dept.id;
                const deptName = dept.department_name || dept.name;
                return (
                  <button
                    key={deptId}
                    onClick={() => setSelectedDept(deptId)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition whitespace-nowrap ${
                      selectedDept === deptId
                        ? 'bg-teal-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {deptName}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Employee Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEmployees.map((emp) => (
              <div
                key={emp.employee_id}
                className="rounded-xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-sm">
                        {(emp.first_name?.[0] || emp.full_name?.[0] || 'E').toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                          {emp.full_name}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {emp.desigTitle}
                        </p>
                      </div>
                    </div>
                    <Badge variant="neutral" size="xs">
                      {emp.employee_id}
                    </Badge>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center">
                      <Building2 className="w-3.5 h-3.5 mr-2 text-slate-400" />
                      <span>{emp.deptName}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="w-3.5 h-3.5 mr-2 text-slate-400" />
                      <span className="truncate">{emp.email}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Joined {emp.joining_date || '2026-01-01'}
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
            {enrichedEmployees.filter(e => !e.manager_id && !e.reports_to).map(director => (
              <div key={director.employee_id} className="flex flex-col items-center">
                <div className="p-3.5 rounded-xl bg-teal-600 text-white text-center w-52 shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center font-bold text-sm mx-auto mb-1.5">
                    {(director.first_name?.[0] || 'D').toUpperCase()}
                  </div>
                  <h4 className="font-semibold text-xs">{director.full_name}</h4>
                  <p className="text-[11px] text-teal-100">{director.desigTitle}</p>
                </div>

                <div className="w-px h-6 bg-slate-300 dark:bg-slate-700" />
                <div className="w-3/4 max-w-xl h-px bg-slate-300 dark:bg-slate-700" />

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3">
                  {enrichedEmployees.filter(e => (e.manager_id || e.reports_to) === director.employee_id).map(report => (
                    <div key={report.employee_id} className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-center w-40">
                      <div className="w-8 h-8 rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-xs mx-auto mb-1">
                        {(report.first_name?.[0] || 'E').toUpperCase()}
                      </div>
                      <h5 className="font-medium text-xs text-slate-900 dark:text-white truncate">{report.full_name}</h5>
                      <p className="text-[10px] text-slate-400 truncate">{report.desigTitle}</p>
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
              <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-base">
                {(selectedEmp.first_name?.[0] || selectedEmp.full_name?.[0] || 'E').toUpperCase()}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{selectedEmp.full_name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{selectedEmp.desigTitle}</p>
                <span className="text-[10px] font-mono text-teal-600 dark:text-teal-400">{selectedEmp.employee_id}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                <span className="text-slate-400">Email</span>
                <p className="font-medium text-slate-800 dark:text-slate-200 truncate mt-0.5">{selectedEmp.email}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                <span className="text-slate-400">Phone</span>
                <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">{selectedEmp.phone || 'N/A'}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                <span className="text-slate-400">Department</span>
                <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">{selectedEmp.deptName}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                <span className="text-slate-400">Joining Date</span>
                <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">{selectedEmp.joining_date || '2026-01-01'}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                <span className="text-slate-400">Manager</span>
                <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">{selectedEmp.managerName}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                <span className="text-slate-400">Employment Type</span>
                <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">{selectedEmp.employment_type || 'Full-Time'}</p>
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
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">First Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul"
                value={newEmpForm.first_name}
                onChange={(e) => setNewEmpForm({ ...newEmpForm, first_name: e.target.value })}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Last Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Sharma"
                value={newEmpForm.last_name}
                onChange={(e) => setNewEmpForm({ ...newEmpForm, last_name: e.target.value })}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Corporate Email</label>
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
                  <option key={d.department_id || d.id} value={d.department_id || d.id}>
                    {d.department_name || d.name}
                  </option>
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
                  <option key={des.designation_id || des.id} value={des.designation_id || des.id}>
                    {des.designation_name || des.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Role / Access Level</label>
              <select
                value={newEmpForm.role}
                onChange={(e) => setNewEmpForm({ ...newEmpForm, role: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                <option value="employee">Employee (Self-Service)</option>
                <option value="manager">Manager</option>
                <option value="hr">HR</option>
                <option value="recruiter">Recruiter</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Reporting Manager</label>
              <select
                value={newEmpForm.manager_id}
                onChange={(e) => setNewEmpForm({ ...newEmpForm, manager_id: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                <option value="">Executive Board</option>
                {enrichedEmployees.map((e) => (
                  <option key={e.employee_id} value={e.employee_id}>{e.full_name}</option>
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
