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
  AlertCircle 
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

  const todayStr = new Date().toISOString().split('T')[0];
  const currentEmpId = String(user?.employee_id || user?.id || '').trim().toUpperCase();
  const isEmployee = user?.role === 'employee';

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
      setAttendanceList(attRes.data || []);
      setEmployees(empRes.data || []);
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

  // Locate today's active record for the current user
  const userTodayRecord = attendanceList.find(a => {
    const matchesEmp = String(a.employee_id || '').trim().toUpperCase() === currentEmpId;
    const aDate = a.attendance_date || a.date || (a.created_at ? a.created_at.split('T')[0] : '');
    return matchesEmp && aDate === todayStr;
  });

  const punchInTime = userTodayRecord?.check_in || userTodayRecord?.punch_in;
  const punchOutTime = userTodayRecord?.check_out || userTodayRecord?.punch_out;
  const isClockedIn = Boolean(userTodayRecord && punchInTime && !punchOutTime);
  const isShiftCompleted = Boolean(userTodayRecord && punchInTime && punchOutTime);

  const handleClockIn = async () => {
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
                onClick={handleClockIn}
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
              <div className="w-full py-2 rounded-lg text-xs font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-center border border-emerald-200 dark:border-emerald-800 flex items-center justify-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Shift completed for today</span>
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
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            {isEmployee ? 'My Attendance History' : 'Enterprise Attendance Register'}
          </h3>

          {!isEmployee && (
            <div className="relative sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, EMP ID, date, status..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-teal-500"
              />
            </div>
          )}
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
              {displayAttendance.map((att) => {
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
      </div>

    </div>
  );
};
