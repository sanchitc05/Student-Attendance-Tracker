import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import FormInput from '../../components/FormInput';
import { TableSkeleton } from '../../components/Skeleton';

function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasPrevPage: false,
    hasNextPage: false,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  const initialForm = {
    name: '',
    email: '',
    password: '',
    rollNo: '',
    semester: '',
    department: '',
  };
  const [formData, setFormData] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users', {
        params: {
          role: 'student',
          search: search.trim() || undefined,
          page,
          limit,
        },
      });

      const fetchedUsers =
        res.data.data.users || (Array.isArray(res.data.data) ? res.data.data : []);
      setStudents(fetchedUsers);

      if (res.data.data.pagination) {
        setPagination(res.data.data.pagination);
      } else {
        setPagination({
          total: fetchedUsers.length,
          page: 1,
          limit: fetchedUsers.length,
          totalPages: 1,
          hasPrevPage: false,
          hasNextPage: false,
        });
      }
    } catch (error) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, search]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page on search
  };

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormData(initialForm);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      password: '',
      rollNo: student.rollNo || '',
      semester: student.semester || '',
      department: student.department || '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateStudentForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Full name is required';
    if (!formData.email.trim()) errors.email = 'Valid email is required';
    if (!editingStudent && (!formData.password || formData.password.length < 6)) {
      errors.password = 'Password must be at least 6 characters';
    }
    if (!formData.rollNo.trim()) errors.rollNo = 'Roll number is required';
    if (!formData.semester || Number(formData.semester) < 1 || Number(formData.semester) > 12) {
      errors.semester = 'Semester must be between 1 and 12';
    }
    if (!formData.department.trim()) errors.department = 'Department is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStudentForm()) return;

    try {
      if (editingStudent) {
        await api.put(`/users/${editingStudent.id}`, {
          name: formData.name,
          email: formData.email,
          rollNo: formData.rollNo,
          semester: Number(formData.semester),
          department: formData.department,
        });
        toast.success('Student updated successfully');
      } else {
        await api.post('/auth/register', {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: 'student',
          rollNo: formData.rollNo,
          semester: Number(formData.semester),
          department: formData.department,
        });
        toast.success('Student registered successfully');
      }

      setIsModalOpen(false);
      fetchStudents();
    } catch (error) {
      const msg = error.response?.data?.message || 'Action failed';
      toast.error(msg);
      if (msg.toLowerCase().includes('email')) {
        setFormErrors((prev) => ({ ...prev, email: msg }));
      }
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/users/${selectedStudentId}`);
      toast.success('Student deleted successfully');
      setIsConfirmOpen(false);
      fetchStudents();
    } catch (error) {
      toast.error('Failed to delete student');
    }
  };

  const columns = [
    { header: 'Roll No', accessor: 'rollNo' },
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Semester', accessor: 'semester' },
    { header: 'Department', accessor: 'department' },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleOpenEdit(row)}
            className="rounded bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200 transition"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedStudentId(row.id);
              setIsConfirmOpen(true);
            }}
            className="rounded bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-100 transition"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Manage Students
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              View, search, register, and update enrolled students.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-slate-800 transition"
          >
            + Add Student
          </button>
        </div>

        {/* Search Bar */}
        <div className="mt-6 max-w-md">
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by name, email, roll number..."
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-1 focus:ring-slate-200"
          />
        </div>

        {/* Student Table or Skeleton */}
        <div className="mt-6">
          {loading ? (
            <TableSkeleton rows={6} cols={6} />
          ) : (
            <div className="space-y-4">
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
                <Table
                  columns={columns}
                  data={students}
                  emptyMessage="No students found matching your criteria."
                />
              </div>

              {/* Pagination Controls */}
              {pagination.total > 0 && (
                <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-3 rounded-xl sm:flex-row shadow-xs">
                  <p className="text-xs text-slate-600">
                    Showing{' '}
                    <span className="font-semibold text-slate-900">
                      {(pagination.page - 1) * pagination.limit + 1}
                    </span>{' '}
                    to{' '}
                    <span className="font-semibold text-slate-900">
                      {Math.min(pagination.page * pagination.limit, pagination.total)}
                    </span>{' '}
                    of{' '}
                    <span className="font-semibold text-slate-900">
                      {pagination.total}
                    </span>{' '}
                    students
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={!pagination.hasPrevPage}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      &larr; Previous
                    </button>
                    <span className="px-2 text-xs font-medium text-slate-700">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={!pagination.hasNextPage}
                      onClick={() => setPage((p) => p + 1)}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingStudent ? 'Edit Student' : 'Add New Student'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (formErrors.name) setFormErrors({ ...formErrors, name: '' });
              }}
              error={formErrors.name}
              required
            />
            <FormInput
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (formErrors.email) setFormErrors({ ...formErrors, email: '' });
              }}
              error={formErrors.email}
              required
            />
            {!editingStudent && (
              <FormInput
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  if (formErrors.password) setFormErrors({ ...formErrors, password: '' });
                }}
                error={formErrors.password}
                placeholder="At least 6 characters"
                required
              />
            )}
            <FormInput
              label="Roll Number"
              name="rollNo"
              value={formData.rollNo}
              onChange={(e) => {
                setFormData({ ...formData, rollNo: e.target.value });
                if (formErrors.rollNo) setFormErrors({ ...formErrors, rollNo: '' });
              }}
              error={formErrors.rollNo}
              required
            />
            <FormInput
              label="Semester"
              name="semester"
              type="number"
              value={formData.semester}
              onChange={(e) => {
                setFormData({ ...formData, semester: e.target.value });
                if (formErrors.semester) setFormErrors({ ...formErrors, semester: '' });
              }}
              error={formErrors.semester}
              placeholder="1 to 12"
              required
            />
            <FormInput
              label="Department"
              name="department"
              value={formData.department}
              onChange={(e) => {
                setFormData({ ...formData, department: e.target.value });
                if (formErrors.department) setFormErrors({ ...formErrors, department: '' });
              }}
              error={formErrors.department}
              required
            />

            <div className="mt-6 flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-slate-800 transition"
              >
                {editingStudent ? 'Save Changes' : 'Create Student'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation */}
        <ConfirmDialog
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={handleDelete}
          title="Delete Student"
          message="Are you sure you want to delete this student record? This action cannot be undone."
        />
      </main>
    </div>
  );
}

export default ManageStudents;
