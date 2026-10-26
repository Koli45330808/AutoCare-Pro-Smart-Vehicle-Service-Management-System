
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  Car,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ClipboardCheck,
  Send,
} from "lucide-react";

import {
  getTechnicianJobDetails,
  createTechnicianInspection,
} from "../../services/technicianService";

// ================= INSPECTION ITEMS =================

const inspectionItems = [
  {
    id: "engine",
    name: "Engine",
    description: "Check engine condition, oil level and unusual noise.",
  },
  {
    id: "brakes",
    name: "Brakes",
    description: "Check brake pads, discs and braking performance.",
  },
  {
    id: "tyres",
    name: "Tyres",
    description: "Check tyre pressure, tread and tyre condition.",
  },
  {
    id: "battery",
    name: "Battery",
    description: "Check battery health, terminals and voltage.",
  },
  {
    id: "ac",
    name: "Air Conditioning",
    description: "Check cooling performance and AC noise.",
  },
  {
    id: "lights",
    name: "Lights",
    description: "Check headlights, indicators and brake lights.",
  },
  {
    id: "suspension",
    name: "Suspension",
    description: "Check suspension noise, shocks and stability.",
  },
  {
    id: "exterior",
    name: "Exterior",
    description: "Check body panels, scratches and visible damage.",
  },
  {
    id: "interior",
    name: "Interior",
    description: "Check seats, dashboard and controls.",
  },
];

// ================= INITIAL STATE =================

const initialInspection = Object.fromEntries(
  inspectionItems.map((item) => [item.id, "Good"])
);

// Backend accepts only GOOD, FAIR, POOR
const conditionMap = {
  Good: "GOOD",
  "Needs Attention": "FAIR",
  Critical: "POOR",
};

// ================= COMPONENT =================

export default function VehicleInspection() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);

  const [inspection, setInspection] = useState(initialInspection);

  const [observations, setObservations] = useState("");
  const [recommendations, setRecommendations] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ================= LOAD JOB =================

  useEffect(() => {
    let active = true;

    async function loadJob() {
      try {
        setLoading(true);
        setError("");

        // URL id is assignmentId
        const data = await getTechnicianJobDetails(id);

        if (active) {
          setJob(data);
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.status === 404
              ? "Job not found or not assigned to you."
              : err.response?.data?.detail ||
                  err.response?.data?.message ||
                  err.message ||
                  "Unable to load job."
          );
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

  // ================= UPDATE INSPECTION =================

  function updateInspection(itemId, value) {
    setInspection((previous) => ({
      ...previous,
      [itemId]: value,
    }));
  }

  // ================= SUMMARY COUNTS =================

  const goodCount = Object.values(inspection).filter(
    (value) => value === "Good"
  ).length;

  const attentionCount = Object.values(inspection).filter(
    (value) => value === "Needs Attention"
  ).length;

  const criticalCount = Object.values(inspection).filter(
    (value) => value === "Critical"
  ).length;

  // ================= SUBMIT INSPECTION =================

  async function handleSubmit(event) {
    event.preventDefault();

    if (saving) return;

    if (!job?.bookingId) {
      setError("Booking ID is missing.");
      return;
    }

    if (job.status !== "IN_PROGRESS") {
      setError("Start the service before submitting inspection.");
      return;
    }

    // Additional checklist items are stored in technician notes
    const additionalChecks = inspectionItems
      .filter(
        (item) =>
          !["engine", "brakes", "tyres", "battery"].includes(item.id)
      )
      .map((item) => `${item.name}: ${inspection[item.id]}`)
      .join("\n");

    const notes = [
      "Additional Inspection Checks:",
      additionalChecks,
      "",
      "Technician Observations:",
      observations.trim() || "None",
      "",
      "Recommended Services:",
      recommendations.trim() || "None",
    ].join("\n");

    // Correct backend request body
    const payload = {
      engineCondition: conditionMap[inspection.engine],
      brakeCondition: conditionMap[inspection.brakes],
      tyreCondition: conditionMap[inspection.tyres],
      batteryCondition: conditionMap[inspection.battery],
      technicianNotes: notes,
    };

    try {
      setSaving(true);
      setError("");

      // Backend endpoint uses bookingId
      await createTechnicianInspection(job.bookingId, payload);

      // Frontend route uses assignmentId
      navigate(`/technician/jobs/${id}/diagnosis`);
    } catch (err) {
      console.error("Inspection submission error:", err);
      console.error("Backend response:", err.response?.data);

      const response = err.response?.data;

      setError(
        response?.detail ||
          response?.message ||
          response?.error ||
          err.message ||
          "Unable to submit inspection."
      );
    } finally {
      setSaving(false);
    }
  }

  // ================= LOADING =================

  if (loading) {
    return (
      <div className="p-6 text-slate-600">
        Loading vehicle inspection...
      </div>
    );
  }

  // ================= JOB NOT FOUND =================

  if (!job) {
    return (
      <div className="space-y-4 p-6">
        <p className="text-red-600">
          {error || "Job not found."}
        </p>

        <Link
          to="/technician/jobs"
          className="font-semibold text-blue-600"
        >
          Back to Assigned Jobs
        </Link>
      </div>
    );
  }

  // ================= UI =================

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* BACK LINK */}
        <Link
          to={`/technician/jobs/${id}`}
          className="inline-flex items-center gap-2 font-semibold text-blue-600"
        >
          <ArrowLeft size={18} />
          Back to Job Details
        </Link>

        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm">

          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-blue-100 p-4 text-blue-600">
              <ClipboardCheck size={28} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Vehicle Inspection
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Job #{job.assignmentId} | Booking #{job.bookingId}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
            <Car size={25} className="text-blue-600" />

            <div>
              <p className="font-bold">
                {job.vehicleMake} {job.vehicleModel}
              </p>

              <p className="text-sm text-slate-500">
                {job.registrationNumber}
              </p>
            </div>
          </div>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div
            role="alert"
            className="rounded-xl bg-red-50 p-4 text-red-700"
          >
            {error}
          </div>
        )}

        {/* SUMMARY */}
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              label: "Good",
              count: goodCount,
              icon: CheckCircle2,
              color: "text-green-600",
            },
            {
              label: "Needs Attention",
              count: attentionCount,
              icon: AlertTriangle,
              color: "text-orange-600",
            },
            {
              label: "Critical",
              count: criticalCount,
              icon: XCircle,
              color: "text-red-600",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm"
              >
                <Icon size={28} className={item.color} />

                <div>
                  <p className="text-sm text-slate-500">
                    {item.label}
                  </p>

                  <p className="text-3xl font-bold">
                    {item.count}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* INSPECTION FORM */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* CHECKLIST */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">
              Inspection Checklist
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Check each component and select its condition.
            </p>

            <div className="mt-6 space-y-4">
              {inspectionItems.map((item, index) => (
                <div
                  key={item.id}
                  className="flex flex-col justify-between gap-4 rounded-xl border p-4 lg:flex-row lg:items-center"
                >
                  <div className="flex gap-4">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 font-bold">
                      {index + 1}
                    </div>

                    <div>
                      <h3 className="font-bold">
                        {item.name}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {[
                      {
                        label: "Good",
                        active: "bg-green-600 text-white",
                      },
                      {
                        label: "Needs Attention",
                        active: "bg-orange-500 text-white",
                      },
                      {
                        label: "Critical",
                        active: "bg-red-600 text-white",
                      },
                    ].map((option) => (
                      <button
                        key={option.label}
                        type="button"
                        onClick={() =>
                          updateInspection(item.id, option.label)
                        }
                        aria-pressed={
                          inspection[item.id] === option.label
                        }
                        className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                          inspection[item.id] === option.label
                            ? option.active
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* OBSERVATIONS */}
          <div className="grid gap-5 lg:grid-cols-2">

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold">
                Technician Observations
              </h2>

              <textarea
                value={observations}
                onChange={(event) =>
                  setObservations(event.target.value)
                }
                rows={6}
                placeholder="Describe problems found during inspection..."
                className="mt-4 w-full rounded-xl border border-slate-300 p-4 outline-none focus:border-blue-500"
              />
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold">
                Recommended Services
              </h2>

              <textarea
                value={recommendations}
                onChange={(event) =>
                  setRecommendations(event.target.value)
                }
                rows={6}
                placeholder="Describe recommended repairs and parts..."
                className="mt-4 w-full rounded-xl border border-slate-300 p-4 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* SUBMIT */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm">

            <div>
              <h2 className="font-bold">
                Complete Inspection
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Save the inspection report and continue to diagnosis.
              </p>
            </div>

            <button
              type="submit"
              disabled={saving || job.status !== "IN_PROGRESS"}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send size={18} />
              {saving ? "Submitting..." : "Submit Inspection"}
            </button>
          </div>

          {job.status !== "IN_PROGRESS" && (
            <p className="text-sm text-amber-700">
              This booking must be IN_PROGRESS before submitting inspection.
              Return to Job Details and start the service first.
            </p>
          )}

        </form>
      </div>
    </div>
  );
}
