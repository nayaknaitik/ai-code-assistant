import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen flex-col bg-bg">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-surface px-4">
        <div className="flex items-center gap-6">
          <Link to="/editor" className="flex items-center gap-2 text-lg font-semibold text-text">
            AI Code Assistant
          </Link>
          <nav className="flex gap-1 text-sm text-text-secondary">
            <span className="text-muted">Editor</span>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-text-secondary">{user.email}</span>
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate("/", { replace: true });
                }}
                className="rounded px-3 py-1.5 text-sm text-text-secondary transition-colors hover:bg-border hover:text-text"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded px-3 py-1.5 text-sm text-text-secondary transition-colors hover:bg-border hover:text-text"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="rounded bg-accent px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </header>
      <main className="flex flex-1 flex-col overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
