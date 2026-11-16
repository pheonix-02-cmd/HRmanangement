import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Play, 
  Square, 
  Calendar, 
  CheckCircle2, 
  RefreshCw, 
  Search, 
  Users, 
  AlertCircle,
  Plus,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';
import { fetchTableData, insertTableRow, updateTableRow } from '../../services/dataStorage';

export const AttendanceModule = () => {
  const { user } = useAuth();
  const [attendanceList, setAttendanceList] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showManualModal, setShowManualModal] = useState(false);
  const [submittingManual, setSubmittingManual] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const currentEmpId = String(user?.employee_id || user?.id || '').trim().toUpperCase();
  const isEmployee = user?.role === 'employee';

  const [manualForm, setManualForm] = useState({
    employee_id: '',
    attendance_date: todayStr,
    check_in: '09:00',
    check_out: '18:00',
    status: 'Present'
  });

  const formatAttendanceDate = (att) => {
    const raw = att.attendance_date || att.date || (att.created_at ? att.created_at.split('T')[0] : null);
    return raw || todayStr;
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '--:--';
    if (typeof timeStr === 'string' && timeStr.includes('T')) {
      try {
        const d = new Date(timeStr);
        return isNaN(d.getTime()) 
          ? timeStr 
          : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      } catch (e) {
        return timeStr;
      }
    }
    return String(timeStr).slice(0, 5);
  };

  const loadAttendance = async () => {
    setLoading(true);
    try {
      const [attRes, empRes] = await Promise.all([
        fetchTableData('attendance'),
        fetchTableData('employee_records')
      ]);
      const atts = attRes.data || [];
      const emps = empRes.data || [];
      setAttendanceList(atts);
      setEmployees(emps);

      if (!manualForm.employee_id && emps.length > 0) {
        setManualForm(prev => ({
          ...prev,
          employee_id: emps[0].employee_id || emps[0].id || ''
        }));
      }
    } catch (err) {
      console.error('Failed to load attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Locate today's active records for the current user
  const userTodayRecords = attendanceList.filter(a => {
    const matchesEmp = String(a.employee_id || '').trim().toUpperCase() === currentEmpId;
    const aDate = a.attendance_date || a.date || (a.created_at ? a.created_at.split('T')[0] : '');
    return matchesEmp && aDate === todayStr;
  }).sort((a, b) => new Date(b.created_at || b.check_in || 0) - new Date(a.created_at || a.check_in || 0));

  const userTodayRecord = userTodayRecords[0] || null;

  const punchInTime = userTodayRecord?.check_in || userTodayRecord?.punch_in;
  const punchOutTime = userTodayRecord?.check_out || userTodayRecord?.punch_out;
  const isClockedIn = Boolean(userTodayRecord && punchInTime && !punchOutTime);
  const isShiftCompleted = Boolean(userTodayRecord && punchInTime && punchOutTime);

  const handleClockIn = async (forceNew = false) => {
    if (isClockedIn && !forceNew) return;
    const now = new Date();
    const isoNow = now.toISOString();
    const timeShort = now.toTimeString().split(' ')[0].slice(0, 5);
    const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 15);
    const status = isLate ? 'Late' : 'Present';

    const newRecord = {
      employee_id: currentEmpId,
      attendance_date: todayStr,
      check_in: isoNow,
      punch_in: timeShort,
      check_out: null,
      punch_out: null,
      status: status,
      created_at: isoNow
    };

    await insertTableRow('attendance', newRecord);
    await loadAttendance();
  };

  const handleClockOut = async () => {
    if (!userTodayRecord) return;
    const now = new Date();
    const isoNow = now.toISOString();
    const timeShort = now.toTimeString().split(' ')[0].slice(0, 5);
    const attId = userTodayRecord.attendance_id || userTodayRecord.id;

    await updateTableRow('attendance', attId, {
      check_out: isoNow,
      punch_out: timeShort,
      status: userTodayRecord.status || 'Present'
    });
    await loadAttendance();
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualForm.employee_id || !manualForm.attendance_date) return;
    setSubmittingManual(true);
    try {
      const checkInIso = manualForm.check_in 
        ? new Date(`${manualForm.attendance_date}T${manualForm.check_in}:00`).toISOString() 
        : null;
      const checkOutIso = manualForm.check_out 
        ? new Date(`${manualForm.attendance_date}T${manualForm.check_out}:00`).toISOString() 
        : null;

      const record = {
        employee_id: manualForm.employee_id,
        attendance_date: manualForm.attendance_date,
        check_in: checkInIso,
        check_out: checkOutIso,
        status: manualForm.status,
        created_at: new Date().toISOString()
      };

      await insertTableRow('attendance', record);
      await loadAttendance();
      setShowManualModal(false);
    } catch (err) {
      console.error('Failed to submit manual attendance:', err);
    } finally {
      setSubmittingManual(false);
    }
  };

  // Data Scoping: Employees ONLY see their own attendance records
  // Managers and Admins see organization-wide records
  const scopedAttendance = isEmployee
    ? attendanceList.filter(att => String(att.employee_id || '').trim().toUpperCase() === currentEmpId)
    : attendanceList;

  // Filter and sort attendance records (latest dates first)
  const displayAttendance = scopedAttendance
    .filter(att => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const emp = employees.find(e => String(e.employee_id || e.id).toUpperCase() === String(att.employee_id).toUpperCase());
      const empName = emp ? `${emp.first_name || ''} ${emp.last_name || ''}`.toLowerCase() : '';
      const empId = String(att.employee_id || '').toLowerCase();
      const dateStr = formatAttendanceDate(att).toLowerCase();
      const statusStr = String(att.status || '').toLowerCase();
      return empName.includes(q) || empId.includes(q) || dateStr.includes(q) || statusStr.includes(q);
    })
    .sort((a, b) => {
      const dateA = new Date(a.attendance_date || a.date || a.created_at || 0);
      const dateB = new Date(b.attendance_date || b.date || b.created_at || 0);
      return dateB - dateA;
    });

  const PAGE_SIZE = 15;
  const totalPages = Math.max(1, Math.ceil(displayAttendance.length / PAGE_SIZE));
  const paginatedAttendance = displayAttendance.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <span>{isEmployee ? 'My Attendance Record' : 'Attendance & Shift Operations'}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isEmployee 
              ? `Personal shift clock-in and daily work logs for ${user?.name || currentEmpId}` 
              : 'Organization-wide clock-in logs, biometric shift audits, and attendance records'}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={loadAttendance}
            disabled={loading}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
            title="Refresh from Supabase"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-teal-600' : ''}`} />
          </button>

          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            {currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Clock In / Out Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Live Punch Card */}
        <div className="rounded-xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-xs">
          <div>
            <div className="text-center py-4">
              <div className="text-3xl font-bold font-mono text-slate-900 dark:text-white">
                {currentTime.toLocaleTimeString()}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Current Wall Clock</p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Punch In:</span>
                <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                  {punchInTime ? formatTime(punchInTime) : '--:--'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Punch Out:</span>
                <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                  {punchOutTime ? formatTime(punchOutTime) : (isClockedIn ? 'In Progress' : '--:--')}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-1.5 font-medium">
                <span className="text-slate-400">Status:</span>
                <span className="font-mono text-teal-600 dark:text-teal-400 capitalize">
                  {userTodayRecord?.status || (isClockedIn ? 'Working' : 'Not Punched')}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4">
            {!userTodayRecord ? (
              <button
                onClick={() => handleClockIn(false)}
                className="w-full py-2.5 rounded-lg text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 transition flex items-center justify-center space-x-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Clock In for Today</span>
              </button>
            ) : isClockedIn ? (
              <button
                onClick={handleClockOut}
                className="w-full py-2.5 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition flex items-center justify-center space-x-1.5"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Clock Out for Today</span>
              </button>
            ) : (
              <div className="space-y-2">
                <div className="w-full py-2 rounded-lg text-xs font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-center border border-emerald-200 dark:border-emerald-800 flex items-center justify-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Shift completed for today</span>
                </div>
                <button
                  onClick={() => handleClockIn(true)}
                  className="w-full py-2 rounded-lg text-xs font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 border border-teal-200 dark:border-teal-800 transition flex items-center justify-center space-x-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Punch Another Shift / Clock In Again</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="lg:col-span-2 rounded-xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-xs">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Shift Parameters</h3>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                <span className="text-[11px] text-slate-400">Records Scoped</span>
                <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{scopedAttendance.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                <span className="text-[11px] text-slate-400">Standard Shift</span>
                <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">9.0 hrs</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                <span className="text-[11px] text-slate-400">Grace Period</span>
                <p className="text-xl font-bold text-teal-600 dark:text-teal-400 mt-1">15 mins</p>
              </div>
            </div>
          </div>

          <div className="pt-4 text-xs text-slate-500 dark:text-slate-400">
            Standard shift: 9:00 AM – 6:00 PM. Shifts automatically synchronize with Supabase `attendance` table.
          </div>
        </div>

      </div>

      {/* Attendance Register */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              {isEmployee ? 'My Attendance History' : 'Enterprise Attendance Register'}
            </h3>
            <span className="text-[11px] text-slate-400">
              ({displayAttendance.length} records)
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder={isEmployee ? "Filter by date or status..." : "Search name, ID, date, status..."}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-teal-500"
              />
            </div>

            {!isEmployee && (
              <button
                onClick={() => setShowManualModal(true)}
                className="py-1.5 px-3 rounded-lg text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 transition flex items-center space-x-1.5 shrink-0 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Mark Attendance</span>
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-[11px]">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Employee ID</th>
                <th className="py-2.5 px-3">Check In</th>
                <th className="py-2.5 px-3">Check Out</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {paginatedAttendance.map((att) => {
                const attId = att.attendance_id || att.id;
                const emp = employees.find(e => String(e.employee_id || e.id).toUpperCase() === String(att.employee_id).toUpperCase());
                const empName = emp ? `${emp.first_name || ''} ${emp.last_name || ''}`.trim() : att.employee_id;
                const dateDisplay = formatAttendanceDate(att);
                const checkInDisplay = formatTime(att.check_in || att.punch_in);
                const checkOutDisplay = formatTime(att.check_out || att.punch_out);
                const rawStatus = (att.status || 'Present').toLowerCase();

                return (
                  <tr key={attId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-3 font-sans text-slate-700 dark:text-slate-300 font-medium">
                      {dateDisplay}
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <span className="font-medium text-slate-900 dark:text-white">{empName}</span>
                      <span className="text-[10px] text-slate-400 font-mono ml-1.5">({att.employee_id})</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                      {checkInDisplay}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                      {checkOutDisplay}
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <Badge
                        variant={
                          rawStatus === 'present' ? 'success' :
                          rawStatus === 'late' ? 'warning' : 
                          rawStatus === 'half day' ? 'neutral' : 'danger'
                        }
                        size="xs"
                      >
                        {att.status || 'Present'}
                      </Badge>
                    </td>
                  </tr>
                );
              })}

              {displayAttendance.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-400 font-sans">
                    <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                    <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">Data Absent</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {isEmployee 
                        ? `No attendance records found for ${currentEmpId} in database.` 
                        : 'No attendance records match the search filter.'}
                    </p>
                  </td>
                </tr>
              )}

              {loading && displayAttendance.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400 font-sans">
                    <RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin text-teal-600" />
                    <p>Loading attendance records from Supabase...</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              Showing {Math.min((currentPage - 1) * PAGE_SIZE + 1, displayAttendance.length)} to {Math.min(currentPage * PAGE_SIZE, displayAttendance.length)} of {displayAttendance.length} records
            </span>
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition text-slate-600 dark:text-slate-300"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-mono text-slate-700 dark:text-slate-300 font-medium">
                {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition text-slate-600 dark:text-slate-300"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Management Manual Attendance Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Record Attendance</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Log or backdate employee punch in Supabase</p>
              </div>
              <button
                onClick={() => setShowManualModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                  Select Employee <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={manualForm.employee_id}
                  onChange={(e) => setManualForm(prev => ({ ...prev, employee_id: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-teal-500"
                >
                  <option value="">-- Choose Employee --</option>
                  {employees.map(emp => {
                    const id = emp.employee_id || emp.id;
                    const name = `${emp.first_name || ''} ${emp.last_name || ''}`.trim();
                    return (
                      <option key={id} value={id}>
                        {id} - {name} ({emp.department || 'Staff'})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                  Attendance Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={manualForm.attendance_date}
                  onChange={(e) => setManualForm(prev => ({ ...prev, attendance_date: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                    Check In Time
                  </label>
                  <input
                    type="time"
                    value={manualForm.check_in}
                    onChange={(e) => setManualForm(prev => ({ ...prev, check_in: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                    Check Out Time
                  </label>
                  <input
                    type="time"
                    value={manualForm.check_out}
                    onChange={(e) => setManualForm(prev => ({ ...prev, check_out: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                  Status
                </label>
                <select
                  value={manualForm.status}
                  onChange={(e) => setManualForm(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-teal-500"
                >
                  <option value="Present">Present</option>
                  <option value="Late">Late</option>
                  <option value="Half Day">Half Day</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingManual || !manualForm.employee_id}
                  className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold transition disabled:opacity-50 flex items-center space-x-1.5"
                >
                  {submittingManual ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Attendance</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
