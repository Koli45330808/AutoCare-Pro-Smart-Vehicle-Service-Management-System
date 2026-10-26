
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  CalendarCheck,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Car,
  Clock,
  Wrench,
  ArrowRight,
  Loader2,
} from "lucide-react";

import {
  getAdminBookings,
  getAdminVehicles,
  confirmAdminBooking,
} from "../../services/adminBookingService";

// ==========================================
// CONSTANTS
// ==========================================

const BOOKING_STATUSES = [
  "ALL",
  "PENDING",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
  "REJECTED",
  "CANCELLED",
];

const statusColors = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-indigo-100 text-indigo-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  CANCELLED: "bg-red-100 text-red-700",
};

function formatStatus(status) {
  return String(status || "UNKNOWN").replaceAll("_", " ");
}

function getErrorMessage(error) {
  const data = error?.response?.data;

  return (
    (typeof data === "string" && data.trim()) ||
    data?.detail ||
    data?.message ||
    data?.error ||
    error?.message ||
    "Request failed."
  );
}

function formatDate(date) {
  if (!date) return "N/A";

  const datePart = String(date).slice(0, 10);
  const parsed = new Date(`${datePart}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return String(date);
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ==========================================
// ADMIN MANAGE BOOKINGS
// ==========================================

export default function ManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================
  // LOAD DATA
  // ==========================================

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setWarning("");

      const [bookingResult, vehicleResult] =
        await Promise.allSettled([
          getAdminBookings(),
          getAdminVehicles(),
        ]);

      if (bookingResult.status === "fulfilled") {
        setBookings(
          Array.isArray(bookingResult.value)
            ? bookingResult.value
            : []
        );
      } else {
        setBookings([]);
        setError(
          getErrorMessage(bookingResult.reason)
        );
      }

      if (vehicleResult.status === "fulfilled") {
        setVehicles(
          Array.isArray(vehicleResult.value)
            ? vehicleResult.value
            : []
        );
      } else {
        setVehicles([]);

        setWarning(
          "Vehicle details could not be loaded. Booking records may still be available."
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ==========================================
  // VEHICLE DETAILS
  // ==========================================

  function getVehicleName(vehicleId) {
    const vehicle = vehicles.find(
      (item) =>
        Number(item.id) === Number(vehicleId)
    );

    if (!vehicle) {
      return `Vehicle #${vehicleId ?? "N/A"}`;
    }

    const name = [
      vehicle.make,
      vehicle.model,
    ]
      .filter(Boolean)
      .join(" ");

    return `${name || "Vehicle"} (${
      vehicle.registrationNumber || "N/A"
    })`;
  }

  // ==========================================
  // CONFIRM BOOKING
  // ==========================================

  async function confirmBooking(bookingId) {
    if (updatingId !== null) return;

    const booking = bookings.find(
      (item) =>
        Number(item.id) === Number(bookingId)
    );

    if (!booking || booking.status !== "PENDING") {
      setError(
        "Only pending bookings can be confirmed."
      );
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to confirm Booking #${bookingId}?`
    );

    if (!confirmed) return;

    try {
      setUpdatingId(bookingId);
      setError("");
      setWarning("");
      setSuccess("");

      await confirmAdminBooking(bookingId);

      setBookings((previous) =>
        previous.map((item) =>
          Number(item.id) === Number(bookingId)
            ? { ...item, status: "CONFIRMED" }
            : item
        )
      );

      setSuccess(
        `Booking #${bookingId} confirmed successfully.`
      );

      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUpdatingId(null);
    }
  }

  // ==========================================
  // FILTER BOOKINGS
  // ==========================================

  const filteredBookings = bookings.filter(
    (booking) => {
      const vehicleName = getVehicleName(
        booking.vehicleId
      );

      const searchableText = [
        booking.id,
        booking.serviceType,
        booking.status,
        booking.vehicleId,
        vehicleName,
        booking.problemDescription,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchableText.includes(
        search.trim().toLowerCase()
      );

      const matchesFilter =
        filter === "ALL" ||
        booking.status === filter;

      return matchesSearch && matchesFilter;
    }
  );

  const totalBookings = bookings.length;

  const pendingBookings = bookings.filter(
    (booking) => booking.status === "PENDING"
  ).length;

  const confirmedBookings = bookings.filter(
    (booking) => booking.status === "CONFIRMED"
  ).length;

  const completedBookings = bookings.filter(
    (booking) => booking.status === "COMPLETED"
  ).length;

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
              Manage Bookings
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Review customer service requests and confirm
              pending bookings.
            </p>
          </div>

          <button
            type="button"
            onClick={loadData}
            disabled={loading || updatingId !== null}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw
              size={18}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
          >
            <AlertCircle
              size={20}
              className="shrink-0"
            />
            <p>{error}</p>
          </div>
        )}

        {/* WARNING */}
        {warning && (
          <div
            role="status"
            className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800"
          >
            {warning}
          </div>
        )}

        {/* SUCCESS */}
        {success && (
          <div
            role="status"
            className="flex items-center gap-3 rounded-xl bg-green-50 p-4 text-green-700"
          >
            <CheckCircle2 size={20} />
            <p>{success}</p>
          </div>
        )}

        {/* STATISTICS */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Total Bookings",
              value: totalBookings,
              icon: CalendarCheck,
              color: "text-blue-600",
            },
            {
              label: "Pending",
              value: pendingBookings,
              icon: Clock,
              color: "text-amber-600",
            },
            {
              label: "Confirmed",
              value: confirmedBookings,
              icon: CheckCircle2,
              color: "text-indigo-600",
            },
            {
              label: "Completed",
              value: completedBookings,
              icon: Wrench,
              color: "text-green-600",
            },
          ].map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <Icon
                  size={24}
                  className={stat.color}
                />

                <p className="mt-3 text-sm text-slate-500">
                  {stat.label}
                </p>

                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  {loading ? "..." : stat.value}
                </h2>
              </div>
            );
          })}
        </div>

        {/* FILTERS */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search booking ID, vehicle, service..."
            className="mb-4 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
          />

          <div className="flex flex-wrap gap-2">
            {BOOKING_STATUSES.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFilter(status)}
                className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors sm:text-sm ${
                  filter === status
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {formatStatus(status)}
              </button>
            ))}
          </div>
        </div>

        {/* BOOKINGS */}
        {loading ? (
          <div className="flex items-center justify-center gap-3 rounded-2xl bg-white p-10 text-slate-600">
            <Loader2
              size={22}
              className="animate-spin"
            />
            Loading bookings...
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center text-slate-500">
            <CalendarCheck
              size={36}
              className="mx-auto mb-3 text-slate-300"
            />
            No bookings found.
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Booking #{booking.id}
                    </h2>

                    <p className="mt-1 text-sm text-slate-600">
                      {booking.serviceType ||
                        "Vehicle Service"}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                      statusColors[booking.status] ||
                      "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {formatStatus(booking.status)}
                  </span>
                </div>

                <div className="mt-5 grid gap-4 text-sm sm:grid-cols-2 xl:grid-cols-4">

                  <div className="flex items-start gap-2">
                    <Car
                      size={18}
                      className="text-blue-600"
                    />
                    <div>
                      <p className="text-xs text-slate-500">
                        Vehicle
                      </p>
                      <p className="font-medium">
                        {getVehicleName(
                          booking.vehicleId
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <CalendarCheck
                      size={18}
                      className="text-indigo-600"
                    />
                    <div>
                      <p className="text-xs text-slate-500">
                        Service Date
                      </p>
                      <p className="font-medium">
                        {formatDate(
                          booking.serviceDate
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Clock
                      size={18}
                      className="text-amber-600"
                    />
                    <div>
                      <p className="text-xs text-slate-500">
                        Service Time
                      </p>
                      <p className="font-medium">
                        {booking.serviceTime ||
                          "N/A"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Pickup / Drop
                    </p>
                    <p className="font-medium">
                      {booking.pickupDrop ||
                        "N/A"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold text-slate-500">
                    Problem Description
                  </p>

                  <p className="mt-2 text-sm text-slate-700">
                    {booking.problemDescription ||
                      "No description provided."}
                  </p>
                </div>

                {/* ACTIONS */}
                <div className="mt-5 flex flex-wrap gap-3">

                  {booking.status === "PENDING" && (
                    <button
                      type="button"
                      onClick={() =>
                        confirmBooking(booking.id)
                      }
                      disabled={updatingId !== null}
                      className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      {updatingId === booking.id ? (
                        <Loader2
                          size={17}
                          className="animate-spin"
                        />
                      ) : (
                        <CheckCircle2 size={17} />
                      )}

                      {updatingId === booking.id
                        ? "Confirming..."
                        : "Confirm Booking"}
                    </button>
                  )}

                  {booking.status === "CONFIRMED" && (
                    <Link
                      to="/admin/assign-technician"
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                      Assign Technician
                      <ArrowRight size={17} />
                    </Link>
                  )}

                  {booking.status === "COMPLETED" && (
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-green-700">
                      <CheckCircle2 size={17} />
                      Service Completed
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
