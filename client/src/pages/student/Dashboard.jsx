import Navbar from '../../components/Navbar';

function StudentDashboard() {
  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-2xl font-semibold text-slate-900">Student dashboard</h1>
        <p className="mt-2 text-slate-600">
          Placeholder — next phases will show per-subject attendance and the
          75% warning here.
        </p>
      </main>
    </div>
  );
}

export default StudentDashboard;
