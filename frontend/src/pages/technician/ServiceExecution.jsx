
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Car,
  Wrench,
  CheckCircle2,
  Clock,
  FileText,
  AlertCircle,
  IndianRupee,
  ClipboardCheck,
} from "lucide-react";

import {
  getTechnicianJobDetails,
  getTechnicianQuotation,
  completeTechnicianService,
} from "../../services/technicianService";

function getErrorMessage(error) {
  const data = error.response?.data;

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  return (
    data?.detail ||
    data?.message ||
    data?.error ||
    error.message ||
    "Something went wrong."
  );
}

function formatMoney(value) {
  return Number(value ?? 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  });
}

export default function ServiceExecution() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [quotation, setQuotation] = useState(null);

  const [workPerformed, setWorkPerformed] = useState("");
  const [technicianNotes, setTechnicianNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================
  // LOAD REAL JOB AND QUOTATION
  // ==========================================

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const jobData = await getTechnicianJobDetails(id);

        if (!active) return;

        setJob(jobData);

        const quotationData = await getTechnicianQuotation(
          jobData.bookingId
        );

        if (!active) return;

        setQuotation(quotationData);
      } catch (err) {
        if (!active) return;

        console.error("Service data loading error:", err);

        setError(
          err.response?.status === 404
            ? "Job or quotation not found. Check that the quotation was created."
            : getErrorMessage(err)
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, [id]);

  // ==========================================
  // SERVICE STATUS
  // ==========================================

  const isCompleted = job?.status === "COMPLETED";
  const isInProgress = job?.status === "IN_PROGRESS";
  const isApproved = quotation?.status === "APPROVED";
  const isRejected = quotation?.status === "REJECTED";

  const canComplete =
    isInProgress &&
    isApproved &&
    !saving;

  // ==========================================
  // COMPLETE SERVICE API
  // ==========================================

  async function handleCompleteService(event) {
    event.preventDefault();

    if (!job?.bookingId) {
      setError("Booking ID is missing.");
      return;
    }

    if (!isInProgress) {
      setError("Booking must be IN_PROGRESS.");
      return;
    }

    if (!isApproved) {
      setError(
        "Customer must approve the quotation before service completion."
      );
      return;
    }

    if (!workPerformed.trim()) {
      setError("Please enter the work performed.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await completeTechnicianService(job.bookingId, {
        workPerformed: workPerformed.trim(),
        technicianNotes: technicianNotes.trim(),
      });

      setJob((previous) => ({
        ...previous,
        status: "COMPLETED",
      }));

      setSuccess("Service completed successfully.");

      navigate(`/technician/jobs/${id}/invoice`);
    } catch (err) {
      console.error("Service completion error:", err);
      console.error("Backend response:", err.response?.data);

      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  // ==========================================
  // LOADING / ERROR
  // ==========================================

  if (loading) {
    return (
      <div className="p-6 text-slate-600">
        Loading service details...
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
      <div className="mx-auto max-w-7xl space-y-6">

        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              to={`/technician/jobs/${id}`}
              className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-blue-600"
            >
              <ArrowLeft size={18} />
              Back to Job Details
            </Link>

            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                <Wrench size={26} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-800">
                  Service Execution
                </h1>

                <p className="text-sm text-slate-500">
                  Job #{job.assignmentId} | Booking #{job.bookingId}
                </p>
              </div>
            </div>
          </div>

          <span
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              isCompleted
                ? "bg-green-100 text-green-700"
                : isInProgress
                ? "bg-blue-100 text-blue-700"
                : "bg-slate-200 text-slate-700"
            }`}
          >
            {job.status}
          </span>
        </div>

        {/* MESSAGES */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
          >
            <AlertCircle size={20} className="shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-3 rounded-xl bg-green-50 p-4 text-green-700">
            <CheckCircle2 size={20} />
            {success}
          </div>
        )}

        {/* TOP INFORMATION */}
        <div className="grid gap-5 md:grid-cols-3">

          <section className="rounded-2xl bg-white p-5 shadow-sm">
            <Car size={27} className="mb-3 text-blue-600" />

            <p className="text-sm text-slate-500">
              Vehicle
            </p>

            <h2 className="mt-1 font-bold text-slate-800">
              {job.vehicleMake} {job.vehicleModel}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {job.registrationNumber}
            </p>
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-sm">
            <Wrench size={27} className="mb-3 text-purple-600" />

            <p className="text-sm text-slate-500">
              Service Type
            </p>

            <h2 className="mt-1 font-bold text-slate-800">
              {job.serviceType}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {job.serviceDate}
            </p>
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-sm">
            {isApproved ? (
              <CheckCircle2
                size={27}
                className="mb-3 text-green-600"
              />
            ) : (
              <Clock
                size={27}
                className="mb-3 text-amber-600"
              />
            )}

            <p className="text-sm text-slate-500">
              Customer Quotation
            </p>

            <h2
              className={`mt-1 font-bold ${
                isApproved
                  ? "text-green-700"
                  : isRejected
                  ? "text-red-700"
                  : "text-amber-700"
              }`}
            >
              {quotation?.status || "Not Available"}
            </h2>

            {quotation && (
              <p className="mt-1 text-sm text-slate-500">
                {formatMoney(quotation.totalAmount)}
              </p>
            )}
          </section>
        </div>

        {/* MAIN CONTENT */}
        <div className="grid gap-6 lg:grid-cols-3">

          <form
            onSubmit={handleCompleteService}
            className="space-y-6 lg:col-span-2"
          >
            {/* WORK PERFORMED */}
            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <ClipboardCheck
                  size={24}
                  className="text-blue-600"
                />

                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    Work Performed
                  </h2>

                  <p className="text-sm text-slate-500">
                    Describe the repairs actually completed.
                  </p>
                </div>
              </div>

              <textarea
                value={workPerformed}
                onChange={(event) =>
                  setWorkPerformed(event.target.value)
                }
                rows={7}
                required
                disabled={isCompleted || saving}
                placeholder="Example: Replaced engine oil, repaired brakes, replaced air filter..."
                className="w-full rounded-xl border border-slate-300 p-4 outline-none focus:border-blue-500 disabled:bg-slate-100"
              />
            </section>

            {/* TECHNICIAN NOTES */}
            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-800">
                Technician Notes
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Add final observations and recommendations.
              </p>

              <textarea
                value={technicianNotes}
                onChange={(event) =>
                  setTechnicianNotes(event.target.value)
                }
                rows={6}
                disabled={isCompleted || saving}
                placeholder="Enter final technician notes..."
                className="mt-4 w-full rounded-xl border border-slate-300 p-4 outline-none focus:border-blue-500 disabled:bg-slate-100"
              />
            </section>

            {/* ACTIONS */}
            <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm">
              <div>
                <h2 className="font-bold text-slate-800">
                  Complete Vehicle Service
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Save completed work and continue to invoice.
                </p>
              </div>

              {isCompleted ? (
                <Link
                  to={`/technician/jobs/${id}/invoice`}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
                >
                  <FileText size={18} />
                  Continue to Invoice
                </Link>
              ) : (
                <button
                  type="submit"
                  disabled={!canComplete}
                  className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <CheckCircle2 size={18} />
                  {saving
                    ? "Completing..."
                    : "Complete Service"}
                </button>
              )}
            </section>
          </form>

          {/* SIDEBAR */}
          <aside className="space-y-6">

            {/* QUOTATION */}
            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-slate-800">
                Approved Quotation
              </h2>

              {quotation ? (
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">
                      Quotation ID
                    </span>
                    <span className="font-semibold">
                      #{quotation.id}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">
                      Parts Cost
                    </span>
                    <span>
                      {formatMoney(quotation.partsCost)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">
                      Labour Cost
                    </span>
                    <span>
                      {formatMoney(quotation.labourCost)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">
                      Additional Charges
                    </span>
                    <span>
                      {formatMoney(quotation.additionalCharges)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t pt-4">
                    <span className="font-bold">
                      Total Amount
                    </span>

                    <span className="flex items-center font-bold text-blue-600">
                      <IndianRupee size={16} />
                      {Number(
                        quotation.totalAmount ?? 0
                      ).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  Quotation is not available.
                </p>
              )}
            </section>

            {/* WORKFLOW */}
            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-lg font-bold text-slate-800">
                Service Workflow
              </h2>

              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <CheckCircle2
                    size={21}
                    className="text-green-600"
                  />
                  <span>Inspection and Diagnosis</span>
                </div>

                <div className="flex items-center gap-3">
                  {isApproved ? (
                    <CheckCircle2
                      size={21}
                      className="text-green-600"
                    />
                  ) : (
                    <Clock
                      size={21}
                      className="text-amber-600"
                    />
                  )}
                  <span>
                    Customer Quotation Approval
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {isCompleted ? (
                    <CheckCircle2
                      size={21}
                      className="text-green-600"
                    />
                  ) : (
                    <Wrench
                      size={21}
                      className="text-blue-600"
                    />
                  )}
                  <span>
                    Vehicle Repair
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <FileText
                    size={21}
                    className="text-slate-400"
                  />
                  <span>Invoice Generation</span>
                </div>
              </div>
            </section>

            {/* APPROVAL MESSAGE */}
            {!isApproved && !isCompleted && (
              <section className="rounded-2xl bg-amber-50 p-5">
                <div className="flex gap-3">
                  <AlertCircle
                    size={22}
                    className="shrink-0 text-amber-600"
                  />

                  <div>
                    <h3 className="font-bold text-amber-800">
                      Approval Required
                    </h3>

                    <p className="mt-2 text-sm text-amber-700">
                      The customer must approve the quotation
                      before you can complete the service.
                    </p>
                  </div>
                </div>
              </section>
            )}

            {isApproved && !isCompleted && (
              <section className="rounded-2xl bg-green-50 p-5">
                <div className="flex gap-3">
                  <CheckCircle2
                    size={22}
                    className="shrink-0 text-green-600"
                  />

                  <div>
                    <h3 className="font-bold text-green-800">
                      Customer Approved
                    </h3>

                    <p className="mt-2 text-sm text-green-700">
                      The quotation has been approved.
                      You can complete the repair work.
                    </p>
                  </div>
                </div>
              </section>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
