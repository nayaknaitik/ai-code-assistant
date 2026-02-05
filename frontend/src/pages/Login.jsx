import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Email and password required");
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      toast.success("Signed in");
      navigate("/editor", { replace: true });
    } catch (err) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-xl font-semibold text-text">AI Code Assistant</h1>
          <p className="mt-1 text-sm text-text-secondary">Sign in to your account</p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-border bg-surface p-6 shadow-subtle"
        >
          <label className="block text-sm font-medium text-text-secondary">
            Email
          </label>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded border border-border bg-bg px-3 py-2 text-sm text-text placeholder-muted focus:border-accent focus:ring-0"
            placeholder="you@example.com"
          />
          <label className="mt-4 block text-sm font-medium text-text-secondary">
            Password
          </label>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded border border-border bg-bg px-3 py-2 text-sm text-text placeholder-muted focus:border-accent focus:ring-0"
            placeholder="••••••••"
          />
          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded bg-accent py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-text-secondary">
          No account?{" "}
          <Link to="/register" className="text-accent hover:underline">
            Sign up
          </Link>
        </p>
        <p className="mt-2 text-center text-xs text-muted">
          <Link to="/" className="hover:text-text-secondary">
            Continue as guest
          </Link>
        </p>
      </div>
    </div>
  );
}
