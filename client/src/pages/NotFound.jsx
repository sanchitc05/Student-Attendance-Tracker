import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <div className="mx-auto max-w-md">
        <span className="inline-block rounded-full bg-indigo-100 px-4 py-1.5 text-sm font-bold text-indigo-700">
          404 Error
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Page Not Found
        </h1>
        <p className="mt-3 text-sm text-slate-500">
          Sorry, the page you are looking for doesn't exist, has been removed, or is temporarily unavailable.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            to="/"
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
