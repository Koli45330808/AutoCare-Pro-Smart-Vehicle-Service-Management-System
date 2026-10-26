
import {
  LayoutDashboard,
  Car,
  CalendarPlus,
  ClipboardList,
  FileText,
  Receipt,
  CreditCard,
  History,
  Bell,
  Bot,
  Star,
  Plus,
  X,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const menuItems = [
  {
    label: "Dashboard",
    path: "/customer",
    icon: LayoutDashboard,
  },
  {
    label: "My Vehicles",
    path: "/customer/vehicles",
    icon: Car,
  },
  {
    label: "Add Vehicle",
    path: "/customer/vehicles/add",
    icon: Plus,
  },
  {
    label: "Book Service",
    path: "/customer/book-service",
    icon: CalendarPlus,
  },
  {
    label: "My Bookings",
    path: "/customer/bookings",
    icon: ClipboardList,
  },
  {
    label: "Service History",
    path: "/customer/service-history",
    icon: History,
  },
  {
    label: "Quotation",
    path: "/customer/quotations",
    icon: FileText,
  },
  {
    label: "Invoice",
    path: "/customer/invoices",
    icon: Receipt,
  },
  {
    label: "My Payments",
    path: "/customer/payments",
    icon: CreditCard,
  },
  {
    label: "Reviews",
    path: "/customer/reviews",
    icon: Star,
  },
  {
    label: "Notifications",
    path: "/customer/notifications",
    icon: Bell,
  },
  {
    label: "AI Assistant",
    path: "/customer/ai-assistant",
    icon: Bot,
  },
];

export default function Sidebar({
  mobileOpen = false,
  setMobileOpen,
}) {
  const closeMobile = () => {
    setMobileOpen?.(false);
  };

  return (
    <>
      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={closeMobile}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col bg-slate-900 text-white transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        {/* LOGO */}
        <div className="flex h-20 items-center justify-between border-b border-slate-700 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600">
              <Car size={25} />
            </div>

            <div>
              <h1 className="text-sm font-bold">
                Smart Vehicle
              </h1>

              <p className="text-xs text-slate-400">
                Service Management
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeMobile}
            aria-label="Close menu"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* CUSTOMER PROFILE */}
        <div className="border-b border-slate-700 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 font-bold">
              AK
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                Customer Account
              </p>

              <p className="text-xs text-slate-400">
                Customer
              </p>
            </div>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Main Menu
          </p>

          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.label}
                  to={item.path}
                  end={
                    item.path === "/customer" ||
                    item.path === "/customer/vehicles"
                  }
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                      isActive
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`
                  }
                >
                  <Icon size={19} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* HELP SECTION */}
        <div className="border-t border-slate-700 p-4">
          <div className="rounded-xl bg-slate-800 p-4">
            <div className="flex items-center gap-2">
              <Bot
                size={18}
                className="text-blue-400"
              />

              <span className="text-sm font-semibold">
                Need Help?
              </span>
            </div>

            <p className="mt-2 text-xs leading-5 text-slate-400">
              Ask our AI Assistant about vehicle problems
              and services.
            </p>

            <NavLink
              to="/customer/ai-assistant"
              onClick={closeMobile}
              className="mt-3 block rounded-lg bg-blue-600 px-3 py-2 text-center text-xs font-semibold hover:bg-blue-700"
            >
              Ask AI Assistant
            </NavLink>
          </div>
        </div>
      </aside>
    </>
  );
}
