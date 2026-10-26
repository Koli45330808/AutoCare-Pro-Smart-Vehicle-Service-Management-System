
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  Wrench,
  UserRoundCog,
  CalendarCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Loader2,
  ArrowLeft,
} from "lucide-react";

import {
  getAdminBookings,
  getAdminAssignments,
  assignAdminTechnician,
} from "../../services/adminBookingService";

import { getTechnicians } from "../../services/adminTechnicianService";

// ================= HELPERS =================

function getErrorMessage(error) {
  const data = error?.response?.data;
  const status = error?.response?.status || error?.status;

  if (status === 401) {
    return "Admin session expired. Please log in again.";
  }

  if (status === 403) {
    return "You do not have permission to assign technicians.";
  }

  if (status === 409) {
    return (
      data?.detail ||
      data?.message ||
      "Booking is already assigned or is not eligible."
    );
  }

  return (
    (typeof data === "string" && data.trim()) ||
    data?.detail ||
    data?.message ||
    data?.error ||
    error?.message ||
    "Request failed. Please try again."
  );
}

function validId(value) {
  if (
    value === "" ||
    value === null ||
    value === undefined
  ) {
    return false;
  }

  const number = Number(value);

  return Number.isSafeInteger(number) && number > 0;
}

function normalize(value) {
  return String(value ?? "").trim().toUpperCase();
}

function asArray(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (Array.isArray(value?.content)) {
    return value.content;
  }

  if (Array.isArray(value?.data)) {
    return value.data;
  }

  return [];
}

function formatDateTime(value) {
  if (!value) return "N/A";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleString("en-IN");
}

// ================= MAIN COMPONENT =================

export default function AssignTechnician() {
  const [bookings, setBookings] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [technicians, setTechnicians] = useState([]);

  const [selectedBooking, setSelectedBooking] = useState("");
  const [technicianId, setTechnicianId] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ================= LOAD DATA =================

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [
        bookingData,
        assignmentData,
        technicianData,
      ] = await Promise.all([
        getAdminBookings(),
        getAdminAssignments(),
        getTechnicians(),
      ]);

      const bookingList = asArray(bookingData);
      const assignmentList = asArray(assignmentData);
      const technicianList = asArray(technicianData);

      setBookings(bookingList);
      setAssignments(assignmentList);
      setTechnicians(technicianList);

      console.log("Admin bookings:", bookingList);
      console.log("Admin assignments:", assignmentList);
      console.log("Admin technicians:", technicianList);

      return true;
    } catch (err) {
      console.error("Failed to load assignment data:", err);

      setError(getErrorMessage(err));
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ================= APPROVED TECHNICIANS =================

  // FIX: Do not require the role field.
  // The technician API may return a profile without role.

  const approvedTechnicians = useMemo(() => {
    return technicians.filter((technician) => {
      const status = normalize(
        technician.approvalStatus ?? technician.status
      );

      return (
        status === "APPROVED" &&
        validId(technician.id)
      );
    });
  }, [technicians]);

  // ================= ASSIGNED BOOKING IDS =================

  const assignedBookingIds = useMemo(() => {
    return new Set(
      assignments
        .map(
          (assignment) =>
            assignment.bookingId ??
            assignment.booking?.id
        )
        .filter(validId)
        .map(Number)
    );
  }, [assignments]);

  // ================= AVAILABLE BOOKINGS =================

  const availableBookings = useMemo(() => {
    return bookings.filter(
      (booking) =>
        validId(booking.id) &&
        normalize(booking.status) === "CONFIRMED" &&
        !assignedBookingIds.has(Number(booking.id))
    );
  }, [bookings, assignedBookingIds]);

  // ================= ASSIGN TECHNICIAN =================

  async function handleAssign(event) {
    event.preventDefault();

    if (saving || loading) return;

    setError("");
    setSuccess("");

    if (
      !validId(selectedBooking) ||
      !validId(technicianId)
    ) {
      setError("Please select a valid booking and technician.");
      return;
    }

    const selectedBookingData = availableBookings.find(
      (booking) =>
        Number(booking.id) === Number(selectedBooking)
    );

    if (!selectedBookingData) {
      setError("Select an unassigned confirmed booking.");
      return;
    }

    const selectedTechnicianData = approvedTechnicians.find(
      (technician) =>
        Number(technician.id) === Number(technicianId)
    );

    if (!selectedTechnicianData) {
      setError("Please select an approved technician.");
      return;
    }

    const bookingId = Number(selectedBooking);
    const selectedTechnicianId = Number(technicianId);

    const technicianName =
      selectedTechnicianData.name ||
      `Technician #${selectedTechnicianId}`;

    const confirmed = window.confirm(
      `Assign ${technicianName} to Booking #${bookingId}?`
    );

    if (!confirmed) return;

    try {
      setSaving(true);

      await assignAdminTechnician(
        bookingId,
        selectedTechnicianId
      );

      setSelectedBooking("");
      setTechnicianId("");

      setSuccess(
        `Technician assigned successfully to Booking #${bookingId}.`
      );

      await loadData();
    } catch (err) {
      console.error("Assignment failed:", err);
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  // ================= UI =================

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
              Assign Technician
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Assign approved technicians to confirmed customer bookings.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setSuccess("");
              loadData();
            }}
            disabled={loading || saving}
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
            <AlertCircle size={20} className="shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* SUCCESS */}
        {success && (
          <div
            role="status"
            className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700"
          >
            <CheckCircle2 size={20} />
            <p>{success}</p>
          </div>
        )}

        {/* STATISTICS */}
        <div className="grid gap-4 sm:grid-cols-3">

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <CalendarCheck
              size={24}
              className="text-blue-600"
            />

            <p className="mt-3 text-sm text-slate-500">
              Available Bookings
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              {loading ? "..." : availableBookings.length}
            </h2>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <UserRoundCog
              size={24}
              className="text-green-600"
            />

            <p className="mt-3 text-sm text-slate-500">
              Approved Technicians
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              {loading ? "..." : approvedTechnicians.length}
            </h2>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <Wrench
              size={24}
              className="text-purple-600"
            />

            <p className="mt-3 text-sm text-slate-500">
              Total Assignments
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              {loading ? "..." : assignments.length}
            </h2>
          </div>
        </div>

        {/* ASSIGNMENT FORM */}
        <form
          onSubmit={handleAssign}
          className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-xl font-bold text-slate-800">
            New Technician Assignment
          </h2>

          <div className="grid gap-5 md:grid-cols-2">

            {/* BOOKING SELECT */}
            <div>
              <label
                htmlFor="booking-select"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Confirmed Booking *
              </label>

              <select
                id="booking-select"
                required
                disabled={
                  loading ||
                  saving ||
                  availableBookings.length === 0
                }
                value={selectedBooking}
                onChange={(event) => {
                  setSelectedBooking(event.target.value);
                  setError("");
                }}
                className="w-full rounded-xl border border-slate-300 bg-white p-3 outline-none focus:border-blue-500"
              >
                <option value="">Select Booking</option>

                {availableBookings.map((booking) => (
                  <option
                    key={booking.id}
                    value={String(booking.id)}
                  >
                    Booking #{booking.id} -{" "}
                    {booking.serviceType || "Vehicle Service"}
                  </option>
                ))}
              </select>
            </div>

            {/* TECHNICIAN SELECT */}
            <div>
              <label
                htmlFor="technician-select"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Approved Technician *
              </label>

              <select
                id="technician-select"
                required
                disabled={
                  loading ||
                  saving ||
                  approvedTechnicians.length === 0
                }
                value={technicianId}
                onChange={(event) => {
                  setTechnicianId(event.target.value);
                  setError("");
                }}
                className="w-full rounded-xl border border-slate-300 bg-white p-3 outline-none focus:border-blue-500"
              >
                <option value="">Select Technician</option>

                {approvedTechnicians.map((technician) => (
                  <option
                    key={technician.id}
                    value={String(technician.id)}
                  >
                    {technician.name ||
                      `Technician #${technician.id}`}
                    {" - "}
                    {technician.specialization || "General"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={
              loading ||
              saving ||
              !validId(selectedBooking) ||
              !validId(technicianId) ||
              availableBookings.length === 0 ||
              approvedTechnicians.length === 0
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Wrench size={18} />
            )}

            {saving ? "Assigning..." : "Assign Technician"}
          </button>

          {/* EMPTY STATES */}
          {!loading && !error && availableBookings.length === 0 && (
            <p className="text-sm text-amber-700">
              No unassigned confirmed bookings are available.
              Confirm a pending booking first.
            </p>
          )}

          {!loading && !error && approvedTechnicians.length === 0 && (
            <p className="text-sm text-amber-700">
              No approved technicians are available.
              Check technician approval status in Admin Technicians.
            </p>
          )}
        </form>

        {/* EXISTING ASSIGNMENTS */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-bold text-slate-800">
            Existing Assignments
          </h2>

          {loading ? (
            <div className="flex items-center gap-3 py-8 text-slate-600">
              <Loader2 size={22} className="animate-spin" />
              Loading assignments...
            </div>
          ) : assignments.length === 0 ? (
            <p className="py-6 text-slate-500">
              No technician assignments found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="p-4">Assignment</th>
                    <th className="p-4">Booking</th>
                    <th className="p-4">Technician</th>
                    <th className="p-4">Assigned At</th>
                  </tr>
                </thead>

                <tbody>
                  {assignments.map((assignment) => {
                    const bookingId =
                      assignment.bookingId ??
                      assignment.booking?.id;

                    const techId =
                      assignment.technicianId ??
                      assignment.technician?.id;

                    const technician = technicians.find(
                      (item) =>
                        Number(item.id) === Number(techId)
                    );

                    return (
                      <tr
                        key={assignment.id}
                        className="border-t border-slate-100 hover:bg-slate-50"
                      >
                        <td className="p-4 font-semibold">
                          #{assignment.id}
                        </td>

                        <td className="p-4">
                          #{bookingId ?? "N/A"}
                        </td>

                        <td className="p-4">
                          {technician?.name ||
                            `Technician #${techId ?? "N/A"}`}
                        </td>

                        <td className="p-4">
                          {formatDateTime(assignment.assignedAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* BACK LINK */}
        <Link
          to="/admin/bookings"
          className="inline-flex items-center gap-2 font-semibold text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft size={18} />
          Back to Manage Bookings
        </Link>
      </div>
    </div>
  );
}
