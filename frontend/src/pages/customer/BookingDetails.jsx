
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Car,
  Wrench,
  FileText,
  Truck,
  ClipboardList,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Receipt,
  History,
} from "lucide-react";

import { getBookingById } from "../../services/bookingService";
import { getAllVehicles } from "../../services/vehicleService";

// ======================================
// BOOKING DETAIL ITEM
// ======================================
function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        <Icon size={20} />
      </div>

      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-1 font-semibold text-slate-800">
          {value !== undefined && value !== null && value !== ""
            ? value
            : "Not available"}
        </p>
      </div>
    </div>
  );
}

// ======================================
// STATUS COLOR
// ======================================
function getStatusColor(status) {
  switch (String(status || "").toUpperCase()) {
    case "PENDING":
      return "bg-amber-100 text-amber-700";

    case "CONFIRMED":
    case "APPROVED":
      return "bg-blue-100 text-blue-700";

    case "IN_PROGRESS":
      return "bg-purple-100 text-purple-700";

    case "COMPLETED":
      return "bg-green-100 text-green-700";

    case "CANCELLED":
    case "REJECTED":
      return "bg-red-100 text-red-700";

    default:
      return "bg-slate-100 text-slate-700";
  }
}

// ======================================
// BOOKING DETAILS
// ======================================
export default function BookingDetails() {
  const { id } = useParams();

  const [booking, setBooking] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDetails() {
      try {
        setLoading(true);
        setError("");
        setBooking(null);
        setVehicle(null);

        const [bookingData, vehicleData] = await Promise.all([
          getBookingById(id),
          getAllVehicles(),
        ]);

        if (!active) return;

        setBooking(bookingData);

        const matchedVehicle = Array.isArray(vehicleData)
          ? vehicleData.find(
              (item) =>
                Number(item.id) === Number(bookingData.vehicleId)
            )
          : null;

        setVehicle(matchedVehicle || null);
      } catch (err) {
        console.error("Booking details error:", err);

        if (active) {
          setError(
            err.response?.status === 404
              ? "Booking not found."
              : "Unable to load booking details. Please check your backend."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadDetails();

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center text-slate-500">
        Loading booking details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <AlertCircle
            size={40}
            className="mx-auto text-red-500"
          />

          <h2 className="mt-4 text-xl font-bold text-red-700">
            {error}
          </h2>

          <Link
            to="/customer/bookings"
            className="mt-5 inline-block rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white"
          >
            Back to My Bookings
          </Link>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center text-slate-500">
        Booking details are unavailable.
      </div>
    );
  }

  const bookingId = booking.id || id;

  const bookingStatus = String(
    booking.status || "PENDING"
  ).toUpperCase();

  const isCompleted = bookingStatus === "COMPLETED";

  return (
    <div className="mx-auto max-w-5xl">
      {/* ======================================
          BACK NAVIGATION
      ====================================== */}
      <Link
        to="/customer/bookings"
        className="mb-5 inline-flex items-center gap-2 font-semibold text-blue-600 hover:text-blue-700"
      >
        <ArrowLeft size={18} />
        Back to My Bookings
      </Link>

      {/* ======================================
          HEADER
      ====================================== */}
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Booking Details
          </h1>

          <p className="mt-2 text-slate-500">
            Service Request #{bookingId}
          </p>
        </div>

        <span
          className={`w-fit rounded-full px-5 py-2 text-sm font-bold ${getStatusColor(
            bookingStatus
          )}`}
        >
          {bookingStatus}
        </span>
      </div>

      {/* ======================================
          SERVICE INFORMATION
      ====================================== */}
      <div className="mb-6 rounded-3xl bg-white p-6 shadow-sm md:p-8">
        <div className="mb-6 flex items-center gap-3">
          <ClipboardList
            className="text-blue-600"
            size={25}
          />

          <h2 className="text-xl font-bold text-slate-800">
            Service Information
          </h2>
        </div>

        <div className="grid gap-7 sm:grid-cols-2">
          <DetailItem
            icon={Wrench}
            label="Service Type"
            value={booking.serviceType}
          />

          <DetailItem
            icon={CalendarDays}
            label="Preferred Service Date"
            value={booking.serviceDate}
          />

          <DetailItem
            icon={Clock}
            label="Preferred Time"
            value={booking.serviceTime}
          />

          <DetailItem
            icon={Truck}
            label="Pickup & Drop"
            value={
              booking.pickupDrop === "YES"
                ? "Pickup & Drop Requested"
                : "Customer Will Bring Vehicle"
            }
          />
        </div>
      </div>

      {/* ======================================
          VEHICLE INFORMATION
      ====================================== */}
      <div className="mb-6 rounded-3xl bg-white p-6 shadow-sm md:p-8">
        <div className="mb-6 flex items-center gap-3">
          <Car
            size={25}
            className="text-blue-600"
          />

          <h2 className="text-xl font-bold text-slate-800">
            Vehicle Information
          </h2>
        </div>

        {vehicle ? (
          <div className="grid gap-7 sm:grid-cols-2">
            <DetailItem
              icon={Car}
              label="Vehicle"
              value={`${vehicle.make || ""} ${
                vehicle.model || ""
              }`.trim()}
            />

            <DetailItem
              icon={FileText}
              label="Registration Number"
              value={vehicle.registrationNumber}
            />

            <DetailItem
              icon={CalendarDays}
              label="Manufacturing Year"
              value={vehicle.year}
            />

            <DetailItem
              icon={Wrench}
              label="Fuel Type"
              value={vehicle.fuelType}
            />
          </div>
        ) : (
          <p className="text-slate-500">
            Vehicle #{booking.vehicleId} — additional vehicle
            information is unavailable.
          </p>
        )}
      </div>

      {/* ======================================
          PROBLEM DESCRIPTION
      ====================================== */}
      <div className="mb-6 rounded-3xl bg-white p-6 shadow-sm md:p-8">
        <div className="mb-5 flex items-center gap-3">
          <FileText
            size={25}
            className="text-blue-600"
          />

          <h2 className="text-xl font-bold text-slate-800">
            Problem Description
          </h2>
        </div>

        <p className="whitespace-pre-wrap leading-7 text-slate-600">
          {booking.problemDescription ||
            "No problem description provided."}
        </p>
      </div>

      {/* ======================================
          SERVICE STATUS
      ====================================== */}
      <div className="mb-6 rounded-3xl border border-blue-100 bg-blue-50 p-6 md:p-8">
        <div className="flex items-start gap-4">
          {isCompleted ? (
            <CheckCircle2
              size={28}
              className="shrink-0 text-green-600"
            />
          ) : (
            <RefreshCw
              size={28}
              className="shrink-0 text-blue-600"
            />
          )}

          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Current Service Status
            </h2>

            <p className="mt-2 font-semibold text-blue-700">
              {bookingStatus}
            </p>

            <p className="mt-2 leading-6 text-slate-600">
              {bookingStatus === "PENDING"
                ? "Your request has been received and is waiting for review."
                : isCompleted
                ? "Your vehicle service has been completed."
                : "Your booking status has been updated by the service team."}
            </p>
          </div>
        </div>
      </div>

      {/* ======================================
          ACTION BUTTONS
      ====================================== */}
      <div className="flex flex-col flex-wrap gap-3 sm:flex-row">
        <Link
          to="/customer/bookings"
          className="rounded-xl bg-blue-600 px-6 py-3 text-center font-semibold text-white hover:bg-blue-700"
        >
          My Bookings
        </Link>

        <Link
          to="/customer"
          className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-center font-semibold text-slate-700 hover:bg-slate-50"
        >
          Customer Dashboard
        </Link>

        {/* View Invoice for completed bookings */}
        {isCompleted && (
          <Link
            to={`/customer/invoice/${bookingId}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-center font-semibold text-white hover:bg-green-700"
          >
            <Receipt size={18} />
            View Invoice
          </Link>
        )}

        {/* View Service History for completed bookings */}
        {isCompleted && (
          <Link
            to={`/customer/service-history?bookingId=${bookingId}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-300 bg-blue-50 px-6 py-3 text-center font-semibold text-blue-700 hover:bg-blue-100"
          >
            <History size={18} />
            View Service History
          </Link>
        )}
      </div>
    </div>
  );
}
