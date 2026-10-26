
import { useState } from "react";

import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";

import {
  LayoutDashboard,
  CalendarCheck,
  UserRoundCog,
  Users,
  Wrench,
  BarChart3,
  LogOut,
  ShieldCheck,
  FileText,
  CreditCard,
  Menu,
  X,
} from "lucide-react";

// ==========================================
// ADMIN NAVIGATION
// ==========================================

const menu = [
  {
    to: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
    end: true,
  },
  {
    to: "/admin/bookings",
    label: "Manage Bookings",
    icon: CalendarCheck,
  },
  {
    to: "/admin/assign-technician",
    label: "Assign Technician",
    icon: Wrench,
  },
  {
    to: "/admin/customers",
    label: "Customers",
    icon: Users,
  },
  {
    to: "/admin/technicians",
    label: "Technicians",
    icon: UserRoundCog,
  },
  {
    to: "/admin/invoices",
    label: "Invoices",
    icon: FileText,
  },
  {
    to: "/admin/payments",
    label: "Payments",
    icon: CreditCard,
  },
  {
    to: "/admin/reports",
    label: "Reports",
    icon: BarChart3,
  },
];

export default function AdminLayout() {
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  // ==========================================
  // ADMIN LOGOUT
  // ==========================================

  function logout() {
    sessionStorage.removeItem("adminToken");

    setMobileMenuOpen(false);

    navigate("/admin/login", {
      replace: true,
    });
  }

  // ==========================================
  // NAVIGATION LINKS
  // ==========================================

  function NavigationLinks() {
    return menu.map(
      ({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={() => setMobileMenuOpen(false)}
          className={({ isActive }) =>
            [
              "flex items-center gap-3 rounded-xl",
              "px-4 py-3 text-sm font-medium",
              "transition-colors duration-200",
              isActive
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-300 hover:bg-slate-800 hover:text-white",
            ].join(" ")
          }
        >
          <Icon size={20} className="shrink-0" />
          <span>{label}</span>
        </NavLink>
      )
    );
  }

  // ==========================================
  // SIDEBAR CONTENT
  // ==========================================

  function SidebarContent() {
    return (
      <>
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600/20">
            <ShieldCheck
              size={26}
              className="text-blue-400"
            />
          </div>

          <div>
            <h2 className="text-base font-bold text-white">
              Smart Vehicle
            </h2>

            <p className="text-xs text-slate-400">
              Admin Portal
            </p>
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          <NavigationLinks />
        </nav>

        <div className="mt-8 border-t border-slate-800 pt-5">
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-300 transition-colors hover:bg-slate-800 hover:text-red-200"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">

      {/* MOBILE HEADER */}
      <header className="flex items-center justify-between bg-slate-950 px-4 py-4 text-white lg:hidden">
        <div className="flex items-center gap-3">
          <ShieldCheck
            size={26}
            className="text-blue-400"
          />

          <span className="font-bold">
            Smart Vehicle Admin
          </span>
        </div>

        <button
          type="button"
          onClick={() =>
            setMobileMenuOpen((previous) => !previous)
          }
          aria-label={
            mobileMenuOpen
              ? "Close admin menu"
              : "Open admin menu"
          }
          aria-expanded={mobileMenuOpen}
          className="rounded-lg p-2 hover:bg-slate-800"
        >
          {mobileMenuOpen ? (
            <X size={24} />
          ) : (
            <Menu size={24} />
          )}
        </button>
      </header>

      {/* MOBILE NAVIGATION */}
      {mobileMenuOpen && (
        <aside className="bg-slate-950 p-5 text-white lg:hidden">
          <SidebarContent />
        </aside>
      )}

      {/* DESKTOP SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 overflow-y-auto bg-slate-950 p-5 text-white lg:block">
        <SidebarContent />
      </aside>

      {/* MAIN CONTENT */}
      <main className="min-h-screen min-w-0 lg:ml-64">
        <Outlet />
      </main>
    </div>
  );
}
