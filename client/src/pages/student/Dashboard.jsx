import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import AttendanceCard from '../../components/AttendanceCard';
import SubjectAttendanceDetailModal from '../../components/SubjectAttendanceDetailModal';

function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/attendance/student/me');
      setData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch attendance data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const overall = data?.overall || {
    totalClasses: 0,
    classesAttended: 0,
    percentage: 0,
    isBelowThreshold: false,
  };
  const subjects = data?.subjects || [];

  // Low attendance warning count
  const defaulterSubjects = subjects.filter((s) => s.isBelowThreshold);

  // Prepare chart data
  const chartData = subjects.map((s) => ({
    name: s.code,
    fullName: s.name,
    percentage: s.totalClasses > 0 ? s.percentage : 0,
    totalClasses: s.totalClasses,
    attended: s.classesAttended,
  }));

  const getBarColor = (percentage, totalClasses) => {
    if (totalClasses === 0) return '#94a3b8'; // slate-400
    if (percentage >= 75) return '#10b981'; // emerald-500
    if (percentage >= 70) return '#f59e0b'; // amber-500
    return '#ef4444'; // rose-500
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Loading State */}
        {loading && (
          <div className="flex min-h-[60vh] flex-col items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-indigo-600" />
            <p className="mt-4 text-sm font-medium text-slate-600">
              Loading your attendance records...
            </p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center">
            <p className="text-base font-semibold text-rose-800">{error}</p>
            <p className="mt-1 text-sm text-rose-600">
              Please check your network connection and try again.
            </p>
            <button
              type="button"
              onClick={fetchAttendance}
              className="mt-4 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-rose-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Dashboard Content */}
        {!loading && !error && (
          <div className="space-y-8">
            {/* Header with Title and Overall Alert */}
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Student Attendance Dashboard
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Track your subject-wise attendance and ensure you stay above the 75% requirement.
              </p>
            </div>

            {/* Defaulter Alert Banner if below 75% in any subject */}
            {defaulterSubjects.length > 0 && (
              <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-900 shadow-xs">
                <span className="text-xl">⚠️</span>
                <div>
                  <h4 className="text-sm font-bold">Attendance Warning (&lt; 75%)</h4>
                  <p className="mt-0.5 text-xs text-rose-700">
                    You have {defaulterSubjects.length} subject
                    {defaulterSubjects.length > 1 ? 's' : ''} with attendance below 75% (
                    {defaulterSubjects.map((s) => s.code).join(', ')}). Immediate attendance is
                    required to avoid examination detention.
                  </p>
                </div>
              </div>
            )}

            {/* Overall Attendance Summary Card */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {/* Overall Percentage Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Overall Attendance
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      overall.totalClasses === 0
                        ? 'bg-slate-100 text-slate-600'
                        : overall.percentage >= 75
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {overall.totalClasses === 0
                      ? 'No Data'
                      : overall.percentage >= 75
                      ? 'Eligible'
                      : 'At Risk'}
                  </span>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-slate-900">
                    {overall.totalClasses > 0 ? `${overall.percentage}%` : '0%'}
                  </span>
                  <span className="text-xs text-slate-500">across all subjects</span>
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${
                      overall.totalClasses === 0
                        ? 'bg-slate-300'
                        : overall.percentage >= 75
                        ? 'bg-emerald-500'
                        : overall.percentage >= 70
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(overall.percentage, 100)}%` }}
                  />
                </div>
              </div>

              {/* Total Classes Attended */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Classes Attended
                </span>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-slate-900">
                    {overall.classesAttended}
                  </span>
                  <span className="text-base font-semibold text-slate-400">
                    / {overall.totalClasses}
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Total lecture sessions conducted and attended to date.
                </p>
              </div>

              {/* Enrolled Subjects & Health */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Subjects Overview
                </span>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-slate-900">
                    {subjects.length}
                  </span>
                  <span className="text-xs text-slate-500">enrolled subjects</span>
                </div>
                <p className="mt-2 text-xs text-slate-600">
                  {defaulterSubjects.length === 0 ? (
                    <span className="text-emerald-700 font-medium">
                      ✓ All enrolled subjects are at or above 75%.
                    </span>
                  ) : (
                    <span className="text-rose-700 font-medium">
                      ⚠️ {defaulterSubjects.length} subject(s) currently below the 75% limit.
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Empty State: Not enrolled in any subjects */}
            {subjects.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                <span className="text-4xl">📚</span>
                <h3 className="mt-3 text-lg font-semibold text-slate-900">
                  No Enrolled Subjects
                </h3>
                <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
                  You are not currently enrolled in any subjects. Please contact your college
                  administrator to have subjects assigned to your student profile.
                </p>
              </div>
            ) : (
              <>
                {/* Recharts Bar Chart: Subject Attendance vs 75% Reference Line */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                  <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        Attendance Comparison
                      </h2>
                      <p className="text-xs text-slate-500">
                        Subject attendance percentage compared against the required 75% threshold.
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-medium">
                      <span className="flex items-center gap-1.5 text-slate-600">
                        <span className="h-3 w-3 rounded-xs bg-emerald-500" /> &ge; 75% (Safe)
                      </span>
                      <span className="flex items-center gap-1.5 text-slate-600">
                        <span className="h-3 w-3 rounded-xs bg-amber-500" /> 70-74% (Warning)
                      </span>
                      <span className="flex items-center gap-1.5 text-slate-600">
                        <span className="h-3 w-3 rounded-xs bg-rose-500" /> &lt; 70% (Critical)
                      </span>
                    </div>
                  </div>

                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                          dataKey="name"
                          tick={{ fill: '#64748b', fontSize: 12 }}
                          tickLine={false}
                        />
                        <YAxis
                          domain={[0, 100]}
                          tick={{ fill: '#64748b', fontSize: 12 }}
                          unit="%"
                          tickLine={false}
                        />
                        <Tooltip
                          formatter={(value, name, item) => [
                            `${value}% (${item.payload.attended}/${item.payload.totalClasses} classes)`,
                            item.payload.fullName,
                          ]}
                          contentStyle={{
                            backgroundColor: '#ffffff',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            fontSize: '12px',
                          }}
                        />
                        <ReferenceLine
                          y={75}
                          stroke="#ef4444"
                          strokeDasharray="4 4"
                          strokeWidth={2}
                          label={{
                            value: '75% Required',
                            position: 'insideTopRight',
                            fill: '#ef4444',
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        />
                        <Bar dataKey="percentage" radius={[6, 6, 0, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={getBarColor(entry.percentage, entry.totalClasses)}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Per-Subject Attendance Cards */}
                <div>
                  <h2 className="mb-4 text-lg font-bold text-slate-900">
                    Subject Attendance Details
                  </h2>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {subjects.map((subject) => (
                      <AttendanceCard
                        key={subject._id}
                        subject={subject}
                        onViewHistory={(subj) => setSelectedSubject(subj)}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* Date-wise Attendance History Modal */}
      <SubjectAttendanceDetailModal
        isOpen={Boolean(selectedSubject)}
        onClose={() => setSelectedSubject(null)}
        subject={selectedSubject}
      />
    </div>
  );
}

export default StudentDashboard;
