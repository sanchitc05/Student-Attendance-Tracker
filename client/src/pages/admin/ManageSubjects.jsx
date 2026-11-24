import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import FormInput from '../../components/FormInput';

function ManageSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Subject details modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [subjectForm, setSubjectForm] = useState({ name: '', code: '', semester: '' });

  // Enrollment modal
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [assignedTeacherId, setAssignedTeacherId] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);

  // Confirm delete dialog
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subjectsRes, teachersRes, studentsRes] = await Promise.all([
        api.get('/subjects'),
        api.get('/users?role=teacher'),
        api.get('/users?role=student'),
      ]);

      setSubjects(subjectsRes.data.data || []);
      setTeachers(teachersRes.data.data?.users || teachersRes.data.data || []);
      setStudents(studentsRes.data.data?.users || studentsRes.data.data || []);
    } catch (error) {
      toast.error('Failed to load subjects and users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setEditingSubject(null);
    setSubjectForm({ name: '', code: '', semester: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (subject) => {
    setEditingSubject(subject);
    setSubjectForm({
      name: subject.name,
      code: subject.code,
      semester: subject.semester,
    });
    setIsModalOpen(true);
  };

  const handleSubjectSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingSubject) {
        await api.put(`/subjects/${editingSubject._id}`, {
          name: subjectForm.name,
          code: subjectForm.code,
          semester: Number(subjectForm.semester),
        });
        toast.success('Subject updated successfully');
      } else {
        await api.post('/subjects', {
          name: subjectForm.name,
          code: subjectForm.code,
          semester: Number(subjectForm.semester),
        });
        toast.success('Subject created successfully');
      }

      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      const msg = error.response?.data?.message || 'Operation failed';
      toast.error(msg);
    }
  };

  const handleOpenEnroll = (subject) => {
    setSelectedSubject(subject);
    setAssignedTeacherId(subject.teacher?._id || '');
    setSelectedStudentIds(subject.students?.map((s) => s._id) || []);
    setIsEnrollModalOpen(true);
  };

  const toggleStudent = (studentId) => {
    if (selectedStudentIds.includes(studentId)) {
      setSelectedStudentIds(selectedStudentIds.filter((id) => id !== studentId));
    } else {
      setSelectedStudentIds([...selectedStudentIds, studentId]);
    }
  };

  const handleEnrollSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.put(`/subjects/${selectedSubject._id}/enroll`, {
        teacher: assignedTeacherId || null,
        students: selectedStudentIds,
      });
      toast.success('Enrollments updated successfully');
      setIsEnrollModalOpen(false);
      fetchData();
    } catch (error) {
      const msg = error.response?.data?.message || 'Enrollment failed';
      toast.error(msg);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/subjects/${selectedSubjectId}`);
      toast.success('Subject deleted successfully');
      setIsConfirmOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to delete subject');
    }
  };

  const columns = [
    { header: 'Code', accessor: 'code' },
    { header: 'Name', accessor: 'name' },
    { header: 'Semester', accessor: 'semester' },
    {
      header: 'Assigned Teacher',
      render: (row) =>
        row.teacher ? (
          <div>
            <p className="font-medium text-slate-900">{row.teacher.name}</p>
            <p className="text-xs text-slate-500">{row.teacher.department || row.teacher.email}</p>
          </div>
        ) : (
          <span className="text-xs italic text-slate-400">Unassigned</span>
        ),
    },
    {
      header: 'Enrolled',
      render: (row) => (
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
          {row.students?.length || 0} students
        </span>
      ),
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleOpenEnroll(row)}
            className="rounded bg-slate-900 px-2.5 py-1 text-xs font-medium text-white hover:bg-slate-700"
          >
            Enrollments
          </button>
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
              setSelectedSubjectId(row._id);
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
            <h1 className="text-2xl font-bold text-slate-900">Manage Subjects</h1>
            <p className="mt-1 text-sm text-slate-500">
              Create subjects, assign teachers, and enroll students.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            + Add Subject
          </button>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="text-center text-sm text-slate-500">
              Loading subjects...
            </div>
          ) : (
            <Table
              columns={columns}
              data={subjects}
              emptyMessage="No subjects found."
            />
          )}
        </div>

        {/* Add/Edit Subject Details */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingSubject ? 'Edit Subject Details' : 'Create New Subject'}
        >
          <form onSubmit={handleSubjectSubmit} className="space-y-4">
            <FormInput
              label="Subject Name"
              name="name"
              value={subjectForm.name}
              onChange={(e) =>
                setSubjectForm({ ...subjectForm, name: e.target.value })
              }
              placeholder="e.g. Data Structures and Algorithms"
              required
            />
            <FormInput
              label="Subject Code"
              name="code"
              value={subjectForm.code}
              onChange={(e) =>
                setSubjectForm({ ...subjectForm, code: e.target.value })
              }
              placeholder="e.g. CS401"
              required
            />
            <FormInput
              label="Semester"
              name="semester"
              type="number"
              value={subjectForm.semester}
              onChange={(e) =>
                setSubjectForm({ ...subjectForm, semester: e.target.value })
              }
              placeholder="e.g. 4"
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
                {editingSubject ? 'Save Changes' : 'Create Subject'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Enrollment Management */}
        <Modal
          isOpen={isEnrollModalOpen}
          onClose={() => setIsEnrollModalOpen(false)}
          title={`Enrollments: ${selectedSubject?.name} (${selectedSubject?.code})`}
        >
          <form onSubmit={handleEnrollSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Assigned Teacher
              </label>
              <select
                value={assignedTeacherId}
                onChange={(e) => setAssignedTeacherId(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900"
              >
                <option value="">-- No Teacher Assigned --</option>
                {teachers.map((t) => (
                  <option key={t.id || t._id} value={t.id || t._id}>
                    {t.name} ({t.department || 'No dept'}) - {t.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-700">
                  Enrolled Students ({selectedStudentIds.length} Selected)
                </label>
                {students.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedStudentIds.length === students.length) {
                        setSelectedStudentIds([]);
                      } else {
                        setSelectedStudentIds(students.map((s) => s.id || s._id));
                      }
                    }}
                    className="text-xs text-slate-600 hover:text-slate-900 underline"
                  >
                    {selectedStudentIds.length === students.length ? 'Deselect all' : 'Select all'}
                  </button>
                )}
              </div>

              <div className="mt-2 max-h-56 space-y-1.5 overflow-y-auto rounded-md border border-slate-200 bg-slate-50 p-3">
                {students.length === 0 ? (
                  <p className="text-xs text-slate-500">No students available in the system.</p>
                ) : (
                  students.map((st) => {
                    const sid = st.id || st._id;
                    const isSelected = selectedStudentIds.includes(sid);
                    return (
                      <label
                        key={sid}
                        className={`flex cursor-pointer items-center justify-between rounded p-2 text-sm transition ${
                          isSelected ? 'bg-white shadow-xs font-medium text-slate-900' : 'text-slate-600 hover:bg-white/60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleStudent(sid)}
                            className="rounded border-slate-300 text-slate-900 focus:ring-0"
                          />
                          <span>
                            {st.rollNo ? <strong className="font-semibold">{st.rollNo}</strong> : null} - {st.name}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">Sem {st.semester || '-'}</span>
                      </label>
                    );
                  })
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={() => setIsEnrollModalOpen(false)}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
              >
                Save Enrollments
              </button>
            </div>
          </form>
        </Modal>

        <ConfirmDialog
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={handleDelete}
          title="Delete Subject"
          message="Are you sure you want to delete this subject? All enrollment associations will also be removed."
        />
      </main>
    </div>
  );
}

export default ManageSubjects;
