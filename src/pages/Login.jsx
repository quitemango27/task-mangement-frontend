import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/errors";
import AuthLayout, { ErrorBanner, inputClass, labelClass } from "../components/AuthLayout";
import Icon from "../components/Icon";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // The Register page sends a "success" message here after signing up.
  const justRegistered = location.state?.registered;

  const handleSubmit = async (e) => {
    e.preventDefault(); // stop the browser from reloading the page
    setError("");
    setSubmitting(true);
    try {
      await login(username.trim(), password);
      navigate("/");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your workspace"
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold text-primary-container hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {justRegistered && !error && (
          <div className="flex items-center gap-2 rounded-lg bg-primary-fixed text-primary px-3 py-2.5 text-sm">
            <Icon name="check_circle" className="text-[18px]" />
            Account created. Sign in to continue.
          </div>
        )}
        <ErrorBanner>{error}</ErrorBanner>

        <div>
          <label htmlFor="username" className={labelClass}>Username</label>
          <input
            id="username"
            className={inputClass}
            placeholder="your username"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="password" className={labelClass}>Password</label>
          <div className="relative">
            <input
              id="password"
              className={`${inputClass} pr-11`}
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-on-surface-variant hover:text-on-surface"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <Icon name={showPassword ? "visibility_off" : "visibility"} className="text-[20px]" />
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full h-11 rounded-lg bg-primary-container text-on-primary font-medium hover:bg-primary transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </AuthLayout>
  );
}
