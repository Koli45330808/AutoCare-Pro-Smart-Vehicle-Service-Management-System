
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Car,
  CalendarCheck,
  Wrench,
  ArrowRight,
  Bot,
  Plus,
  ClipboardList,
  History,
  Receipt,
  FileText,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import { getAllVehicles } from "../../services/vehicleService";

const quickActions = [
  {
    title: "Book Service",
    description: "Schedule your next vehicle service",
    path: "/customer/book-service",
    icon: CalendarCheck,
  },
  {
    title: "Add Vehicle",
    description: "Register a new vehicle",
    path: "/customer/vehicles/add",
    icon: Plus,
  },
  {
    title: "My Bookings",
    description: "Track service bookings",
    path: "/customer/bookings",
    icon: ClipboardList,
  },
  {
    title: "Service History",
    description: "View completed services",
    path: "/customer/service-history",
    icon: History,
  },
  {
    title: "Invoices",
    description: "Select a booking to view its invoice",
    path: "/customer/bookings",
    icon: Receipt,
  },
  {
    title: "Quotations",
    description: "Select a booking to view its quotation",
    path: "/customer/bookings",
    icon: FileText,
  },
  {
    title: "AI Assistant",
    description: "Get help with vehicle services",
    path: "/customer/ai-assistant",
    icon: Bot,
  },
];

export default function Dashboard() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadVehicles() {
      try {
        setLoading(true);
        setError("");

        const data = await getAllVehicles();

        if (!active) return;

        setVehicles(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Dashboard vehicle error:", err);

        if (active) {
          setError("Unable to load your vehicles.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadVehicles();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">

        {/* WELCOME */}
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-lg md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-blue-100">
                Customer Dashboard
              </p>

              <h1 className="mt-1 text-2xl font-bold md:text-3xl">
                Welcome to Smart Vehicle Service
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">
                Manage your vehicles, book services, track repairs,
                and view your invoices in one place.
              </p>
            </div>

            <Link
              to="/customer/book-service"
              className="flex w-fit items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-600 shadow-md hover:bg-blue-50"
            >
              <Plus size={18} />
              Book Service
            </Link>
          </div>
        </div>

        {/* MAIN CARDS */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          <Link
            to="/customer/vehicles"
            className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  My Vehicles
                </p>

                <h2 className="mt-2 text-3xl font-bold text-slate-800">
                  {loading ? "..." : error ? "—" : vehicles.length}
                </h2>

                <p className="mt-2 text-xs text-slate-500">
                  Registered vehicles
                </p>
              </div>

              <Car size={30} className="text-blue-600" />
            </div>
          </Link>

          <Link
            to="/customer/bookings"
            className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Service Bookings
                </p>

                <h2 className="mt-2 text-xl font-bold text-slate-800">
                  View Bookings
                </h2>

                <p className="mt-2 text-xs text-slate-500">
                  Track your service requests
                </p>
              </div>

              <CalendarCheck
                size={30}
                className="text-indigo-600"
              />
            </div>
          </Link>

          <Link
            to="/customer/service-history"
            className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Completed Services
                </p>

                <h2 className="mt-2 text-xl font-bold text-slate-800">
                  View History
                </h2>

                <p className="mt-2 text-xs text-slate-500">
                  Review completed work
                </p>
              </div>

              <Wrench size={30} className="text-green-600" />
            </div>
          </Link>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* VEHICLES */}
        <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                My Registered Vehicles
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Vehicles linked to your account
              </p>
            </div>

            <Link
              to="/customer/vehicles"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600"
            >
              View All
              <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-slate-500">
              <RefreshCw size={18} className="animate-spin" />
              Loading vehicles...
            </div>
          ) : vehicles.length === 0 ? (
            <div className="rounded-xl bg-slate-50 p-6 text-center">
              <Car size={32} className="mx-auto text-slate-400" />

              <p className="mt-3 text-sm text-slate-600">
                No vehicles to display.
              </p>

              <Link
                to="/customer/vehicles/add"
                className="mt-4 inline-block rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
              >
                Add Vehicle
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {vehicles.slice(0, 4).map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="flex items-center gap-4 rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Car size={23} />
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-800">
                      {[vehicle.make, vehicle.model]
                        .filter(Boolean)
                        .join(" ") || "Vehicle"}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {vehicle.registrationNumber || "No registration number"}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {vehicle.fuelType || "Fuel type unavailable"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* BOOKING ACCESS */}
        <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Track Your Vehicle Service
              </h2>

              <p className="mt-2 text-sm text-slate-600">
                Open your bookings to check service status,
                quotations, payments, and invoices.
              </p>
            </div>

            <Link
              to="/customer/bookings"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <ClipboardList size={18} />
              My Bookings
            </Link>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800">
            Quick Actions
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Access frequently used services
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <Link
                  key={action.title}
                  to={action.path}
                  className="group flex items-start gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-blue-300 hover:bg-blue-50"
                >
                  <div className="rounded-lg bg-blue-100 p-3 text-blue-600">
                    <Icon size={20} />
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-800">
                      {action.title}
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {action.description}
                    </p>
                  </div>

                  <ArrowRight
                    size={16}
                    className="ml-auto shrink-0 text-slate-400 transition group-hover:translate-x-1"
                  />
                </Link>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
