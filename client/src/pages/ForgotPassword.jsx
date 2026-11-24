import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import FormInput from '../components/FormInput';

function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 = Enter Email, 2 = Enter OTP & New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Step 1: Send OTP to Email
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrors({ email: 'Please enter your registered email' });
      return;
    }

    try {
      setLoading(true);
      setErrors({});
      const res = await api.post('/auth/forgot-password', { email: email.trim() });
      toast.success(res.data.message || 'OTP sent to your email!');
      setStep(2);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send reset OTP';
      toast.error(msg);
      setErrors({ email: msg });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    const errs = {};

    if (!otp.trim() || otp.trim().length !== 6) {
      errs.otp = 'Enter the 6-digit OTP code';
    }
    if (!newPassword || newPassword.length < 6) {
      errs.newPassword = 'Password must be at least 6 characters';
    }
    if (newPassword !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    try {
      setLoading(true);
      setErrors({});
      const res = await api.post('/auth/reset-password', {
        email: email.trim(),
        otp: otp.trim(),
        newPassword,
      });

      toast.success(res.data.message || 'Password reset successfully!');
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.message || 'Password reset failed';
      toast.error(msg);
      if (msg.toLowerCase().includes('otp')) {
        setErrors({ otp: msg });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        {step === 1 ? (
          <div>
            <div className="text-center">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-2xl">
                🔑
              </span>
              <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
                Forgot Password?
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Enter your registered email address and we will send you a 6-digit verification code.
              </p>
            </div>

            <form onSubmit={handleSendOtp} className="mt-6 space-y-4">
              <FormInput
                label="Registered College Email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({});
                }}
                placeholder="e.g. alice@college.edu"
                required
                error={errors.email}
              />

              <button
                type="submit"
                disabled={loading}
                className="mt-4 w-full rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-slate-800 disabled:opacity-50 transition"
              >
                {loading ? 'Sending OTP...' : 'Send Verification OTP'}
              </button>
            </form>
          </div>
        ) : (
          <div>
            <div className="text-center">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-2xl">
                📬
              </span>
              <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
                Verify OTP & Reset
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Code sent to <span className="font-semibold text-slate-800">{email}</span>
              </p>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="mt-1 text-xs font-medium text-indigo-600 hover:text-indigo-800"
              >
                Change email address
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  6-Digit OTP Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value);
                    if (errors.otp) setErrors((prev) => ({ ...prev, otp: '' }));
                  }}
                  placeholder="123456"
                  required
                  className={`mt-1 w-full text-center tracking-widest text-xl font-bold rounded-lg border px-3 py-2 outline-none transition ${
                    errors.otp
                      ? 'border-rose-400 focus:border-rose-600'
                      : 'border-slate-300 focus:border-slate-900'
                  }`}
                />
                {errors.otp && (
                  <span className="mt-1 block text-xs text-rose-600">{errors.otp}</span>
                )}
              </div>

              <FormInput
                label="New Password"
                name="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (errors.newPassword) setErrors((prev) => ({ ...prev, newPassword: '' }));
                }}
                placeholder="At least 6 characters"
                required
                error={errors.newPassword}
              />

              <FormInput
                label="Confirm New Password"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword)
                    setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                }}
                placeholder="Repeat new password"
                required
                error={errors.confirmPassword}
              />

              <button
                type="submit"
                disabled={loading}
                className="mt-6 w-full rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-slate-800 disabled:opacity-50 transition"
              >
                {loading ? 'Resetting password...' : 'Reset Password'}
              </button>

              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Didn't receive the code? Resend OTP
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
          <Link to="/login" className="font-medium text-slate-700 hover:text-slate-900">
            &larr; Back to Sign In
          </Link>
          <Link to="/signup" className="font-semibold text-indigo-600 hover:text-indigo-800">
            Create Account &rarr;
          </Link>
        </div>
      </div>
    </main>
  );
}

export default ForgotPassword;
