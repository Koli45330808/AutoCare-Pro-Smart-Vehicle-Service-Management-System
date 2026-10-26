
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { Bell, Menu, UserCircle } from "lucide-react";

import {
  getCustomerToken,
  getCustomerProfile,
  logoutCustomer,
} from "../services/authService";

function CustomerLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let active = true;

    const verifyLogin = async () => {
      if (!getCustomerToken()) {
        if (active) {
          setAuthenticated(false);
          setChecking(false);
        }
        return;
      }

      try {
        const profile = await getCustomerProfile();

        if (active) {
          setCustomer(profile);
          setAuthenticated(true);
        }
      } catch (error) {
        console.error("Authentication failed:", error);

        if (active) {
          logoutCustomer();
          setAuthenticated(false);
        }
      } finally {
        if (active) {
          setChecking(false);
        }
      }
    };

    verifyLogin();

    return () => {
      active = false;
    };
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-600">
          Verifying your login...
        </p>
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className="min-h-screen lg:ml-72">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm md:px-6">

          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          >
            <Menu size={24} />
          </button>

          <div className="hidden lg:block">
            <h2 className="text-lg font-bold text-slate-800">
              Smart Vehicle Service Management
            </h2>
            <p className="text-xs text-slate-500">
              Customer Portal
            </p>
          </div>

          <div className="ml-auto flex items-center gap-4">
            <button
              type="button"
              aria-label="Notifications"
              className="relative rounded-xl p-2.5 text-slate-600 hover:bg-slate-100"
            >
              <Bell size={22} />
              <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
            </button>

            <div className="h-8 w-px bg-slate-200" />

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <UserCircle size={27} />
              </div>

              <div className="hidden md:block">
                <p className="text-sm font-bold text-slate-800">
                  {customer?.name ||
                    customer?.fullName ||
                    "Customer"}
                </p>

                <p className="text-xs text-slate-500">
                  {customer?.email || ""}
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default CustomerLayout;
