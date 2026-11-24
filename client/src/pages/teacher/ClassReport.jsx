import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import Table from '../../components/Table';

function ClassReport() {
  const { subjectId } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/attendance/subject/${subjectId}`);
        setReport(res.data.data);
      } catch (error) {
        toast.error('Failed to load class report');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [subjectId]);

  const columns = [
    {
      header: 'Roll No',
      render: (row) => <span className="font-mono font-medium">{row.rollNo || '-'}</span>,
    },
    { header: 'Student Name', accessor: 'name' },
    {
      header: 'Attended Classes',
      render: (row) => (
        <span>
          {row.presentCount} / {row.totalClasses}
        </span>
      ),
    },
    {
      header: 'Percentage',
      render: (row) => {
        const isBelowThreshold = row.totalClasses > 0 && row.percentage < 75;

        return (
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                isBelowThreshold
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {row.percentage}%
            </span>
            {isBelowThreshold && (
              <span className="text-[11px] font-semibold text-rose-600">
                Warning (&lt; 75%)
              </span>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Link to="/teacher" className="text-xs text-slate-500 hover:underline">
                &larr; Back to My Subjects
              </Link>
            </div>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              {report?.subject?.name || 'Class Attendance Report'}
            </h1>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {report?.subject?.code} · Semester {report?.subject?.semester}
            </p>
          </div>

          <Link
            to={`/teacher/attendance/${subjectId}`}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Mark Attendance
          </Link>
        </div>

        {loading ? (
          <div className="mt-8 text-center text-sm text-slate-500">
            Generating class report...
          </div>
        ) : !report ? (
          <div className="mt-8 text-center text-sm text-slate-500">
            Could not find report for this subject.
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Total Classes Held
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {report.totalClasses}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Enrolled Students
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {report.students.length}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Students Below 75%
                </p>
                <p className="mt-1 text-2xl font-bold text-rose-600">
                  {report.students.filter((s) => s.isDefaulter).length}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-200 bg-slate-50 px-6 py-3.5">
                <h2 className="text-sm font-semibold text-slate-900">
                  Student-wise Attendance Summary
                </h2>
              </div>
              <Table
                columns={columns}
                data={report.students}
                emptyMessage="No students enrolled in this class."
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default ClassReport;
