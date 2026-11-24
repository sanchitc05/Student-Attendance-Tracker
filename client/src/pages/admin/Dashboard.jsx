import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';

function Dashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalSubjects: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, subjectsRes] = await Promise.all([
          api.get('/users/stats'),
          api.get('/subjects'),
        ]);

        setStats({
          totalStudents: usersRes.data.data.totalStudents,
          totalTeachers: usersRes.data.data.totalTeachers,
          totalSubjects: subjectsRes.data.data.length,
        });
      } catch (error) {
        toast.error('Failed to load dashboard metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Overview</h1>
          <p className="mt-1 text-sm text-slate-500">
            Monitor and manage students, teachers, subjects, and course enrollments.
          </p>
        </div>

        {loading ? (
          <div className="mt-8 text-center text-sm text-slate-500">
            Loading dashboard data...
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase text-slate-500">
                Total Students
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {stats.totalStudents}
              </p>
              <Link
                to="/admin/students"
                className="mt-4 inline-block text-xs font-medium text-slate-900 hover:underline"
              >
                Manage students &rarr;
              </Link>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase text-slate-500">
                Total Teachers
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {stats.totalTeachers}
              </p>
              <Link
                to="/admin/teachers"
                className="mt-4 inline-block text-xs font-medium text-slate-900 hover:underline"
              >
                Manage teachers &rarr;
              </Link>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase text-slate-500">
                Total Subjects
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {stats.totalSubjects}
              </p>
              <Link
                to="/admin/subjects"
                className="mt-4 inline-block text-xs font-medium text-slate-900 hover:underline"
              >
                Manage subjects &rarr;
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
