
import { useEffect, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  Car,
  FileText,
  IndianRupee,
  Calculator,
  Send,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import {
  getTechnicianJobDetails,
  createTechnicianQuotation,
} from "../../services/technicianService";

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(value) || 0);

export default function Quotation() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);

  const [diagnosisId, setDiagnosisId] = useState(
    String(location.state?.diagnosisId ?? "")
  );

  const [form, setForm] = useState({
    partsCost: "",
    labourCost: "",
    additionalCharges: "0",
    description: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [createdQuotation, setCreatedQuotation] = useState(null);

  // Load assigned job details
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
          setError(
            err.response?.data?.detail ||
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

  function updateField(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  const total =
    Number(form.partsCost || 0) +
    Number(form.labourCost || 0) +
    Number(form.additionalCharges || 0);

  async function handleSubmit(event) {
    event.preventDefault();

    if (saving || createdQuotation) return;

    if (!job?.bookingId) {
      setError("Booking ID is missing.");
      return;
    }

    if (job.status !== "IN_PROGRESS") {
      setError("Booking must be IN_PROGRESS.");
      return;
    }

    const parsedDiagnosisId = Number(diagnosisId);

    if (
      !Number.isSafeInteger(parsedDiagnosisId) ||
      parsedDiagnosisId <= 0
    ) {
      setError("Enter a valid Diagnosis ID.");
      return;
    }

    const costs = [
      form.partsCost,
      form.labourCost,
      form.additionalCharges,
    ];

    if (
      costs.some(
        (value) =>
          String(value).trim() === "" ||
          !Number.isFinite(Number(value)) ||
          Number(value) < 0
      )
    ) {
      setError("All costs must be valid numbers, zero or greater.");
      return;
    }

    const payload = {
      diagnosisId: parsedDiagnosisId,
      partsCost: Number(form.partsCost),
      labourCost: Number(form.labourCost),
      additionalCharges: Number(form.additionalCharges),
      description: form.description.trim(),
    };

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const quotation = await createTechnicianQuotation(
        job.bookingId,
        payload
      );

      setCreatedQuotation(quotation);

      setSuccess(
        "Quotation created successfully! Waiting for customer approval."
      );
    } catch (err) {
      console.error("Quotation submission error:", err);
      console.error("Backend response:", err.response?.data);

      const response = err.response?.data;

      setError(
        response?.detail ||
          response?.message ||
          response?.error ||
          err.message ||
          "Unable to create quotation."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-slate-600">
        Loading quotation...
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="mx-auto max-w-5xl space-y-6">

        {/* BACK LINK */}
        <Link
          to={`/technician/jobs/${id}/diagnosis`}
          className="inline-flex items-center gap-2 font-semibold text-blue-600"
        >
          <ArrowLeft size={18} />
          Back to Diagnosis
        </Link>

        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-blue-100 p-4 text-blue-600">
              <FileText size={28} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Create Service Quotation
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

        {/* SUCCESS */}
        {success && (
          <div
            role="status"
            className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700"
          >
            <CheckCircle2 size={22} className="shrink-0" />
            <div>
              <p className="font-bold">{success}</p>

              {createdQuotation && (
                <p className="mt-1 text-sm">
                  Quotation ID: {createdQuotation.id ?? "Created"}
                  {" | "}
                  Status: {createdQuotation.status ?? "PENDING"}
                </p>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* DIAGNOSIS ID */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-lg font-bold text-slate-800">
              Diagnosis Information
            </h2>

            <p className="mb-4 text-sm text-slate-500">
              Diagnosis ID is normally received from the previous step.
              If you refreshed this page, enter the saved Diagnosis ID.
            </p>

            <label
              htmlFor="diagnosisId"
              className="mb-2 block text-sm font-semibold"
            >
              Diagnosis ID
            </label>

            <input
              id="diagnosisId"
              type="number"
              min="1"
              step="1"
              required
              value={diagnosisId}
              onChange={(event) =>
                setDiagnosisId(event.target.value)
              }
              disabled={Boolean(createdQuotation)}
              placeholder="Enter diagnosis ID"
              className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-blue-500"
            />
          </div>

          {/* COST DETAILS */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <IndianRupee size={25} className="text-blue-600" />

              <h2 className="text-xl font-bold text-slate-800">
                Repair Cost Details
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="partsCost"
                  className="mb-2 block font-semibold"
                >
                  Parts Cost (₹)
                </label>

                <input
                  id="partsCost"
                  name="partsCost"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={form.partsCost}
                  onChange={updateField}
                  disabled={Boolean(createdQuotation)}
                  placeholder="Example: 2500"
                  className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="labourCost"
                  className="mb-2 block font-semibold"
                >
                  Labour Cost (₹)
                </label>

                <input
                  id="labourCost"
                  name="labourCost"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={form.labourCost}
                  onChange={updateField}
                  disabled={Boolean(createdQuotation)}
                  placeholder="Example: 800"
                  className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="additionalCharges"
                  className="mb-2 block font-semibold"
                >
                  Additional Charges (₹)
                </label>

                <input
                  id="additionalCharges"
                  name="additionalCharges"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={form.additionalCharges}
                  onChange={updateField}
                  disabled={Boolean(createdQuotation)}
                  placeholder="Example: 200"
                  className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-bold text-slate-800">
              Repair Description
            </h2>

            <textarea
              name="description"
              value={form.description}
              onChange={updateField}
              rows={5}
              disabled={Boolean(createdQuotation)}
              placeholder="Example: Replace brake pads, change engine oil and inspect brake fluid."
              className="w-full rounded-xl border border-slate-300 p-4 outline-none focus:border-blue-500"
            />
          </div>

          {/* TOTAL */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <Calculator size={24} className="text-blue-600" />

              <h2 className="text-xl font-bold text-slate-800">
                Quotation Summary
              </h2>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600">Parts Cost</span>
                <span>{money(form.partsCost)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-600">Labour Cost</span>
                <span>{money(form.labourCost)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-600">
                  Additional Charges
                </span>
                <span>{money(form.additionalCharges)}</span>
              </div>

              <div className="flex justify-between border-t pt-4 text-xl font-bold">
                <span>Total Estimated Cost</span>
                <span className="text-blue-600">
                  {money(createdQuotation?.totalAmount ?? total)}
                </span>
              </div>
            </div>
          </div>

          {/* SUBMIT */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm">
            <div>
              <h2 className="font-bold text-slate-800">
                Submit Quotation
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                After submission, the customer can review the quotation.
              </p>
            </div>

            <button
              type="submit"
              disabled={
                saving ||
                Boolean(createdQuotation) ||
                job.status !== "IN_PROGRESS"
              }
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send size={18} />

              {saving
                ? "Submitting..."
                : createdQuotation
                ? "Quotation Submitted"
                : "Submit Quotation"}
            </button>
          </div>

          {job.status !== "IN_PROGRESS" && (
            <p className="text-sm text-amber-700">
              Booking must be IN_PROGRESS before creating a quotation.
            </p>
          )}

        </form>

        {/* RETURN TO JOB */}
        {createdQuotation && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() =>
                navigate(`/technician/jobs/${id}`)
              }
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Return to Job Details
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
