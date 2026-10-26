
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  CalendarDays,
  Clock,
  Car,
  Wrench,
  RefreshCw,
  Plus,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

import { getAllBookings } from "../../services/bookingService";
import { getAllVehicles } from "../../services/vehicleService";

// Booking status colors
const statusStyles = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  APPROVED: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-purple-100 text-purple-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  REJECTED: "bg-red-100 text-red-700",
};

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load bookings and vehicles from backend
  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [bookingData, vehicleData] = await Promise.all([
        getAllBookings(),
        getAllVehicles(),
      ]);

      setBookings(
        Array.isArray(bookingData) ? bookingData : []
      );

      setVehicles(
        Array.isArray(vehicleData) ? vehicleData : []
      );

    } catch (err) {
      console.error("Failed to load bookings:", err);

      const message =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.message ||
        "Unknown error";

      setError(`Unable to load bookings: ${message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  // Find vehicle using vehicle ID
  const getVehicleName = (vehicleId) => {
    const vehicle = vehicles.find(
      (item) => Number(item.id) === Number(vehicleId)
    );

    if (!vehicle) {
      return `Vehicle #${vehicleId ?? "Unknown"}`;
    }

    return `${vehicle.make || ""} ${vehicle.model || ""} (${
      vehicle.registrationNumber || "No registration"
    })`;
  };

  // Format booking status
  const formatStatus = (status) => {
    return String(status || "PENDING")
      .replaceAll("_", " ");
  };

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6">

      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            My Service Bookings
          </h1>

          <p className="mt-2 text-slate-500">
            View your service bookings and track their status.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">

          <button
            type="button"
            onClick={loadBookings}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={18} />
            Refresh
          </button>

          <Link
            to="/customer/book-service"
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"
          >
            <Plus size={18} />
            Book Service
          </Link>

        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="rounded-2xl bg-white p-10 text-center">
          <RefreshCw
            size={30}
            className="mx-auto mb-4 animate-spin text-blue-600"
          />

          <p className="text-slate-500">
            Loading your service bookings...
          </p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center"
        >
          <AlertCircle
            size={36}
            className="mx-auto mb-4 text-red-500"
          />

          <h2 className="text-lg font-bold text-red-700">
            Unable to Load Bookings
          </h2>

          <p className="mt-2 text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={loadBookings}
            className="mt-5 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* No Bookings */}
      {!loading && !error && bookings.length === 0 && (
        <div className="rounded-3xl bg-white p-10 text-center shadow-sm">

          <Wrench
            size={45}
            className="mx-auto mb-4 text-slate-400"
          />

          <h2 className="text-xl font-bold text-slate-800">
            No Service Bookings Yet
          </h2>

          <p className="mt-2 text-slate-500">
            You have not booked any vehicle services yet.
          </p>

          <Link
            to="/customer/book-service"
            className="mt-6 inline-block rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Book Your First Service
          </Link>

        </div>
      )}

      {/* Booking List */}
      {!loading && !error && bookings.length > 0 && (
        <div className="space-y-5">

          {bookings.map((booking) => {
            const status = String(
              booking.status || "PENDING"
            ).toUpperCase();

            return (
              <div
                key={booking.id}
                className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
              >

                {/* Booking Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                  <div>
                    <p className="text-sm font-semibold text-blue-600">
                      Booking #{booking.id}
                    </p>

                    <h2 className="mt-1 text-xl font-bold text-slate-800">
                      {booking.serviceType || "Vehicle Service"}
                    </h2>
                  </div>

                  <span
                    className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${
                      statusStyles[status] ||
                      "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {formatStatus(status)}
                  </span>

                </div>

                {/* Booking Information */}
                <div className="mt-5 grid gap-5 border-t border-slate-100 pt-5 sm:grid-cols-2 lg:grid-cols-3">

                  <div className="flex items-center gap-3 text-slate-600">
                    <Car
                      size={20}
                      className="shrink-0 text-blue-500"
                    />

                    <span>
                      {getVehicleName(booking.vehicleId)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-slate-600">
                    <CalendarDays
                      size={20}
                      className="shrink-0 text-blue-500"
                    />

                    <span>
                      {booking.serviceDate || "Date unavailable"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-slate-600">
                    <Clock
                      size={20}
                      className="shrink-0 text-blue-500"
                    />

                    <span>
                      {booking.serviceTime || "Time unavailable"}
                    </span>
                  </div>

                </div>

                {/* View Details */}
                <div className="mt-5 flex justify-end border-t border-slate-100 pt-4">

                  <Link
                    to={`/customer/bookings/${booking.id}`}
                    className="inline-flex items-center gap-2 font-semibold text-blue-600 hover:text-blue-700"
                  >
                    View Details
                    <ArrowRight size={18} />
                  </Link>

                </div>

              </div>
            );
          })}

        </div>
      )}

    </div>
  );
}

export default MyBookings;
