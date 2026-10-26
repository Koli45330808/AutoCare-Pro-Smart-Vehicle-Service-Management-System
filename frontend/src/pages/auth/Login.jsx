
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  CarFront,
  UserRound,
  ShieldCheck,
  Wrench,
  Eye,
  EyeOff,
} from "lucide-react";

import { loginCustomer } from "../../services/authService";

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (event) => {
    setFormData((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await loginCustomer(
        formData.email.trim(),
        formData.password
      );

      navigate("/customer", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          (err.response?.status === 401
            ? "Invalid email or password"
            : "Login failed. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-md">

        {/* LOGO */}
        <div className="mb-7 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg">
            <CarFront size={34} />
          </div>

          <h1 className="mt-4 text-2xl font-bold text-slate-800">
            Smart Vehicle Service
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Vehicle Service Management System
          </p>
        </div>

        {/* LOGIN CARD */}
        <div className="rounded-2xl bg-white p-6 shadow-lg sm:p-8">

          <h2 className="text-2xl font-bold text-slate-800">
            Welcome Back
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Choose your role to access your portal.
          </p>

          {/* ROLE SELECTION */}
          <div className="mt-6 grid grid-cols-3 gap-2">

            <div
              className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-blue-600 bg-blue-50 px-2 py-4 text-blue-700"
              aria-current="page"
            >
              <UserRound size={24} />
              <span className="text-xs font-bold">
                Customer
              </span>
            </div>

            <Link
              to="/admin/login"
              className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 px-2 py-4 text-slate-600 transition hover:border-blue-500 hover:bg-blue-50"
            >
              <ShieldCheck size={24} />
              <span className="text-xs font-semibold">
                Admin
              </span>
            </Link>

            <Link
              to="/technician/login"
              className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 px-2 py-4 text-slate-600 transition hover:border-emerald-500 hover:bg-emerald-50"
            >
              <Wrench size={24} />
              <span className="text-xs font-semibold">
                Technician
              </span>
            </Link>
          </div>

          <div className="mt-7 border-t border-slate-200 pt-6">
            <h3 className="text-lg font-bold text-slate-800">
              Customer Login
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Sign in to manage your vehicle services.
            </p>
          </div>

          {/* ERROR MESSAGE */}
          {error && (
            <div
              role="alert"
              className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {/* CUSTOMER LOGIN FORM */}
          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-5"
          >
            <div>
              <label
                htmlFor="login-email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Email Address
              </label>

              <input
                id="login-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                autoComplete="email"
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-20 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((previous) => !previous)
                  }
                  className="absolute right-3 top-3 flex items-center gap-1 text-sm font-semibold text-blue-600"
                >
                  {showPassword ? (
                    <>
                      <EyeOff size={17} />
                      Hide
                    </>
                  ) : (
                    <>
                      <Eye size={17} />
                      Show
                    </>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {loading
                ? "Logging in..."
                : "Login as Customer"}
            </button>
          </form>

          {/* REGISTRATION */}
          <p className="mt-7 text-center text-sm text-slate-500">
            Don't have a customer account?{" "}
            <Link
              to="/register"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Create Account
            </Link>
          </p>
        </div>

        <p className="mt-5 text-center text-xs text-slate-400">
          Smart Vehicle Service Management System
        </p>
      </div>
    </div>
  );
}

export default Login;
