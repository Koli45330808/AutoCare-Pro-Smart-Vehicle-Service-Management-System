
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  ArrowLeft,
  Car,
  ClipboardList,
  Wrench,
  Play,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Clock,
} from "lucide-react";

import {
  getTechnicianJobDetails,
  updateTechnicianJobStatus,
} from "../../services/technicianService";

// ================= HELPERS =================

function getErrorMessage(error) {
  const status =
    error?.response?.status ?? error?.status;

  const data = error?.response?.data;

  if (status === 401) {
    return "Technician session expired. Please log in again.";
  }

  if (status === 403) {
    return "Technician access denied.";
  }

  if (status === 404) {
    return (
      "Job not found or not assigned to your account. " +
      "Open a job from your Assigned Jobs list."
    );
  }

  if (status === 409) {
    return (
      data?.detail ||
      data?.message ||
      "This job cannot be started in its current status."
    );
  }

  return (
    data?.detail ||
    data?.message ||
    error?.message ||
    "Unable to load job details."
  );
}

function getStatusColor(status) {
  switch (status) {
    case "CONFIRMED":
      return "bg-amber-100 text-amber-700";

    case "IN_PROGRESS":
      return "bg-blue-100 text-blue-700";

    case "COMPLETED":
      return "bg-green-100 text-green-700";

    case "CANCELLED":
      return "bg-red-100 text-red-700";

    default:
      return "bg-slate-100 text-slate-700";
  }
}

// ================= COMPONENT =================

export default function JobDetails() {
  // URL ID must be assignmentId
  const { id } = useParams();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // ================= LOAD JOB =================

  useEffect(() => {
    let active = true;

    async function loadJob() {
      setLoading(true);
      setError("");
      setMessage("");
      setJob(null);

      try {
        if (
          !Number.isSafeInteger(Number(id)) ||
          Number(id) <= 0
        ) {
          throw new Error("Invalid assignment ID.");
        }

        const data = await getTechnicianJobDetails(id);

        if (!active) return;

        if (
          !data ||
          Number(data.assignmentId) !== Number(id)
        ) {
          throw new Error(
            "The server returned an unexpected job."
          );
        }

        setJob(data);
      } catch (err) {
        if (active) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadJob();

    return () => {
      active = false;
    };
  }, [id]);

  // ================= REFRESH JOB =================

  async function refreshJob() {
    if (loading || updating) return;

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const data = await getTechnicianJobDetails(id);

      if (
        !data ||
        Number(data.assignmentId) !== Number(id)
      ) {
        throw new Error(
          "The server returned an unexpected job."
        );
      }

      setJob(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  // ================= START SERVICE =================

  async function handleStartService() {
    if (
      !job ||
      job.status !== "CONFIRMED" ||
      updating
    ) {
      return;
    }

    const confirmed = window.confirm(
      `Start service for Booking #${job.bookingId}?`
    );

    if (!confirmed) return;

    try {
      setUpdating(true);
      setError("");
      setMessage("");

      // IMPORTANT: Backend requires assignmentId
      const updated = await updateTechnicianJobStatus(
        job.assignmentId,
        "IN_PROGRESS"
      );

      setJob(updated);

      setMessage(
        "Service started successfully. You can now inspect the vehicle."
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUpdating(false);
    }
  }

  // ================= LOADING =================

  if (loading && !job) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-3 bg-slate-100">
        <Loader2
          size={24}
          className="animate-spin text-emerald-600"
        />

        <p className="text-slate-600">
          Loading job details...
        </p>
      </div>
    );
  }

  // ================= JOB NOT FOUND =================

  if (!job) {
    return (
      <div className="min-h-screen bg-slate-100 p-6">
        <div className="mx-auto max-w-3xl space-y-5 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-start gap-3 text-red-600">
            <AlertCircle size={24} />

            <div>
              <h2 className="text-xl font-bold">
                Unable to Open Job
              </h2>

              <p className="mt-2">
                {error || "Job not found."}
              </p>
            </div>
          </div>

          <p className="text-sm text-slate-500">
            Requested assignment ID: {id}
          </p>

          <Link
            to="/technician/jobs"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700"
          >
            <ArrowLeft size={18} />
            Back to Assigned Jobs
          </Link>
        </div>
      </div>
    );
  }

  // ================= JOB STATE =================

  const canStart = job.status === "CONFIRMED";
  const isInProgress = job.status === "IN_PROGRESS";
  const isCompleted = job.status === "COMPLETED";

  const details = [
    ["Assignment ID", job.assignmentId],
    ["Booking ID", job.bookingId],
    [
      "Vehicle",
      `${job.vehicleMake || ""} ${job.vehicleModel || ""}`.trim(),
    ],
    ["Registration Number", job.registrationNumber],
    ["Service Type", job.serviceType],
    ["Service Date", job.serviceDate],
    ["Service Time", job.serviceTime],
    ["Status", job.status],
  ];

  // ================= UI =================

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="mx-auto max-w-5xl space-y-6">

        {/* BACK */}
        <Link
          to="/technician/jobs"
          className="inline-flex items-center gap-2 font-semibold text-emerald-600 hover:underline"
        >
          <ArrowLeft size={18} />
          Back to Assigned Jobs
        </Link>

        {/* HEADER */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">

            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-emerald-50 p-4 text-emerald-600">
                <Car size={28} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {job.vehicleMake} {job.vehicleModel}
                </h1>

                <p className="mt-1 text-slate-500">
                  {job.registrationNumber || "N/A"}
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Job #{job.assignmentId} | Booking #{job.bookingId}
                </p>
              </div>
            </div>

            <span
              className={`rounded-full px-4 py-2 text-sm font-bold ${getStatusColor(
                job.status
              )}`}
            >
              {job.status?.replaceAll("_", " ") || "UNKNOWN"}
            </span>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
          >
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        {/* SUCCESS */}
        {message && (
          <div
            role="status"
            className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700"
          >
            <CheckCircle2 size={20} />
            <p>{message}</p>
          </div>
        )}

        {/* JOB INFORMATION */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <ClipboardList className="text-emerald-600" />

            <h2 className="text-xl font-bold text-slate-900">
              Job Information
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {details.map(([label, value]) => (
              <div
                key={label}
                className="rounded-xl border border-slate-200 p-4"
              >
                <p className="text-sm text-slate-500">
                  {label}
                </p>

                <p className="mt-2 font-semibold text-slate-900">
                  {value || "N/A"}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CUSTOMER PROBLEM */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">
            Customer Problem Description
          </h2>

          <p className="mt-4 whitespace-pre-wrap text-slate-600">
            {job.problemDescription ||
              "No problem description provided."}
          </p>
        </div>

        {/* SCHEDULE */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-slate-900">
            Service Schedule
          </h2>

          <div className="flex flex-wrap gap-6 text-slate-600">
            <div className="flex items-center gap-2">
              <Calendar
                size={20}
                className="text-emerald-600"
              />

              <span>{job.serviceDate || "N/A"}</span>
            </div>

            <div className="flex items-center gap-2">
              <Clock
                size={20}
                className="text-emerald-600"
              />

              <span>{job.serviceTime || "N/A"}</span>
            </div>
          </div>
        </div>

        {/* SERVICE ACTIONS */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Wrench className="text-emerald-600" />

            <h2 className="text-xl font-bold text-slate-900">
              Service Actions
            </h2>
          </div>

          {/* CONFIRMED */}
          {canStart && (
            <div className="mt-5 space-y-4">
              <p className="text-slate-600">
                This booking is confirmed.
                Start service to begin vehicle inspection.
              </p>

              <button
                type="button"
                onClick={handleStartService}
                disabled={updating}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {updating ? (
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                ) : (
                  <Play size={18} />
                )}

                {updating ? "Starting..." : "Start Service"}
              </button>
            </div>
          )}

          {/* IN PROGRESS */}
          {isInProgress && (
            <div className="mt-5 space-y-4">
              <p className="font-medium text-blue-700">
                Service is in progress.
              </p>

              <p className="text-sm text-slate-500">
                Continue with vehicle inspection, diagnosis,
                and quotation.
              </p>

              <div className="flex flex-wrap gap-3">

                {/* IMPORTANT: Use assignmentId for React routes */}
                <Link
                  to={`/technician/jobs/${job.assignmentId}/inspection`}
                  className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                >
                  Vehicle Inspection
                </Link>

                <Link
                  to={`/technician/jobs/${job.assignmentId}/diagnosis`}
                  className="rounded-xl bg-purple-600 px-5 py-3 font-semibold text-white hover:bg-purple-700"
                >
                  Diagnosis
                </Link>

                <Link
                  to={`/technician/jobs/${job.assignmentId}/quotation`}
                  className="rounded-xl bg-amber-600 px-5 py-3 font-semibold text-white hover:bg-amber-700"
                >
                  Create Quotation
                </Link>

                <Link
                  to={`/technician/jobs/${job.assignmentId}/service`}
                  className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700"
                >
                  Service Execution
                </Link>
              </div>
            </div>
          )}

          {/* COMPLETED */}
          {isCompleted && (
            <div className="mt-5 space-y-4">
              <div className="flex items-center gap-3 rounded-xl bg-green-50 p-4 text-green-700">
                <CheckCircle2 size={22} />

                <p className="font-semibold">
                  Vehicle service completed successfully.
                </p>
              </div>

              <Link
                to={`/technician/jobs/${job.assignmentId}/invoice`}
                className="inline-flex rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
              >
                View Invoice
              </Link>
            </div>
          )}

          {/* CANCELLED */}
          {job.status === "CANCELLED" && (
            <p className="mt-5 text-red-600">
              This booking has been cancelled.
            </p>
          )}

          {/* REFRESH */}
          <div className="mt-6 border-t border-slate-200 pt-5">
            <button
              type="button"
              onClick={refreshJob}
              disabled={loading || updating}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                size={18}
                className={loading ? "animate-spin" : ""}
              />

              Refresh Job
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
