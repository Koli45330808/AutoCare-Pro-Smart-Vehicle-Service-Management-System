
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ClipboardList,
  Car,
  Wrench,
  FileText,
  Send,
  AlertCircle,
  Loader2,
} from "lucide-react";

import {
  getTechnicianJobDetails,
  createTechnicianDiagnosis,
} from "../../services/technicianService";

function getErrorMessage(error) {
  return (
    error.response?.data?.detail ||
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message ||
    "Something went wrong."
  );
}

export default function Diagnosis() {
  // Route ID is the assignment ID.
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);

  const [form, setForm] = useState({
    problemFound: "",
    recommendedRepair: "",
    additionalNotes: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // LOAD TECHNICIAN JOB
  // ==========================================

  useEffect(() => {
    let active = true;

    async function loadJob() {
      try {
        setLoading(true);
        setError("");

        const data = await getTechnicianJobDetails(id);

        if (active) {
          setJob(data);
        }
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

  // ==========================================
  // UPDATE FORM
  // ==========================================

  function updateField(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // ==========================================
  // SUBMIT DIAGNOSIS
  // ==========================================

  async function handleSubmit(event) {
    event.preventDefault();

    if (saving) return;

    if (!job?.bookingId) {
      setError("Booking ID is missing.");
      return;
    }

    if (job.status !== "IN_PROGRESS") {
      setError("Booking must be IN_PROGRESS.");
      return;
    }

    if (
      !form.problemFound.trim() ||
      !form.recommendedRepair.trim()
    ) {
      setError(
        "Problem Found and Recommended Repair are required."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const diagnosis = await createTechnicianDiagnosis(
        job.bookingId,
        {
          problemFound: form.problemFound.trim(),
          recommendedRepair: form.recommendedRepair.trim(),
          additionalNotes: form.additionalNotes.trim(),
        }
      );

      if (!diagnosis?.id) {
        throw new Error(
          "Diagnosis response has no ID. Check the backend before submitting again."
        );
      }

      navigate(`/technician/jobs/${id}/quotation`, {
        state: {
          diagnosisId: diagnosis.id,
        },
      });
    } catch (err) {
      console.error("Diagnosis submission error:", err);
      console.error("Backend response:", err.response?.data);

      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="flex items-center gap-3 p-6 text-slate-600">
        <Loader2 size={22} className="animate-spin" />
        Loading vehicle diagnosis...
      </div>
    );
  }

  // ==========================================
  // JOB NOT FOUND
  // ==========================================

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

  // ==========================================
  // MAIN UI
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="mx-auto max-w-5xl space-y-6">

        {/* BACK */}
        <Link
          to={`/technician/jobs/${id}/inspection`}
          className="inline-flex items-center gap-2 font-semibold text-blue-600"
        >
          <ArrowLeft size={18} />
          Back to Inspection
        </Link>

        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-blue-100 p-4 text-blue-600">
              <ClipboardList size={28} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Vehicle Diagnosis
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

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* PROBLEM FOUND */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <AlertCircle
                size={24}
                className="text-orange-500"
              />

              <h2 className="text-lg font-bold text-slate-800">
                Problem Found
              </h2>
            </div>

            <p className="mb-4 text-sm text-slate-500">
              Describe the problems identified during inspection.
            </p>

            <textarea
              name="problemFound"
              value={form.problemFound}
              onChange={updateField}
              required
              rows={5}
              placeholder="Example: Front brake pads are worn. Engine oil level is low."
              className="w-full rounded-xl border border-slate-300 p-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </section>

          {/* RECOMMENDED REPAIR */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <Wrench size={24} className="text-blue-600" />

              <h2 className="text-lg font-bold text-slate-800">
                Recommended Repair
              </h2>
            </div>

            <p className="mb-4 text-sm text-slate-500">
              Explain the repair work required.
            </p>

            <textarea
              name="recommendedRepair"
              value={form.recommendedRepair}
              onChange={updateField}
              required
              rows={5}
              placeholder="Example: Replace front brake pads and change engine oil."
              className="w-full rounded-xl border border-slate-300 p-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </section>

          {/* ADDITIONAL NOTES */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <FileText size={24} className="text-slate-600" />

              <h2 className="text-lg font-bold text-slate-800">
                Additional Notes
              </h2>
            </div>

            <p className="mb-4 text-sm text-slate-500">
              Add any additional information.
            </p>

            <textarea
              name="additionalNotes"
              value={form.additionalNotes}
              onChange={updateField}
              rows={4}
              placeholder="Example: Customer should approve the quotation before repairs begin."
              className="w-full rounded-xl border border-slate-300 p-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </section>

          {/* SUBMIT */}
          <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm">
            <div>
              <h2 className="font-bold text-slate-800">
                Complete Diagnosis
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Save diagnosis and continue to quotation.
              </p>
            </div>

            <button
              type="submit"
              disabled={saving || job.status !== "IN_PROGRESS"}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}

              {saving
                ? "Saving Diagnosis..."
                : "Save Diagnosis & Continue"}
            </button>
          </section>

          {job.status !== "IN_PROGRESS" && (
            <p className="text-sm text-amber-700">
              Booking must be IN_PROGRESS before diagnosis.
            </p>
          )}

        </form>
      </div>
    </div>
  );
}
