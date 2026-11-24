import Modal from './Modal';

function SubjectAttendanceDetailModal({ isOpen, onClose, subject }) {
  if (!subject) return null;

  const {
    name,
    code,
    semester,
    teacher,
    totalClasses,
    classesAttended,
    percentage,
    history = [],
  } = subject;

  const formatDate = (dateString) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString?.substring(0, 10) || 'N/A';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${code} - Attendance History`}
    >
      <div className="space-y-4">
        {/* Subject Info */}
        <div className="rounded-lg bg-slate-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-semibold text-slate-900">{name}</h3>
              <p className="text-xs text-slate-500">
                Semester {semester} &bull; Teacher: {teacher}
              </p>
            </div>
            <div className="text-right">
              <span
                className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  totalClasses === 0
                    ? 'bg-slate-200 text-slate-700'
                    : percentage >= 75
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {totalClasses > 0 ? `${percentage}% Attendance` : 'No Classes'}
              </span>
              <p className="mt-0.5 text-xs text-slate-500">
                {classesAttended} / {totalClasses} classes attended
              </p>
            </div>
          </div>
        </div>

        {/* Date-wise Attendance List */}
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Date-wise Records ({history.length} {history.length === 1 ? 'class' : 'classes'})
          </h4>

          {history.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
              No attendance sessions recorded for this subject yet.
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <div className="max-h-72 overflow-y-auto">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 border-b border-slate-200 bg-slate-100 text-xs font-semibold text-slate-600">
                    <tr>
                      <th className="px-4 py-2.5">Date</th>
                      <th className="px-4 py-2.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {history.map((record, index) => {
                      const isPresent = record.status === 'present';
                      return (
                        <tr key={index} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium text-slate-800">
                            {formatDate(record.date)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                isPresent
                                  ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                                  : 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
                              }`}
                            >
                              {isPresent ? '✓ Present' : '✕ Absent'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default SubjectAttendanceDetailModal;
