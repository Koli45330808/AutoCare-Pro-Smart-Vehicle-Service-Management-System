
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import {
  ArrowLeft,
  Search,
  Users,
  Car,
  Phone,
  Mail,
  RefreshCw,
  X,
  AlertCircle,
  Loader2,
  CalendarCheck,
  Eye,
} from "lucide-react";

const API_URL = "http://localhost:8080/api/admin/customers";

// ==========================================
// ERROR HANDLING
// ==========================================

function getErrorMessage(error) {
  if (error.response?.status === 401) {
    return "Admin session expired. Please log in again.";
  }

  if (error.response?.status === 403) {
    return "Access denied. Admin permission is required.";
  }

  if (error.response?.status === 404) {
    return "Customer API not found. Check AdminCustomerController.java.";
  }

  return (
    error.response?.data?.detail ||
    error.response?.data?.message ||
    error.message ||
    "Failed to load customers."
  );
}

// ==========================================
// GET CUSTOMERS FROM SPRING BOOT
// ==========================================

async function getAdminCustomers() {
  const token = sessionStorage.getItem("adminToken");

  if (!token) {
    throw new Error("Admin login required. Please log in again.");
  }

  const response = await axios.get(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    timeout: 15000,
  });

  if (!Array.isArray(response.data)) {
    throw new Error("Invalid customer API response. Expected an array.");
  }

  return response.data;
}

// ==========================================
// CUSTOMER PAGE
// ==========================================

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getAdminCustomers();
      setCustomers(data);
    } catch (err) {
      setCustomers([]);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  // ==========================================
  // CUSTOMER STATISTICS
  // ==========================================

  const stats = useMemo(() => {
    return {
      totalCustomers: customers.length,

      customersWithVehicles: customers.filter(
        (customer) => Number(customer.vehicles || 0) > 0
      ).length,

      totalVehicles: customers.reduce(
        (sum, customer) =>
          sum + Number(customer.vehicles || 0),
        0
      ),

      totalBookings: customers.reduce(
        (sum, customer) =>
          sum + Number(customer.bookings || 0),
        0
      ),
    };
  }, [customers]);

  // ==========================================
  // CUSTOMER SEARCH
  // ==========================================

  const filteredCustomers = useMemo(() => {
    const term = search.trim().toLowerCase();

    return customers.filter((customer) => {
      return [
        customer.id,
        customer.name,
        customer.email,
        customer.phone,
      ]
        .map((value) => String(value ?? ""))
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [customers, search]);

  // ==========================================
  // SELECTED CUSTOMER
  // ==========================================

  const selectedCustomer =
    customers.find(
      (customer) =>
        String(customer.id) === String(selectedCustomerId)
    ) || null;

  // ==========================================
  // DASHBOARD CARDS
  // ==========================================

  const statCards = [
    {
      label: "Total Customers",
      value: stats.totalCustomers,
      icon: Users,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-100",
    },
    {
      label: "Customers With Vehicles",
      value: stats.customersWithVehicles,
      icon: Users,
      iconColor: "text-green-600",
      iconBg: "bg-green-100",
    },
    {
      label: "Registered Vehicles",
      value: stats.totalVehicles,
      icon: Car,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-100",
    },
    {
      label: "Service Bookings",
      value: stats.totalBookings,
      icon: CalendarCheck,
      iconColor: "text-orange-600",
      iconBg: "bg-orange-100",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              to="/admin"
              className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft size={17} />
              Back to Dashboard
            </Link>

            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Customer Management
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              View registered customers, vehicles, and service activity.
            </p>
          </div>

          <button
            type="button"
            onClick={loadCustomers}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw
              size={18}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle size={20} className="shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* STATISTICS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.label}
                className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">
                      {card.label}
                    </p>

                    <p className="mt-2 text-3xl font-bold text-slate-900">
                      {loading || error ? "..." : card.value}
                    </p>
                  </div>

                  <div
                    className={`rounded-xl p-3 ${card.iconBg} ${card.iconColor}`}
                  >
                    <Icon size={24} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CUSTOMER SEARCH */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="relative">
            <Search
              size={19}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, email, phone, or customer ID..."
              className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* CUSTOMER TABLE */}
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <h2 className="text-xl font-bold text-slate-800">
              Registered Customers
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Showing {filteredCustomers.length} of{" "}
              {customers.length} customers
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-3 p-12 text-slate-500">
              <Loader2 size={22} className="animate-spin" />
              Loading customers...
            </div>
          ) : error ? (
            <div className="p-12 text-center text-red-600">
              Unable to display customers. Click Refresh to try again.
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              {customers.length === 0
                ? "No registered customers found."
                : "No customers match your search."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Customer</th>
                    <th className="px-5 py-4">Contact</th>
                    <th className="px-5 py-4">Vehicles</th>
                    <th className="px-5 py-4">Bookings</th>
                    <th className="px-5 py-4">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredCustomers.map((customer) => {
                    const name =
                      customer.name || `Customer #${customer.id}`;

                    const initials = name
                      .trim()
                      .split(/\s+/)
                      .slice(0, 2)
                      .map((part) => part.charAt(0))
                      .join("")
                      .toUpperCase();

                    return (
                      <tr
                        key={customer.id}
                        className="hover:bg-slate-50"
                      >
                        {/* CUSTOMER */}
                        <td className="px-5 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                              {initials}
                            </div>

                            <div>
                              <p className="font-semibold text-slate-800">
                                {name}
                              </p>

                              <p className="text-xs text-slate-400">
                                Customer #{customer.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* CONTACT */}
                        <td className="px-5 py-5">
                          <p className="flex items-center gap-2 text-slate-600">
                            <Mail size={15} />
                            {customer.email || "N/A"}
                          </p>

                          <p className="mt-2 flex items-center gap-2 text-slate-500">
                            <Phone size={15} />
                            {customer.phone || "N/A"}
                          </p>
                        </td>

                        {/* VEHICLES */}
                        <td className="px-5 py-5">
                          <span className="inline-flex items-center gap-2 font-semibold text-slate-700">
                            <Car size={17} />
                            {customer.vehicles ?? 0}
                          </span>
                        </td>

                        {/* BOOKINGS */}
                        <td className="px-5 py-5 font-semibold text-slate-700">
                          {customer.bookings ?? 0}
                        </td>

                        {/* ACTION */}
                        <td className="px-5 py-5">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedCustomerId(customer.id)
                            }
                            className="inline-flex items-center gap-2 rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                          >
                            <Eye size={15} />
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* CUSTOMER DETAILS MODAL */}
        {selectedCustomer && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
            onClick={() => setSelectedCustomerId(null)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="customer-details-title"
              className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-3">
                <h2
                  id="customer-details-title"
                  className="text-xl font-bold text-slate-800"
                >
                  Customer Details
                </h2>

                <button
                  type="button"
                  aria-label="Close customer details"
                  onClick={() => setSelectedCustomerId(null)}
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <p className="text-sm text-slate-500">Customer ID</p>
                  <p className="font-semibold text-slate-800">
                    #{selectedCustomer.id}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">Full Name</p>
                  <p className="font-semibold text-slate-800">
                    {selectedCustomer.name || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Email Address
                  </p>

                  <p className="break-all font-medium text-slate-800">
                    {selectedCustomer.email || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Phone Number
                  </p>

                  <p className="font-medium text-slate-800">
                    {selectedCustomer.phone || "N/A"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-blue-50 p-4">
                    <p className="text-sm text-slate-500">
                      Registered Vehicles
                    </p>

                    <p className="mt-1 text-2xl font-bold text-blue-700">
                      {selectedCustomer.vehicles ?? 0}
                    </p>
                  </div>

                  <div className="rounded-xl bg-orange-50 p-4">
                    <p className="text-sm text-slate-500">
                      Service Bookings
                    </p>

                    <p className="mt-1 text-2xl font-bold text-orange-700">
                      {selectedCustomer.bookings ?? 0}
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCustomerId(null)}
                className="mt-6 w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-slate-400">
          Customer information is loaded from the Spring Boot backend.
        </p>
      </div>
    </div>
  );
}
