
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  Car,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  User,
  AlertCircle,
  Loader2,
} from "lucide-react";

import { registerCustomer } from "../../services/authService";

export default function Register() {
  const navigate = useNavigate();

  // ================= STATES =================

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  // ================= HANDLE INPUT =================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  // ================= CUSTOMER REGISTRATION =================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    setError("");

    const firstName = formData.firstName.trim();
    const lastName = formData.lastName.trim();
    const email = formData.email.trim().toLowerCase();
    const phone = formData.phone.trim();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone) {
      setError("Please fill in all required fields.");
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Validate phone
    if (!/^[0-9]{10}$/.test(phone)) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    // Backend requires minimum 8 characters
    if (password.length < 8) {
      setError(
        "Password must contain at least 8 characters."
      );
      return;
    }

    // Validate confirm password
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      // IMPORTANT:
      // Spring Boot expects name, email, phone, password.
      // Do not send firstName and lastName separately.

      const customerData = {
        name: `${firstName} ${lastName}`,
        email: email,
        phone: phone,
        password: password,
      };

      // Call Spring Boot registration API
      await registerCustomer(customerData);

      // Redirect only after successful registration
      navigate("/login", {
        replace: true,
        state: {
          registrationSuccess: true,
          email: email,
        },
      });
    } catch (err) {
      const status = err.response?.status;
      const data = err.response?.data;

      let message =
        "Registration failed. Please try again.";

      if (status === 400) {
        message =
          data?.message ||
          data?.detail ||
          "Invalid registration details. Please check all fields.";
      } else if (status === 409) {
        message =
          "This email is already registered. Please log in.";
      } else if (status === 401 || status === 403) {
        message =
          "Registration access denied. Please check backend security configuration.";
      } else if (status >= 500) {
        message =
          "Backend server error. Please try again later.";
      } else if (!err.response) {
        message =
          "Cannot connect to Spring Boot backend. Make sure the backend is running.";
      } else {
        message =
          data?.message ||
          data?.detail ||
          message;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // ================= USER INTERFACE =================

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-lg">

        {/* LOGO */}
        <div className="mb-7 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg">
            <Car size={32} />
          </div>

          <h1 className="mt-4 text-2xl font-bold text-slate-800">
            Smart Vehicle Service
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Create your customer account
          </p>
        </div>

        {/* REGISTRATION CARD */}
        <div className="rounded-2xl bg-white p-6 shadow-lg md:p-8">

          <h2 className="text-2xl font-bold text-slate-800">
            Create Account
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Register to book and manage vehicle services.
          </p>

          {/* ERROR MESSAGE */}
          {error && (
            <div
              role="alert"
              className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              <AlertCircle
                size={20}
                className="shrink-0"
              />

              <p>{error}</p>
            </div>
          )}

          {/* REGISTRATION FORM */}
          <form
            onSubmit={handleSubmit}
            className="mt-7 space-y-5"
          >

            {/* FIRST NAME AND LAST NAME */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

              {/* FIRST NAME */}
              <div>
                <label
                  htmlFor="firstName"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  First Name
                </label>

                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-4 top-3.5 text-slate-400"
                  />

                  <input
                    id="firstName"
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="First name"
                    autoComplete="given-name"
                    required
                    disabled={loading}
                    className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* LAST NAME */}
              <div>
                <label
                  htmlFor="lastName"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Last Name
                </label>

                <input
                  id="lastName"
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last name"
                  autoComplete="family-name"
                  required
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* EMAIL */}
            <div>
              <label
                htmlFor="registerEmail"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Email Address
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-3.5 text-slate-400"
                />

                <input
                  id="registerEmail"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* PHONE */}
            <div>
              <label
                htmlFor="registerPhone"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Phone Number
              </label>

              <div className="relative">
                <Phone
                  size={18}
                  className="absolute left-4 top-3.5 text-slate-400"
                />

                <input
                  id="registerPhone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit phone number"
                  autoComplete="tel"
                  inputMode="numeric"
                  maxLength={10}
                  required
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label
                htmlFor="registerPassword"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Password
              </label>

              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-4 top-3.5 text-slate-400"
                />

                <input
                  id="registerPassword"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create password (min. 8 characters)"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-12 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((previous) => !previous)
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  className="absolute right-4 top-3.5 text-slate-400 hover:text-blue-600"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* CONFIRM PASSWORD */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Confirm Password
              </label>

              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-4 top-3.5 text-slate-400"
                />

                <input
                  id="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-12 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (previous) => !previous
                    )
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                  className="absolute right-4 top-3.5 text-slate-400 hover:text-blue-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2
                    size={19}
                    className="animate-spin"
                  />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* LOGIN LINK */}
          <p className="mt-7 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
