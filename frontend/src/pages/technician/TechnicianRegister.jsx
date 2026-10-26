
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Wrench } from "lucide-react";
import axios from "axios";

export default function TechnicianRegister() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:8080/api/technician/auth/register",
        {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          specialization: form.specialization.trim(),
          password: form.password,
        }
      );

      setSuccess(
        response.data.message ||
          "Registration submitted for admin approval."
      );

      setTimeout(() => {
        navigate("/technician/login");
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-xl">

        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
            <Wrench size={32} />
          </div>

          <h1 className="mt-5 text-3xl font-bold">
            Technician Registration
          </h1>

          <p className="mt-2 text-slate-500">
            Apply to join Smart Vehicle Service
          </p>
        </div>

        {error && (
          <p role="alert" className="mt-5 rounded-xl bg-red-50 p-3 text-red-600">
            {error}
          </p>
        )}

        {success && (
          <p role="status" className="mt-5 rounded-xl bg-green-50 p-3 text-green-700">
            {success}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          {[
            ["name", "Full Name", "text"],
            ["email", "Email Address", "email"],
            ["phone", "Phone Number", "tel"],
            ["specialization", "Specialization", "text"],
            ["password", "Password", "password"],
            ["confirmPassword", "Confirm Password", "password"],
          ].map(([name, label, type]) => (
            <div key={name}>
              <label
                htmlFor={name}
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                {label}
              </label>

              <input
                id={name}
                name={name}
                type={type}
                value={form[name]}
                onChange={handleChange}
                required
                minLength={
                  type === "password" ? 8 : undefined
                }
                autoComplete={
                  name === "password"
                    ? "new-password"
                    : name === "confirmPassword"
                      ? "new-password"
                      : undefined
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
                placeholder={`Enter ${label.toLowerCase()}`}
              />
            </div>
          ))}

          <button
            disabled={loading}
            type="submit"
            className="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading
              ? "Submitting..."
              : "Register as Technician"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already registered?{" "}
          <Link
            to="/technician/login"
            className="font-semibold text-emerald-600"
          >
            Technician Login
          </Link>
        </p>

        <p className="mt-3 text-center text-xs text-slate-400">
          Your account requires Admin approval before login.
        </p>
      </div>
    </div>
  );
}
