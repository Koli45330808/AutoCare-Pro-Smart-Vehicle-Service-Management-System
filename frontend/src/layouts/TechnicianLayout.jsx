
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  Wrench,
  LogOut,
} from "lucide-react";

export default function TechnicianLayout() {
  const navigate = useNavigate();

  const logout = () => {
    sessionStorage.removeItem("technicianToken");
    navigate("/technician/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-100 md:flex">
      <aside className="bg-slate-950 p-5 text-white md:min-h-screen md:w-64 md:shrink-0">
        <div className="mb-8 flex items-center gap-3">
          <Wrench size={32} className="text-emerald-400" />
          <div>
            <h2 className="font-bold">Smart Vehicle</h2>
            <p className="text-xs text-slate-400">Technician Portal</p>
          </div>
        </div>

        <nav className="flex flex-wrap gap-2 md:flex-col">
          <NavLink
            to="/technician"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${
                isActive ? "bg-emerald-600" : "hover:bg-slate-800"
              }`
            }
          >
            <LayoutDashboard size={19} />
            Dashboard
          </NavLink>

          <NavLink
            to="/technician/jobs"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${
                isActive ? "bg-emerald-600" : "hover:bg-slate-800"
              }`
            }
          >
            <ClipboardList size={19} />
            Assigned Jobs
          </NavLink>
        </nav>

        <button
          onClick={logout}
          className="mt-8 flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-red-300 hover:bg-slate-800"
        >
          <LogOut size={19} />
          Logout
        </button>
      </aside>

      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  );
}
