import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Modal from './Modal';
import FormInput from './FormInput';

function ChangePasswordModal({ isOpen, onClose }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setErrors({});
    onClose();
  };

  const validateForm = () => {
    const errs = {};
    if (!currentPassword) {
      errs.currentPassword = 'Current password is required';
    }
    if (!newPassword) {
      errs.newPassword = 'New password is required';
    } else if (newPassword.length < 6) {
      errs.newPassword = 'New password must be at least 6 characters';
    } else if (newPassword === currentPassword) {
      errs.newPassword = 'New password cannot be the same as current password';
    }

    if (!confirmPassword) {
      errs.confirmPassword = 'Confirm your new password';
    } else if (newPassword !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const res = await api.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      toast.success(res.data.message || 'Password changed successfully');
      handleClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to change password';
      toast.error(msg);
      if (msg.toLowerCase().includes('current password')) {
        setErrors({ currentPassword: msg });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Change Password">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          label="Current Password"
          name="currentPassword"
          type="password"
          value={currentPassword}
          onChange={(e) => {
            setCurrentPassword(e.target.value);
            if (errors.currentPassword) setErrors({ ...errors, currentPassword: '' });
          }}
          placeholder="Enter your current password"
          required
          error={errors.currentPassword}
        />

        <FormInput
          label="New Password"
          name="newPassword"
          type="password"
          value={newPassword}
          onChange={(e) => {
            setNewPassword(e.target.value);
            if (errors.newPassword) setErrors({ ...errors, newPassword: '' });
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
            if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
          }}
          placeholder="Repeat new password"
          required
          error={errors.confirmPassword}
        />

        <div className="mt-6 flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default ChangePasswordModal;
