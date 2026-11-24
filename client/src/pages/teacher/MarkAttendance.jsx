import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';

function MarkAttendance() {
  const { subjectId: routeSubjectId } = useParams();
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(routeSubjectId || '');
  const [date, setDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [existingAttendanceId, setExistingAttendanceId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Maximum selectable date is today (no future dates)
  const maxDate = new Date().toISOString().substring(0, 10);

  // Fetch teacher's subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await api.get('/subjects/my');
        setSubjects(res.data.data);

        if (!selectedSubjectId && res.data.data.length > 0) {
          setSelectedSubjectId(res.data.data[0]._id);
        }
      } catch (error) {
        toast.error('Failed to load subjects');
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  // When subject changes, populate student list
  useEffect(() => {
    if (!selectedSubjectId || subjects.length === 0) return;

    const currentSub = subjects.find((s) => s._id === selectedSubjectId);
    if (currentSub && currentSub.students) {
      setStudents(currentSub.students);
    }
  }, [selectedSubjectId, subjects]);

  // When subject or date changes, check if attendance already exists
  useEffect(() => {
    if (!selectedSubjectId || !date) return;

    const checkExistingAttendance = async () => {
      try {
        const res = await api.get(
          `/attendance/by-date?subject=${selectedSubjectId}&date=${date}`
        );

        if (res.data.data) {
          // Attendance already exists for this date -> switch to edit mode
          setExistingAttendanceId(res.data.data._id);
          const initialMap = {};
          res.data.data.records.forEach((r) => {
            const sid = r.student?._id || r.student;
            initialMap[sid] = r.status;
          });
          setAttendanceMap(initialMap);
          toast('Loaded existing attendance in edit mode', { icon: 'ℹ️' });
        } else {
          // New date -> default all to present
          setExistingAttendanceId(null);
          const initialMap = {};
          students.forEach((s) => {
            initialMap[s._id] = 'present';
          });
          setAttendanceMap(initialMap);
        }
      } catch (error) {
        console.error('Failed to check attendance records', error);
      }
    };

    if (students.length > 0) {
      checkExistingAttendance();
    }
  }, [selectedSubjectId, date, students]);

  const toggleStatus = (studentId) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === 'present' ? 'absent' : 'present',
    }));
  };

  const markAll = (status) => {
    const nextMap = {};
    students.forEach((s) => {
      nextMap[s._id] = status;
    });
    setAttendanceMap(nextMap);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (students.length === 0) {
      toast.error('Cannot mark attendance for a subject with 0 students');
      return;
    }

    const records = students.map((s) => ({
      student: s._id,
      status: attendanceMap[s._id] || 'present',
    }));

    setSubmitting(true);
    try {
      if (existingAttendanceId) {
        await api.put(`/attendance/${existingAttendanceId}`, { records });
        toast.success('Attendance updated successfully');
      } else {
        const res = await api.post('/attendance', {
          subject: selectedSubjectId,
          date,
          records,
        });
        setExistingAttendanceId(res.data.data._id);
        toast.success('Attendance recorded successfully');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to submit attendance';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const presentCount = Object.values(attendanceMap).filter(
    (s) => s === 'present'
  ).length;

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Mark Attendance</h1>
            <p className="text-sm text-slate-500">
              Select your subject and date to record or correct attendance.
            </p>
          </div>
          {existingAttendanceId && (
            <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
              ● Edit Mode (Record exists)
            </span>
          )}
        </div>

        {/* Controls */}
        <div className="mt-6 grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Subject
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900"
            >
              {subjects.map((sub) => (
                <option key={sub._id} value={sub._id}>
                  {sub.code} - {sub.name} (Sem {sub.semester})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Date
            </label>
            <input
              type="date"
              max={maxDate}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900"
            />
          </div>
        </div>

        {/* Action bar */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => markAll('present')}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Mark all Present
            </button>
            <button
              type="button"
              onClick={() => markAll('absent')}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Mark all Absent
            </button>
          </div>

          <p className="text-xs font-medium text-slate-600">
            Present: <strong className="text-emerald-600">{presentCount}</strong> / {students.length} students
          </p>
        </div>

        {/* Student list */}
        <div className="mt-4 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {students.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No students are currently enrolled in this subject.
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {students.map((student) => {
                const status = attendanceMap[student._id] || 'present';
                const isPresent = status === 'present';

                return (
                  <li
                    key={student._id}
                    className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {student.rollNo ? <span className="font-mono mr-2">{student.rollNo}</span> : null}
                        {student.name}
                      </p>
                      <p className="text-xs text-slate-400">{student.email}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleStatus(student._id)}
                      className={`min-w-[90px] rounded-full px-3 py-1 text-xs font-bold transition ${
                        isPresent
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                      }`}
                    >
                      {isPresent ? '✓ Present' : '✕ Absent'}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Submit button */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            disabled={submitting || students.length === 0}
            onClick={handleSubmit}
            className="rounded-md bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-700 disabled:opacity-50"
          >
            {submitting
              ? 'Saving...'
              : existingAttendanceId
              ? 'Update Attendance'
              : 'Save Attendance'}
          </button>
        </div>
      </main>
    </div>
  );
}

export default MarkAttendance;
