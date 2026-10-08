import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/auth";
import { getErrorMessage } from "../utils/errors";
import AuthLayout, { ErrorBanner, inputClass, labelClass } from "../components/AuthLayout";
import Icon from "../components/Icon";

export default function Register() {
  const navigate = useNavigate();

  // One object holds all four form fields (same names your backend expects).
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await registerUser({
        name: form.name.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      // Register returns no token, so send the person to Login.
      navigate("/login", { state: { registered: true } });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start organizing your tasks"
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary-container hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <ErrorBanner>{error}</ErrorBanner>

        <div>
          <label htmlFor="name" className={labelClass}>Full name</label>
          <input id="name" className={inputClass} placeholder="Alex Rivera" autoComplete="name"
            value={form.name} onChange={update("name")} required />
        </div>

        <div>
          <label htmlFor="username" className={labelClass}>Username</label>
          <input id="username" className={inputClass} placeholder="alexrivera" autoComplete="username"
            value={form.username} onChange={update("username")} required />
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>Email address</label>
          <input id="email" type="email" className={inputClass} placeholder="alex@example.com" autoComplete="email"
            value={form.email} onChange={update("email")} required />
        </div>

        <div>
          <label htmlFor="password" className={labelClass}>Password</label>
          <div className="relative">
            <input
              id="password"
              className={`${inputClass} pr-11`}
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="new-password"
              value={form.password}
              onChange={update("password")}
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
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>
    </AuthLayout>
  );
}
