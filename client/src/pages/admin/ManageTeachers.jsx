import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import FormInput from '../../components/FormInput';

function ManageTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);

  const initialForm = {
    name: '',
    email: '',
    password: '',
    department: '',
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const res = await api.get(
        `/users?role=teacher&search=${encodeURIComponent(search)}`
      );
      setTeachers(res.data.data);
    } catch (error) {
      toast.error('Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [search]);

  const handleOpenAdd = () => {
    setEditingTeacher(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name,
      email: teacher.email,
      password: '',
      department: teacher.department || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingTeacher) {
        await api.put(`/users/${editingTeacher.id}`, {
          name: formData.name,
          email: formData.email,
          department: formData.department,
        });
        toast.success('Teacher updated successfully');
      } else {
        await api.post('/auth/register', {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: 'teacher',
          department: formData.department,
        });
        toast.success('Teacher registered successfully');
      }

      setIsModalOpen(false);
      fetchTeachers();
    } catch (error) {
      const msg = error.response?.data?.message || 'Action failed';
      toast.error(msg);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/users/${selectedTeacherId}`);
      toast.success('Teacher deleted successfully');
      setIsConfirmOpen(false);
      fetchTeachers();
    } catch (error) {
      toast.error('Failed to delete teacher');
    }
  };

  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Department', accessor: 'department' },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleOpenEdit(row)}
            className="rounded bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedTeacherId(row.id);
              setIsConfirmOpen(true);
            }}
            className="rounded bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-100"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Manage Teachers</h1>
            <p className="mt-1 text-sm text-slate-500">
              View, search, register, and update faculty members.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            + Add Teacher
          </button>
        </div>

        <div className="mt-6 max-w-sm">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, department..."
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900"
          />
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="text-center text-sm text-slate-500">
              Loading teachers...
            </div>
          ) : (
            <Table
              columns={columns}
              data={teachers}
              emptyMessage="No teachers found matching your criteria."
            />
          )}
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
            <FormInput
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
            {!editingTeacher && (
              <FormInput
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
            )}
            <FormInput
              label="Department"
              name="department"
              value={formData.department}
              onChange={(e) =>
                setFormData({ ...formData, department: e.target.value })
              }
              required
            />

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
              >
                {editingTeacher ? 'Save Changes' : 'Create Teacher'}
              </button>
            </div>
          </form>
        </Modal>

        <ConfirmDialog
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={handleDelete}
          title="Delete Teacher"
          message="Are you sure you want to delete this teacher? This action cannot be undone."
        />
      </main>
    </div>
  );
}

export default ManageTeachers;
