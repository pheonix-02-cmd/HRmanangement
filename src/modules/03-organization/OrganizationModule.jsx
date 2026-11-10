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

  const [deptForm, setDeptForm] = useState({ name: '', description: '' });
  const [desForm, setDesForm] = useState({ title: '', department_id: '', description: '' });

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
      const firstId = depts[0].department_id || depts[0].id;
      setSelectedDeptId(firstId);
      setDesForm(prev => ({ ...prev, department_id: firstId }));
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateDept = async (e) => {
    e.preventDefault();
    const newId = `dept-${Date.now().toString().slice(-4)}`;
    const newDept = {
      department_id: newId,
      department_name: sanitizeInput(deptForm.name),
      description: sanitizeInput(deptForm.description),
      created_at: new Date().toISOString()
    };
    await insertTableRow('departments', newDept);
    setIsAddDeptModalOpen(false);
    setDeptForm({ name: '', description: '' });
    await loadData();
  };

  const handleCreateDes = async (e) => {
    e.preventDefault();
    const newId = `des-${Date.now().toString().slice(-4)}`;
    const newDes = {
      designation_id: newId,
      designation_name: sanitizeInput(desForm.title),
      description: sanitizeInput(desForm.description),
      created_at: new Date().toISOString()
    };
    await insertTableRow('designations', newDes);
    setIsAddDesModalOpen(false);
    setDesForm({ title: '', department_id: selectedDeptId, description: '' });
    await loadData();
  };

  const selectedDepartment = departments.find(d => (d.department_id || d.id) === selectedDeptId) || departments[0];
  const curDeptId = selectedDepartment?.department_id || selectedDepartment?.id;
  const deptDesignations = designations;
  const deptEmployees = employees.filter(e => e.department_id === curDeptId);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Departments & Roles
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Enterprise business units and designations from database
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
          const deptId = dept.department_id || dept.id;
          const deptName = dept.department_name || dept.name;
          const empCount = employees.filter(e => e.department_id === deptId).length;
          const isSelected = deptId === curDeptId;

          return (
            <div
              key={deptId}
              onClick={() => setSelectedDeptId(deptId)}
              className={`cursor-pointer rounded-xl p-3.5 transition border ${
                isSelected
                  ? 'bg-teal-50/50 dark:bg-teal-950/30 border-teal-500 ring-1 ring-teal-500/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {deptId}
                </span>
                <span className="text-xs text-slate-400 flex items-center">
                  <Users className="w-3.5 h-3.5 mr-1" /> {empCount}
                </span>
              </div>

              <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {deptName}
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
                {selectedDepartment.department_name || selectedDepartment.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {selectedDepartment.description || 'Organizational business unit.'}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Department ID</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  {curDeptId}
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
              <h4 className="text-xs font-semibold text-slate-400 uppercase mb-2">Department Staff</h4>
              <div className="space-y-1.5">
                {deptEmployees.length > 0 ? deptEmployees.map((e) => {
                  const empId = e.employee_id || e.id;
                  const prof = profiles.find(p => p.employee_id === empId || p.id === e.profile_id);
                  const des = designations.find(d => (d.designation_id || d.id) === e.designation_id);
                  const name = prof?.full_name || `${e.first_name || ''} ${e.last_name || ''}`.trim() || 'Staff';
                  return (
                    <div key={empId} className="flex items-center space-x-2 py-1 text-xs">
                      <div className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-[10px]">
                        {(e.first_name?.[0] || name[0]).toUpperCase()}
                      </div>
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{name}</span>
                      <span className="text-slate-400 text-[10px] ml-auto">{des?.designation_name || des?.title || 'Employee'}</span>
                    </div>
                  );
                }) : (
                  <p className="text-xs text-slate-400">No staff assigned to this department.</p>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 rounded-xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Designations Registry</h3>
              <button
                onClick={() => setIsAddDesModalOpen(true)}
                className="text-xs font-medium text-teal-600 dark:text-teal-400 hover:underline"
              >
                + Add Role
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {designations.map((des) => {
                const desId = des.designation_id || des.id;
                const desName = des.designation_name || des.title;
                return (
                  <div
                    key={desId}
                    className="py-3 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">{desName}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{des.description || 'Enterprise role definition.'}</p>
                    </div>

                    <div className="font-mono text-slate-500 dark:text-slate-400 text-xs text-right">
                      <span>{desId}</span>
                    </div>
                  </div>
                );
              })}
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

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Description</label>
            <textarea
              rows={3}
              placeholder="Brief description of department function..."
              value={deptForm.description}
              onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
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
      <Modal isOpen={isAddDesModalOpen} onClose={() => setIsAddDesModalOpen(false)} title="New Designation / Role">
        <form onSubmit={handleCreateDes} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Designation Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Lead QA Engineer"
              value={desForm.title}
              onChange={(e) => setDesForm({ ...desForm, title: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Description</label>
            <textarea
              rows={3}
              placeholder="Role description, responsibilities..."
              value={desForm.description}
              onChange={(e) => setDesForm({ ...desForm, description: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
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
              Save Designation
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
