
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ShieldCheck, Mail, Lock, LogIn } from "lucide-react";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:8080/api/admin/auth/login",
        { email, password }
      );

      const token = response.data.token;

      if (!token) {
        throw new Error("JWT token not received from backend.");
      }

      sessionStorage.setItem("adminToken", token);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Admin login failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <div className="mb-7 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
            <ShieldCheck size={32} />
          </div>

          <h1 className="mt-5 text-3xl font-bold text-slate-900">
            Admin Login
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Smart Vehicle Service Management
          </p>
        </div>

        {error && (
          <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Admin Email
            </label>
            <div className="flex items-center gap-3 rounded-xl border px-4">
              <Mail size={19} className="text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full py-3 outline-none"
                placeholder="Enter admin email"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Password
            </label>
            <div className="flex items-center gap-3 rounded-xl border px-4">
              <Lock size={19} className="text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full py-3 outline-none"
                placeholder="Enter password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <LogIn size={19} />
            {loading ? "Signing in..." : "Login as Admin"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Customer?{" "}
          <Link to="/login" className="font-semibold text-blue-600">
            Customer Login
          </Link>
        </p>
      </div>
    </div>
  );
}
