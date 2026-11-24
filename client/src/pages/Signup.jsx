import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import FormInput from '../components/FormInput';

function Signup() {
  const { user, signup, loading } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    rollNo: '',
    semester: '1',
    department: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-600">
        Loading...
      </div>
    );
  }

  if (user) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required';
    if (!formData.email.trim()) errs.email = 'Valid email is required';
    if (!formData.password || formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }
    if (!formData.department.trim()) {
      errs.department = 'Department is required';
    }

    if (role === 'student') {
      if (!formData.rollNo.trim()) {
        errs.rollNo = 'Roll number is required for students';
      }
      const sem = Number(formData.semester);
      if (!sem || sem < 1 || sem > 12) {
        errs.semester = 'Semester must be between 1 and 12';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role,
        department: formData.department.trim(),
        ...(role === 'student' && {
          rollNo: formData.rollNo.trim(),
          semester: Number(formData.semester),
        }),
      };

      const newUser = await signup(payload);
      toast.success(`Account created! Welcome, ${newUser.name}`);
      navigate(`/${newUser.role}`);
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed';
      toast.error(msg);
      if (msg.toLowerCase().includes('email')) {
        setErrors((prev) => ({ ...prev, email: msg }));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Create an Account
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Sign up to track attendance and lecture sessions.
          </p>
        </div>

        {/* Role Selection Tabs */}
        <div className="mt-6">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Register As:
          </label>
          <div className="mt-2 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1.5">
            <button
              type="button"
              onClick={() => {
                setRole('student');
                setErrors({});
              }}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition ${
                role === 'student'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🎓</span> Student
            </button>
            <button
              type="button"
              onClick={() => {
                setRole('teacher');
                setErrors({});
              }}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition ${
                role === 'teacher'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>👨‍🏫</span> Teacher
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <FormInput
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder={role === 'student' ? 'e.g. Alice Johnson' : 'e.g. Dr. Alan Turing'}
            required
            error={errors.name}
          />

          <FormInput
            label="College Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder={role === 'student' ? 'student@college.edu' : 'teacher@college.edu'}
            required
            error={errors.email}
          />

          {role === 'student' && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormInput
                label="Roll Number"
                name="rollNo"
                value={formData.rollNo}
                onChange={handleChange}
                placeholder="e.g. CS-101"
                required
                error={errors.rollNo}
              />
              <FormInput
                label="Semester"
                name="semester"
                type="number"
                value={formData.semester}
                onChange={handleChange}
                placeholder="1 to 12"
                required
                error={errors.semester}
              />
            </div>
          )}

          <FormInput
            label="Department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            placeholder="e.g. Computer Science & Engineering"
            required
            error={errors.department}
          />

          <FormInput
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="At least 6 characters"
            required
            error={errors.password}
          />

          <FormInput
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter password"
            required
            error={errors.confirmPassword}
          />

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-slate-800 disabled:opacity-50 transition"
          >
            {submitting ? 'Creating account...' : `Sign Up as ${role === 'student' ? 'Student' : 'Teacher'}`}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-800">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}

export default Signup;
