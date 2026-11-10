import React, { useState, useEffect } from 'react';
import { Clock, Play, Square, Calendar, CheckCircle2 } from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';
import { fetchTableData, insertTableRow, updateTableRow } from '../../services/dataStorage';

export const AttendanceModule = () => {
  const { user } = useAuth();
  const [attendanceList, setAttendanceList] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  const todayStr = new Date().toISOString().split('T')[0];

  const loadAttendance = async () => {
    const [attRes, empRes, profRes] = await Promise.all([
      fetchTableData('attendance'),
      fetchTableData('employee_records'),
      fetchTableData('profiles'),
    ]);
    setAttendanceList(attRes.data || []);
    setEmployees(empRes.data || []);
    setProfiles(profRes.data || []);
  };

  useEffect(() => {
    loadAttendance();
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const currentEmpId = user?.employee_id || user?.id;
  const userTodayRecord = attendanceList.find(a => a.employee_id === currentEmpId);

  const punchInTime = userTodayRecord?.check_in || userTodayRecord?.punch_in;
  const punchOutTime = userTodayRecord?.check_out || userTodayRecord?.punch_out;
  const isClockedIn = Boolean(userTodayRecord && punchInTime && !punchOutTime);

  const handleClockIn = async () => {
    const timeStr = currentTime.toTimeString().split(' ')[0].slice(0, 5);
    const newId = `att-${Date.now().toString().slice(-4)}`;
    const newRecord = {
      attendance_id: newId,
      employee_id: currentEmpId,
      check_in: timeStr,
      punch_in: timeStr,
      check_out: null,
      punch_out: null,
      status: currentTime.getHours() >= 9 && currentTime.getMinutes() > 15 ? 'late' : 'present',
      created_at: new Date().toISOString()
    };
    await insertTableRow('attendance', newRecord);
    await loadAttendance();
  };

  const handleClockOut = async () => {
    if (!userTodayRecord) return;
    const timeStr = currentTime.toTimeString().split(' ')[0].slice(0, 5);
    const attId = userTodayRecord.attendance_id || userTodayRecord.id;

    await updateTableRow('attendance', attId, {
      check_out: timeStr,
      punch_out: timeStr,
      status: 'present'
    });
    await loadAttendance();
  };

  // Data Scoping: Employees ONLY see their own attendance records
  const isEmployee = user?.role === 'employee';
  const scopedAttendance = isEmployee
    ? attendanceList.filter(att => att.employee_id === currentEmpId)
    : attendanceList;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {isEmployee ? 'My Attendance Record' : 'Attendance Records'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isEmployee ? 'Personal shift clock-in and daily work logs' : 'Organization-wide clock-in logs and daily shifts'}
          </p>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      {/* Clock In / Out Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Live Punch Card */}
        <div className="rounded-xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
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
                  {punchInTime || '--:--'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Punch Out:</span>
                <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                  {punchOutTime || (isClockedIn ? 'In Progress' : '--:--')}
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
                <span>Clock In</span>
              </button>
            ) : isClockedIn ? (
              <button
                onClick={handleClockOut}
                className="w-full py-2.5 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition flex items-center justify-center space-x-1.5"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Clock Out</span>
              </button>
            ) : (
              <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-center text-xs text-teal-700 dark:text-teal-400 font-medium">
                Shift completed for today
              </div>
            )}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="lg:col-span-2 rounded-xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
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
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
          {isEmployee ? 'My Attendance History' : 'Enterprise Attendance Register'}
        </h3>

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
              {scopedAttendance.map((att) => {
                const attId = att.attendance_id || att.id;
                const emp = employees.find(e => (e.employee_id || e.id) === att.employee_id);
                const empName = emp ? `${emp.first_name || ''} ${emp.last_name || ''}`.trim() : att.employee_id;

                return (
                  <tr key={attId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-sans text-slate-700 dark:text-slate-300">
                      {att.created_at ? att.created_at.split('T')[0] : todayStr}
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <span className="font-medium text-slate-900 dark:text-white">{empName}</span>
                      <span className="text-[10px] text-slate-400 font-mono ml-1.5">({att.employee_id})</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                      {att.check_in || att.punch_in || '--:--'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                      {att.check_out || att.punch_out || '--:--'}
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <Badge
                        variant={
                          att.status === 'present' ? 'success' :
                          att.status === 'late' ? 'warning' : 'neutral'
                        }
                        size="xs"
                      >
                        {att.status || 'present'}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
