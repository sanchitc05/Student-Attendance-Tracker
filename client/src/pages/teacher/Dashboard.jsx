import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';

function TeacherDashboard() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMySubjects = async () => {
      try {
        const res = await api.get('/subjects/my');
        setSubjects(res.data.data);
      } catch (error) {
        toast.error('Failed to load your subjects');
      } finally {
        setLoading(false);
      }
    };

    fetchMySubjects();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Teacher Dashboard</h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage attendance and view performance reports for your assigned classes.
            </p>
          </div>
          <Link
            to="/teacher/attendance"
            className="inline-block rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            + Mark New Attendance
          </Link>
        </div>

        {loading ? (
          <div className="mt-8 text-center text-sm text-slate-500">
            Loading assigned subjects...
          </div>
        ) : subjects.length === 0 ? (
          <div className="mt-8 rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h3 className="font-semibold text-slate-800">No Subjects Assigned</h3>
            <p className="mt-1 text-sm text-slate-500">
              You are currently not assigned to any subjects. Please contact the administrator.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.map((sub) => (
              <div
                key={sub._id}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                      {sub.code}
                    </span>
                    <span className="text-xs text-slate-500">
                      Semester {sub.semester}
                    </span>
                  </div>
                  <h2 className="mt-3 text-lg font-bold text-slate-900">
                    {sub.name}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {sub.students?.length || 0} students enrolled
                  </p>
                </div>

                <div className="mt-6 flex gap-2 border-t border-slate-100 pt-4">
                  <Link
                    to={`/teacher/attendance/${sub._id}`}
                    className="flex-1 rounded-md bg-slate-900 py-2 text-center text-xs font-medium text-white hover:bg-slate-700"
                  >
                    Mark Attendance
                  </Link>
                  <Link
                    to={`/teacher/report/${sub._id}`}
                    className="flex-1 rounded-md border border-slate-300 py-2 text-center text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Class Report
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default TeacherDashboard;
