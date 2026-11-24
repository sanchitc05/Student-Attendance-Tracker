import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link to="/" className="font-bold text-slate-900">
            Attendance Tracker
          </Link>

          {user?.role === 'admin' && (
            <nav className="hidden items-center gap-1 sm:flex">
              <Link
                to="/admin"
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                  isActive('/admin')
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/admin/students"
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                  isActive('/admin/students')
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Students
              </Link>
              <Link
                to="/admin/teachers"
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                  isActive('/admin/teachers')
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Teachers
              </Link>
              <Link
                to="/admin/subjects"
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                  isActive('/admin/subjects')
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Subjects
              </Link>
            </nav>
          )}

          {user?.role === 'teacher' && (
            <nav className="hidden items-center gap-1 sm:flex">
              <Link
                to="/teacher"
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                  isActive('/teacher')
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                My Subjects
              </Link>
              <Link
                to="/teacher/attendance"
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                  isActive('/teacher/attendance')
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Mark Attendance
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900">{user.name}</p>
              <span className="inline-block rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium uppercase text-slate-600">
                {user.role}
              </span>
            </div>
          )}
          <button
            type="button"
            onClick={logout}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
