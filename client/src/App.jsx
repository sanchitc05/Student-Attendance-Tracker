import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import ManageStudents from './pages/admin/ManageStudents';
import ManageTeachers from './pages/admin/ManageTeachers';
import ManageSubjects from './pages/admin/ManageSubjects';
import TeacherDashboard from './pages/teacher/Dashboard';
import MarkAttendance from './pages/teacher/MarkAttendance';
import ClassReport from './pages/teacher/ClassReport';
import StudentDashboard from './pages/student/Dashboard';

function HomeRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-600">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={`/${user.role}`} replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<Login />} />

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/students"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ManageStudents />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/teachers"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ManageTeachers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/subjects"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ManageSubjects />
          </ProtectedRoute>
        }
      />

      {/* Teacher routes */}
      <Route
        path="/teacher"
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/attendance"
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <MarkAttendance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/attendance/:subjectId"
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <MarkAttendance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/report/:subjectId"
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <ClassReport />
          </ProtectedRoute>
        }
      />

      {/* Student routes */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
