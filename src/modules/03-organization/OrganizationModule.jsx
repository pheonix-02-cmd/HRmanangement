import React, { useState, useEffect } from 'react';
import { Building2, Plus, Users } from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { fetchTableData, insertTableRow } from '../../services/dataStorage';
import { sanitizeInput } from '../../utils/security';

export const OrganizationModule = () => {
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [selectedDeptId, setSelectedDeptId] = useState(null);

  const [isAddDeptModalOpen, setIsAddDeptModalOpen] = useState(false);
  const [isAddDesModalOpen, setIsAddDesModalOpen] = useState(false);

  const [deptForm, setDeptForm] = useState({ name: '', code: '', budget: '', description: '' });
  const [desForm, setDesForm] = useState({ title: '', department_id: '', level: 'L3', min_salary: '', max_salary: '' });

  const loadData = async () => {
    const [dRes, desRes, eRes, pRes] = await Promise.all([
      fetchTableData('departments'),
      fetchTableData('designations'),
      fetchTableData('employee_records'),
      fetchTableData('profiles'),
    ]);
    const depts = dRes.data || [];
    setDepartments(depts);
    setDesignations(desRes.data || []);
    setEmployees(eRes.data || []);
    setProfiles(pRes.data || []);
    if (depts.length > 0 && !selectedDeptId) {
      setSelectedDeptId(depts[0].id);
      setDesForm(prev => ({ ...prev, department_id: depts[0].id }));
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateDept = async (e) => {
    e.preventDefault();
    const newDept = {
      id: `dept-${Date.now().toString().slice(-4)}`,
      name: sanitizeInput(deptForm.name),
      code: sanitizeInput(deptForm.code).toUpperCase(),
      budget: parseFloat(deptForm.budget) || 0,
      description: sanitizeInput(deptForm.description),
      head_id: null,
      created_at: new Date().toISOString()
    };
    await insertTableRow('departments', newDept);
    setIsAddDeptModalOpen(false);
    setDeptForm({ name: '', code: '', budget: '', description: '' });
    await loadData();
  };

  const handleCreateDes = async (e) => {
    e.preventDefault();
    const newDes = {
      id: `des-${Date.now().toString().slice(-4)}`,
      title: sanitizeInput(desForm.title),
      department_id: desForm.department_id || selectedDeptId,
      level: desForm.level,
      min_salary: parseFloat(desForm.min_salary) || 0,
      max_salary: parseFloat(desForm.max_salary) || 0,
      created_at: new Date().toISOString()
    };
    await insertTableRow('designations', newDes);
    setIsAddDesModalOpen(false);
    setDesForm({ title: '', department_id: selectedDeptId, level: 'L3', min_salary: '', max_salary: '' });
    await loadData();
  };

  const selectedDepartment = departments.find(d => d.id === selectedDeptId) || departments[0];
  const deptDesignations = designations.filter(d => d.department_id === selectedDepartment?.id);
  const deptEmployees = employees.filter(e => e.department_id === selectedDepartment?.id);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Departments & Designations
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Organizational hierarchy and role definitions
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsAddDesModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            Add Role
          </button>
          <button
            onClick={() => setIsAddDeptModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 flex items-center space-x-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Department</span>
          </button>
        </div>
      </div>

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {departments.map((dept) => {
          const empCount = employees.filter(e => e.department_id === dept.id).length;
          const isSelected = dept.id === selectedDepartment?.id;

          return (
            <div
              key={dept.id}
              onClick={() => setSelectedDeptId(dept.id)}
              className={`cursor-pointer rounded-xl p-3.5 transition border ${
                isSelected
                  ? 'bg-teal-50/50 dark:bg-teal-950/30 border-teal-500 ring-1 ring-teal-500/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {dept.code}
                </span>
                <span className="text-xs text-slate-400 flex items-center">
                  <Users className="w-3.5 h-3.5 mr-1" /> {empCount}
                </span>
              </div>

              <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {dept.name}
              </h4>
            </div>
          );
        })}
      </div>

      {/* Selected Department Drilldown */}
      {selectedDepartment && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="rounded-xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {selectedDepartment.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {selectedDepartment.description}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Budget</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  ₹{Number(selectedDepartment.budget).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Staff Count</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {deptEmployees.length} Members
                </span>
              </div>
            </div>

            <div className="pt-2">
              <h4 className="text-xs font-semibold text-slate-400 uppercase mb-2">Team Members</h4>
              <div className="space-y-1.5">
                {deptEmployees.map((e) => {
                  const prof = profiles.find(p => p.id === e.profile_id);
                  const des = designations.find(d => d.id === e.designation_id);
                  return (
                    <div key={e.id} className="flex items-center space-x-2 py-1 text-xs">
                      <img src={prof?.avatar_url} alt="" className="w-6 h-6 rounded-full object-cover" />
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{prof?.full_name}</span>
                      <span className="text-slate-400 text-[10px] ml-auto">{des?.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 rounded-xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Designations & Levels</h3>
              <button
                onClick={() => setIsAddDesModalOpen(true)}
                className="text-xs font-medium text-teal-600 dark:text-teal-400 hover:underline"
              >
                + Add Role
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {deptDesignations.map((des) => (
                <div
                  key={des.id}
                  className="py-3 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="w-7 h-7 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center justify-center font-mono">
                      {des.level}
                    </span>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">{des.title}</h4>
                      <span className="text-[10px] text-slate-400">Level {des.level}</span>
                    </div>
                  </div>

                  <div className="font-mono text-slate-600 dark:text-slate-300 text-right">
                    <span>₹{(des.min_salary / 100000).toFixed(1)}L - ₹{(des.max_salary / 100000).toFixed(1)}L</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Add Department Modal */}
      <Modal isOpen={isAddDeptModalOpen} onClose={() => setIsAddDeptModalOpen(false)} title="New Department">
        <form onSubmit={handleCreateDept} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Department Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Quality Assurance"
              value={deptForm.name}
              onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Code</label>
              <input
                type="text"
                required
                placeholder="QA"
                value={deptForm.code}
                onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Annual Budget (₹)</label>
              <input
                type="number"
                placeholder="5000000"
                value={deptForm.budget}
                onChange={(e) => setDeptForm({ ...deptForm, budget: e.target.value })}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddDeptModalOpen(false)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700"
            >
              Save Department
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Designation Modal */}
      <Modal isOpen={isAddDesModalOpen} onClose={() => setIsAddDesModalOpen(false)} title="New Designation">
        <form onSubmit={handleCreateDes} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Lead QA Engineer"
              value={desForm.title}
              onChange={(e) => setDesForm({ ...desForm, title: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Level</label>
              <select
                value={desForm.level}
                onChange={(e) => setDesForm({ ...desForm, level: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                <option value="L1">L1 — Junior</option>
                <option value="L2">L2 — Associate</option>
                <option value="L3">L3 — Professional</option>
                <option value="L4">L4 — Senior</option>
                <option value="L5">L5 — Lead</option>
                <option value="L6">L6 — Principal</option>
                <option value="L7">L7 — Director</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Department</label>
              <select
                value={desForm.department_id || selectedDeptId}
                onChange={(e) => setDesForm({ ...desForm, department_id: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddDesModalOpen(false)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700"
            >
              Save Role
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
