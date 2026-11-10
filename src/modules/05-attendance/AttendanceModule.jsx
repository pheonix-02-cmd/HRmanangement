import React, { useState, useEffect } from 'react';
import { Clock, Play, Square, Calendar, CheckCircle2 } from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';
import { fetchTableData, insertTableRow, updateTableRow } from '../../services/dataStorage';

export const AttendanceModule = () => {
  const { user, canAccessEmployee } = useAuth();
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

  const userEmpRecord = employees.find(e => e.profile_id === user?.id || e.id === user?.emp_id) || employees[0];
  const userTodayRecord = attendanceList.find(a => a.employee_id === userEmpRecord?.id && a.date === todayStr);

  const isClockedIn = Boolean(userTodayRecord && userTodayRecord.punch_in && !userTodayRecord.punch_out);

  const handleClockIn = async () => {
    const timeStr = currentTime.toTimeString().split(' ')[0];
    const newRecord = {
      id: `att-${Date.now().toString().slice(-4)}`,
      employee_id: userEmpRecord?.id || 'emp-1',
      date: todayStr,
      punch_in: timeStr,
      punch_out: null,
      work_hours: 0,
      status: currentTime.getHours() >= 9 && currentTime.getMinutes() > 15 ? 'late' : 'present',
      overtime_hours: 0
    };
    await insertTableRow('attendance', newRecord);
    await loadAttendance();
  };

  const handleClockOut = async () => {
    if (!userTodayRecord) return;
    const timeStr = currentTime.toTimeString().split(' ')[0];
    const [inH, inM] = (userTodayRecord.punch_in || '09:00:00').split(':').map(Number);
    const [outH, outM] = timeStr.split(':').map(Number);
    const duration = Math.max(0, parseFloat(((outH + outM / 60) - (inH + inM / 60)).toFixed(1)));
    const overtime = duration > 9.0 ? parseFloat((duration - 9.0).toFixed(1)) : 0;

    await updateTableRow('attendance', userTodayRecord.id, {
      punch_out: timeStr,
      work_hours: duration,
      overtime_hours: overtime
    });
    await loadAttendance();
  };

  // Data Scoping: Employees only see their own attendance; managers see their team; admins see all
  const scopedAttendance = attendanceList.filter(att => {
    const emp = employees.find(e => e.id === att.employee_id);
    return canAccessEmployee(att.employee_id, emp?.reports_to);
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Attendance
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Daily clock-in logs and work hours
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
              <p className="text-[11px] text-slate-400 mt-1">Current Time</p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Punch In:</span>
                <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                  {userTodayRecord?.punch_in || '--:--'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Punch Out:</span>
                <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                  {userTodayRecord?.punch_out || (isClockedIn ? 'In Progress' : '--:--')}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-1.5 font-medium">
                <span className="text-slate-400">Hours Today:</span>
                <span className="font-mono text-teal-600 dark:text-teal-400">
                  {userTodayRecord?.work_hours ? `${userTodayRecord.work_hours} hrs` : '--'}
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
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Summary</h3>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                <span className="text-[11px] text-slate-400">Days Logged</span>
                <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{scopedAttendance.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                <span className="text-[11px] text-slate-400">Average Shift</span>
                <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">9.1 hrs</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                <span className="text-[11px] text-slate-400">Overtime</span>
                <p className="text-xl font-bold text-teal-600 dark:text-teal-400 mt-1">4.2 hrs</p>
              </div>
            </div>
          </div>

          <div className="pt-4 text-xs text-slate-500 dark:text-slate-400">
            Standard shift: 9:00 AM – 6:00 PM. Grace period: 15 minutes.
          </div>
        </div>

      </div>

      {/* Scoped Attendance Register */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
          {user?.role === 'employee' ? 'My Attendance Record' : 'Attendance Register'}
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-[11px]">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Employee</th>
                <th className="py-2.5 px-3">In</th>
                <th className="py-2.5 px-3">Out</th>
                <th className="py-2.5 px-3">Hours</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {scopedAttendance.map((att) => {
                const emp = employees.find(e => e.id === att.employee_id);
                const prof = profiles.find(p => p.id === emp?.profile_id);

                return (
                  <tr key={att.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-sans text-slate-700 dark:text-slate-300">
                      {att.date}
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <span className="font-medium text-slate-900 dark:text-white">{prof?.full_name}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                      {att.punch_in || '--:--'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                      {att.punch_out || '--:--'}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200">
                      {att.work_hours ? `${att.work_hours}h` : '--'}
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <Badge
                        variant={
                          att.status === 'present' ? 'success' :
                          att.status === 'late' ? 'warning' : 'neutral'
                        }
                        size="xs"
                      >
                        {att.status}
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
