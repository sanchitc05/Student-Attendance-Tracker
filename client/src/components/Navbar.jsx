import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ChangePasswordModal from './ChangePasswordModal';

function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header className="border-b border-slate-200 bg-white sticky top-0 z-40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          {/* Logo & Desktop Nav Links */}
          <div className="flex items-center gap-6">
            <Link to="/" className="font-bold tracking-tight text-slate-900 text-base sm:text-lg">
              Attendance Tracker
            </Link>

            {/* Admin Links */}
            {user?.role === 'admin' && (
              <nav className="hidden items-center gap-1 md:flex">
                <Link
                  to="/admin"
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                    isActive('/admin')
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/admin/students"
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                    isActive('/admin/students')
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Students
                </Link>
                <Link
                  to="/admin/teachers"
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                    isActive('/admin/teachers')
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Teachers
                </Link>
                <Link
                  to="/admin/subjects"
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                    isActive('/admin/subjects')
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Subjects
                </Link>
              </nav>
            )}

            {/* Teacher Links */}
            {user?.role === 'teacher' && (
              <nav className="hidden items-center gap-1 md:flex">
                <Link
                  to="/teacher"
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                    isActive('/teacher')
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  My Subjects
                </Link>
                <Link
                  to="/teacher/attendance"
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                    isActive('/teacher/attendance')
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Mark Attendance
                </Link>
              </nav>
            )}

            {/* Student Links */}
            {user?.role === 'student' && (
              <nav className="hidden items-center gap-1 md:flex">
                <Link
                  to="/student"
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                    isActive('/student')
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  My Attendance
                </Link>
              </nav>
            )}
          </div>

          {/* User actions */}
          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                <span className="inline-block rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium uppercase text-slate-600">
                  {user.role}
                </span>
              </div>
            )}

            {user && (
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(true)}
                className="hidden sm:inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                title="Change Password"
              >
                Key / Password
              </button>
            )}

            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              Logout
            </button>

            {/* Hamburger Button for Mobile */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex md:hidden rounded-lg p-1.5 text-slate-600 hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
            {user && (
              <div className="mb-3 border-b border-slate-100 pb-2">
                <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                <p className="text-xs text-slate-500 capitalize">{user.role} &bull; {user.email}</p>
              </div>
            )}

            <div className="flex flex-col gap-1">
              {user?.role === 'admin' && (
                <>
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/admin/students"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Students
                  </Link>
                  <Link
                    to="/admin/teachers"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Teachers
                  </Link>
                  <Link
                    to="/admin/subjects"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Subjects
                  </Link>
                </>
              )}

              {user?.role === 'teacher' && (
                <>
                  <Link
                    to="/teacher"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    My Subjects
                  </Link>
                  <Link
                    to="/teacher/attendance"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Mark Attendance
                  </Link>
                </>
              )}

              {user?.role === 'student' && (
                <Link
                  to="/student"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  My Attendance
                </Link>
              )}

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsPasswordModalOpen(true);
                }}
                className="mt-2 text-left rounded-md px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
              >
                Change Password
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </>
  );
}

export default Navbar;
