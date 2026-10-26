
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  Users,
  Car,
  CalendarCheck,
  Wrench,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Search,
  UserCog,
  RefreshCw,
} from "lucide-react";

import {
  getAdminBookings,
  getAdminVehicles,
  getAdminAssignments,
} from "../../services/adminBookingService";

const statusStyles = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-indigo-100 text-indigo-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const formatStatus = (status) =>
  String(status || "UNKNOWN").replaceAll("_", " ");

const formatDate = (date) => {
  if (!date) return "N/A";

  const parsed = new Date(`${String(date).slice(0, 10)}T00:00:00`);

  return Number.isNaN(parsed.getTime())
    ? String(date)
    : parsed.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
};

function Dashboard() {
  const [bookings, setBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [assignments, setAssignments] = useState([]);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [bookingData, vehicleData, assignmentData] =
        await Promise.all([
          getAdminBookings(),
          getAdminVehicles(),
          getAdminAssignments(),
        ]);

      setBookings(Array.isArray(bookingData) ? bookingData : []);
      setVehicles(Array.isArray(vehicleData) ? vehicleData : []);
      setAssignments(
        Array.isArray(assignmentData) ? assignmentData : []
      );
    } catch (err) {
      console.error("Dashboard loading error:", err);

      if (
        err.response?.status === 401 ||
        err.response?.status === 403 ||
        err.message?.toLowerCase().includes("login")
      ) {
        setError(
          "Admin authentication failed. Please log in with an Admin account."
        );
      } else {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load dashboard data."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const getVehicle = (vehicleId) =>
    vehicles.find(
      (vehicle) => Number(vehicle.id) === Number(vehicleId)
    );

  const getAssignment = (bookingId) =>
    assignments.find(
      (assignment) =>
        Number(assignment.bookingId) === Number(bookingId)
    );

  const enrichedBookings = bookings.map((booking) => ({
    ...booking,
    vehicle: getVehicle(booking.vehicleId),
    assignment: getAssignment(booking.id),
  }));

  const filteredBookings = enrichedBookings.filter((booking) => {
    const vehicleName = booking.vehicle
      ? `${booking.vehicle.make || ""} ${booking.vehicle.model || ""}`
      : "";

    const searchText = [
      booking.id,
      booking.serviceType,
      booking.status,
      booking.vehicleId,
      vehicleName,
      booking.vehicle?.ownerName,
      booking.assignment?.technicianId,
    ]
      .join(" ")
      .toLowerCase();

    return (
      searchText.includes(search.toLowerCase().trim()) &&
      (filter === "All" || booking.status === filter)
    );
  });

  const countByStatus = (status) =>
    bookings.filter((booking) => booking.status === status).length;

  const stats = [
    {
      title: "Total Bookings",
      value: bookings.length,
      icon: CalendarCheck,
      color: "bg-blue-100 text-blue-600",
      detail: "All service requests",
    },
    {
      title: "Pending Requests",
      value: countByStatus("PENDING"),
      icon: Clock,
      color: "bg-amber-100 text-amber-600",
      detail: "Awaiting confirmation",
    },
    {
      title: "Confirmed Bookings",
      value: countByStatus("CONFIRMED"),
      icon: CheckCircle2,
      color: "bg-indigo-100 text-indigo-600",
      detail: "Approved service requests",
    },
    {
      title: "Active Services",
      value: countByStatus("IN_PROGRESS"),
      icon: Wrench,
      color: "bg-purple-100 text-purple-600",
      detail: "Currently in progress",
    },
    {
      title: "Completed Services",
      value: countByStatus("COMPLETED"),
      icon: CheckCircle2,
      color: "bg-green-100 text-green-600",
      detail: "Finished service jobs",
    },
    {
      title: "Assigned Jobs",
      value: assignments.length,
      icon: UserCog,
      color: "bg-emerald-100 text-emerald-600",
      detail: "Technician assignments",
    },
  ];

  const quickActions = [
    {
      title: "Manage Bookings",
      description: "Confirm and manage service requests.",
      path: "/admin/bookings",
      icon: CalendarCheck,
      color: "text-blue-600",
      action: "Open Bookings",
    },
    {
      title: "Assign Technician",
      description: "Assign confirmed bookings to technicians.",
      path: "/admin/assign-technician",
      icon: Wrench,
      color: "text-green-600",
      action: "Assign Jobs",
    },
    {
      title: "Customers",
      description: "View customer records.",
      path: "/admin/customers",
      icon: Users,
      color: "text-purple-600",
      action: "View Customers",
    },
    {
      title: "Technicians",
      description: "View and manage technicians.",
      path: "/admin/technicians",
      icon: UserCog,
      color: "text-indigo-600",
      action: "Manage Team",
    },
    {
      title: "Reports",
      description: "Review service reports.",
      path: "/admin/reports",
      icon: TrendingUp,
      color: "text-amber-600",
      action: "View Reports",
    },
    {
      title: "Vehicles",
      description: "View vehicle records.",
      path: "/admin/vehicles",
      icon: Car,
      color: "text-cyan-600",
      action: "View Vehicles",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-7">
      <div className="mx-auto max-w-7xl space-y-7">

        {/* HEADER */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              ADMINISTRATION
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-800">
              Admin Dashboard
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Manage service bookings and technician assignments.
            </p>
          </div>

          <button
            type="button"
            onClick={loadDashboard}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw size={18} />
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div
            role="alert"
            className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
          >
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* STATISTICS */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {stat.title}
                    </p>

                    <h2 className="mt-3 text-2xl font-bold text-slate-800">
                      {loading ? "..." : stat.value}
                    </h2>
                  </div>

                  <div className={`rounded-xl p-3 ${stat.color}`}>
                    <Icon size={23} />
                  </div>
                </div>

                <p className="mt-4 text-xs text-slate-500">
                  {stat.detail}
                </p>
              </div>
            );
          })}
        </div>

        {/* QUICK ACTIONS */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-800">
              Quick Actions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Common administration tasks
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <Link
                  key={action.title}
                  to={action.path}
                  className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-300 hover:shadow-md"
                >
                  <Icon className={action.color} size={27} />

                  <h3 className="mt-4 font-bold text-slate-800">
                    {action.title}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {action.description}
                  </p>

                  <span className="mt-4 flex items-center gap-2 text-sm font-semibold text-blue-600">
                    {action.action}
                    <ArrowRight size={16} />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* BOOKINGS TABLE */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 p-5">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Recent Service Bookings
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Live booking records from Spring Boot.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3 top-3 text-slate-400"
                  />

                  <input
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Search bookings..."
                    className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 sm:w-64"
                  />
                </div>

                <select
                  value={filter}
                  onChange={(event) =>
                    setFilter(event.target.value)
                  }
                  className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
                >
                  <option value="All">All</option>
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-4">Booking</th>
                  <th className="px-5 py-4">Customer / Vehicle</th>
                  <th className="px-5 py-4">Service</th>
                  <th className="px-5 py-4">Technician</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {!loading &&
                  filteredBookings.map((booking) => {
                    const vehicle = booking.vehicle;
                    const assignment = booking.assignment;

                    const vehicleName = vehicle
                      ? `${vehicle.make || ""} ${vehicle.model || ""}`.trim()
                      : `Vehicle #${booking.vehicleId}`;

                    return (
                      <tr
                        key={booking.id}
                        className="hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-800">
                            #{booking.id}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-800">
                            {vehicle?.ownerName || "Customer not available"}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {vehicleName}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {booking.serviceType}
                        </td>

                        <td className="px-5 py-4">
                          {assignment ? (
                            <span className="font-semibold text-green-700">
                              Technician #{assignment.technicianId}
                            </span>
                          ) : (
                            <span className="text-amber-600">
                              Unassigned
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {formatDate(booking.serviceDate)}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold ${
                              statusStyles[booking.status] ||
                              "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {formatStatus(booking.status)}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          {booking.status === "CONFIRMED" &&
                          !assignment ? (
                            <Link
                              to="/admin/assign-technician"
                              className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                            >
                              Assign Technician
                            </Link>
                          ) : assignment ? (
                            <span className="text-xs font-semibold text-green-700">
                              Assigned
                            </span>
                          ) : (
                            <Link
                              to="/admin/bookings"
                              className="text-xs font-semibold text-blue-600 hover:underline"
                            >
                              Manage Booking
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                {!loading && filteredBookings.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-12 text-center text-slate-500"
                    >
                      <AlertCircle
                        size={28}
                        className="mx-auto mb-2 text-slate-400"
                      />
                      No bookings found.
                    </td>
                  </tr>
                )}

                {loading && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-12 text-center text-slate-500"
                    >
                      Loading bookings...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-200 px-5 py-4 text-xs text-slate-500">
            Booking and assignment data is fetched from Spring Boot
            and MySQL. Use Refresh to reload the latest records.
          </div>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
