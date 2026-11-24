function Skeleton({ className = '', count = 1 }) {
  if (count > 1) {
    return (
      <div className="space-y-2.5">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className={`animate-pulse rounded-md bg-slate-200 ${className}`}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`animate-pulse rounded-md bg-slate-200 ${className}`} />
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
      <div className="border-b border-slate-200 bg-slate-50 px-6 py-3.5">
        <Skeleton className="h-4 w-36" />
      </div>
      <div className="divide-y divide-slate-100 p-6 space-y-4">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center justify-between gap-4">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton key={c} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Skeleton;
