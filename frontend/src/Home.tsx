import { Link } from "react-router-dom";

function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-5xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            Task Manager
          </h1>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">
            Choose your portal to continue.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <article className="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-200">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-7 w-7"
              >
                <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
                <path d="M4 20a8 8 0 0 1 16 0" />
                <path d="M18 3v4m-2-2h4" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Admin Login</h2>
            <p className="mt-2 text-sm text-slate-600">
              Manage users, tasks, and reports.
            </p>
            <Link
              to="/login?role=admin"
              className="mt-5 inline-flex items-center justify-center rounded-lg bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600"
            >
              Login as Admin
            </Link>
          </article>

          <article className="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-200">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-7 w-7"
              >
                <path d="M12 13a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
                <path d="M4 20a8 8 0 0 1 16 0" />
                <path d="m17 9 2 2 3-3" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-900">User Login</h2>
            <p className="mt-2 text-sm text-slate-600">
              Track assigned tasks and comments.
            </p>
            <Link
              to="/login?role=user"
              className="mt-5 inline-flex items-center justify-center rounded-lg bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600"
            >
              Login as User
            </Link>
          </article>
        </div>
      </div>
    </main>
  );
}

export default Home;
