
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import {
  Wrench,
  Mail,
  Lock,
  LogIn,
  Eye,
  EyeOff,
  UserPlus,
} from "lucide-react";

export default function TechnicianLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:8080/api/technician/auth/login",
        {
          email: email.trim().toLowerCase(),
          password,
        }
      );

      const token = response.data?.token;

      if (!token) {
        throw new Error(
          "Login response does not contain a JWT token."
        );
      }

      // Save only the technician login token
      sessionStorage.setItem("technicianToken", token);

      // Open technician dashboard, NOT admin dashboard
      navigate("/technician", { replace: true });

    } catch (err) {
      const status = err.response?.status;

      if (!err.response && err.code === "ERR_NETWORK") {
        setError(
          "Cannot connect to backend. Check Spring Boot on port 8080."
        );
      } else if (status === 401) {
        setError("Invalid technician email or password.");
      } else if (status === 403) {
        setError(
          "Your technician account is not approved or access is denied."
        );
      } else {
        setError(
          err.response?.data?.message ||
          err.response?.data?.detail ||
          err.message ||
          "Technician login failed."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">

        <div className="mb-7 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
            <Wrench size={32} />
          </div>

          <h1 className="mt-5 text-3xl font-bold text-slate-900">
            Technician Login
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Access assigned vehicle service jobs
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label
              htmlFor="technician-email"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Technician Email
            </label>

            <div className="flex items-center gap-3 rounded-xl border border-slate-300 px-4 focus-within:border-emerald-500">
              <Mail size={19} className="shrink-0 text-slate-400" />

              <input
                id="technician-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full min-w-0 py-3 outline-none"
                placeholder="Enter technician email"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="technician-password"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Password
            </label>

            <div className="flex items-center gap-3 rounded-xl border border-slate-300 px-4 focus-within:border-emerald-500">
              <Lock size={19} className="shrink-0 text-slate-400" />

              <input
                id="technician-password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full min-w-0 py-3 outline-none"
                placeholder="Enter password"
              />

              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="shrink-0 text-slate-500 hover:text-emerald-600"
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff size={19} />
                ) : (
                  <Eye size={19} />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
          >
            <LogIn size={19} />

            {loading ? "Signing in..." : "Login as Technician"}
          </button>
        </form>

        <div className="mt-6 border-t border-slate-200 pt-6">
          <p className="mb-4 text-center text-sm text-slate-500">
            New Technician? Create your account
          </p>

          <Link
            to="/technician/register"
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-emerald-600 py-3 font-semibold text-emerald-700 transition hover:bg-emerald-50"
          >
            <UserPlus size={19} />
            Register as Technician
          </Link>

          <p className="mt-5 text-center text-sm text-slate-500">
            Customer?{" "}
            <Link
              to="/login"
              className="font-semibold text-blue-600 hover:underline"
            >
              Customer Login
            </Link>
          </p>

          <p className="mt-4 text-center text-xs text-slate-400">
            Technician registration requires Admin approval.
          </p>
        </div>
      </div>
    </div>
  );
}
