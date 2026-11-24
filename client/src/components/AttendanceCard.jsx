function AttendanceCard({ subject, onViewHistory }) {
  const {
    name,
    code,
    semester,
    teacher,
    totalClasses,
    classesAttended,
    percentage,
    classesNeeded,
    classesCanMiss,
  } = subject;

  const hasClasses = totalClasses > 0;
  const isBelow75 = hasClasses && percentage < 75;

  // Progress bar styling based on thresholds:
  // Green >= 75%, Amber 70-75%, Red < 70%
  let progressColor = 'bg-slate-300';
  let badgeColor = 'bg-slate-100 text-slate-700 border-slate-300';
  let badgeText = 'No classes yet';

  if (hasClasses) {
    if (percentage >= 75) {
      progressColor = 'bg-emerald-500';
      badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-300';
      badgeText = '✓ Safe (≥ 75%)';
    } else if (percentage >= 70) {
      progressColor = 'bg-amber-500';
      badgeColor = 'bg-amber-50 text-amber-700 border-amber-300';
      badgeText = '⚠️ Low (70% - 75%)';
    } else {
      progressColor = 'bg-rose-500';
      badgeColor = 'bg-rose-50 text-rose-700 border-rose-300';
      badgeText = '🚨 Critical (< 70%)';
    }
  }

  return (
    <div
      className={`flex flex-col justify-between rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md ${
        isBelow75 ? 'border-rose-200 ring-1 ring-rose-100' : 'border-slate-200'
      }`}
    >
      <div>
        {/* Header & Badges */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold uppercase text-slate-700">
                {code}
              </span>
              <span className="text-xs text-slate-500">Sem {semester}</span>
            </div>
            <h3 className="mt-1 text-base font-semibold text-slate-900">{name}</h3>
            <p className="text-xs text-slate-500">Teacher: {teacher}</p>
          </div>

          <span
            className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badgeColor}`}
          >
            {badgeText}
          </span>
        </div>

        {/* Progress & Stats */}
        <div className="mt-4">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">
              {hasClasses ? `${percentage}%` : 'N/A'}
            </span>
            <span className="text-xs font-medium text-slate-500">
              {classesAttended} / {totalClasses} attended
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Smart Attendance Advisor */}
        <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs">
          {!hasClasses ? (
            <p className="text-slate-600">
              No classes held yet. Your attendance status will calculate as soon as the
              teacher marks attendance.
            </p>
          ) : isBelow75 ? (
            <div className="text-rose-700">
              <span className="font-semibold">⚠️ Action Required:</span> Attend next{' '}
              <span className="font-bold underline">{classesNeeded}</span> class
              {classesNeeded > 1 ? 'es' : ''} in a row to reach 75%.
            </div>
          ) : (
            <div className="text-emerald-700">
              <span className="font-semibold">✓ Attendance Safe:</span> You can miss{' '}
              <span className="font-bold underline">{classesCanMiss}</span> class
              {classesCanMiss === 1 ? '' : 'es'} and still stay at or above 75%.
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-5 border-t border-slate-100 pt-3">
        <button
          type="button"
          onClick={() => onViewHistory(subject)}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
        >
          View Attendance History
          <span aria-hidden="true">&rarr;</span>
        </button>
      </div>
    </div>
  );
}

export default AttendanceCard;
