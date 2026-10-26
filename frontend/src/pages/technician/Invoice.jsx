
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  ArrowLeft,
  Car,
  Receipt,
  FileText,
  CheckCircle2,
  AlertCircle,
  Printer,
  Clock,
  CreditCard,
  Send,
  Loader2,
  RefreshCw,
} from "lucide-react";

import {
  getTechnicianJobDetails,
  getTechnicianQuotation,
  getTechnicianInvoice,
  submitTechnicianInvoice,
} from "../../services/technicianService";

// ==========================================
// HELPERS
// ==========================================

function formatMoney(value) {
  return Number(value ?? 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  });
}

function getErrorMessage(error) {
  const data = error.response?.data;

  return (
    (typeof data === "string" && data.trim()) ||
    data?.detail ||
    data?.message ||
    data?.error ||
    error.message ||
    "Something went wrong."
  );
}

function formatStatus(status) {
  if (!status) return "Not submitted";

  return String(status).replaceAll("_", " ");
}

// ==========================================
// TECHNICIAN INVOICE PAGE
// ==========================================

export default function Invoice() {
  // URL ID = technician assignment ID
  const { id } = useParams();

  const [job, setJob] = useState(null);
  const [quotation, setQuotation] = useState(null);
  const [officialInvoice, setOfficialInvoice] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [invoiceError, setInvoiceError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================
  // LOAD JOB, QUOTATION, AND INVOICE
  // ==========================================

  useEffect(() => {
    let active = true;

    async function loadInvoice() {
      setLoading(true);
      setError("");
      setInvoiceError("");
      setSuccess("");

      setJob(null);
      setQuotation(null);
      setOfficialInvoice(null);

      try {
        const jobData = await getTechnicianJobDetails(id);

        if (!active) return;

        setJob(jobData);

        if (!jobData?.bookingId) {
          throw new Error("Booking ID is missing.");
        }

        const quotationData =
          await getTechnicianQuotation(jobData.bookingId);

        if (!active) return;

        setQuotation(quotationData);

        try {
          const invoiceData = await getTechnicianInvoice(
            jobData.bookingId
          );

          if (active) {
            setOfficialInvoice(invoiceData);
          }
        } catch (err) {
          if (!active) return;

          if (err.status === 404) {
            setOfficialInvoice(null);
          } else {
            setInvoiceError(getErrorMessage(err));
          }
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

    loadInvoice();

    return () => {
      active = false;
    };
  }, [id]);

  // ==========================================
  // REFRESH INVOICE
  // ==========================================

  async function refreshInvoice() {
    if (!job?.bookingId || refreshing) return;

    try {
      setRefreshing(true);
      setInvoiceError("");
      setSuccess("");

      const invoiceData = await getTechnicianInvoice(
        job.bookingId
      );

      setOfficialInvoice(invoiceData);
    } catch (err) {
      if (err.status === 404) {
        setOfficialInvoice(null);
      } else {
        setInvoiceError(getErrorMessage(err));
      }
    } finally {
      setRefreshing(false);
    }
  }

  // ==========================================
  // SUBMIT INVOICE TO ADMIN
  // ==========================================

  async function handleSubmitInvoice() {
    if (!job?.bookingId || officialInvoice || submitting) {
      return;
    }

    // FIX 1: SERVICE MUST BE COMPLETED
    if (job.status !== "COMPLETED") {
      setInvoiceError(
        "Complete the vehicle service before submitting the invoice."
      );
      return;
    }

    // FIX 2: QUOTATION MUST BE APPROVED
    if (quotation?.status !== "APPROVED") {
      setInvoiceError(
        "Customer must approve the quotation before invoice submission."
      );
      return;
    }

    const confirmed = window.confirm(
      `Submit invoice for Booking #${job.bookingId} to Admin?`
    );

    if (!confirmed) return;

    try {
      setSubmitting(true);
      setInvoiceError("");
      setSuccess("");

      const invoiceData = await submitTechnicianInvoice(
        job.bookingId
      );

      if (!invoiceData?.id) {
        throw new Error(
          "Invoice response has no ID. Refresh to check whether it was created."
        );
      }

      setOfficialInvoice(invoiceData);

      setSuccess(
        `Invoice #${invoiceData.id} submitted to Admin successfully.`
      );
    } catch (err) {
      if (err.status === 409) {
        // Avoid creating a duplicate invoice.
        try {
          const existingInvoice =
            await getTechnicianInvoice(job.bookingId);

          setOfficialInvoice(existingInvoice);

          setSuccess(
            "An invoice already exists for this booking."
          );
        } catch (fetchError) {
          setInvoiceError(getErrorMessage(fetchError));
        }
      } else {
        setInvoiceError(getErrorMessage(err));
      }
    } finally {
      setSubmitting(false);
    }
  }

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 p-6">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3 text-blue-600">
            <Loader2 size={24} className="animate-spin" />
            <p>Loading invoice details...</p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // JOB OR QUOTATION NOT FOUND
  // ==========================================

  if (!job || !quotation) {
    return (
      <div className="min-h-screen bg-slate-100 p-6">
        <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-sm">
          <div className="mb-4 flex items-center gap-3 text-red-600">
            <AlertCircle size={25} />

            <h1 className="text-xl font-bold">
              Invoice Details Unavailable
            </h1>
          </div>

          <p className="text-slate-600">
            {error ||
              "Unable to find the assigned job or quotation."}
          </p>

          <Link
            to="/technician/jobs"
            className="mt-5 inline-flex items-center gap-2 text-blue-600"
          >
            <ArrowLeft size={18} />
            Back to Assigned Jobs
          </Link>
        </div>
      </div>
    );
  }

  // ==========================================
  // INVOICE STATUS
  // ==========================================

  const isSubmitted = Boolean(officialInvoice);

  const isServiceCompleted =
    job.status === "COMPLETED";

  const isApprovedQuotation =
    quotation.status === "APPROVED";

  const invoiceStatus =
    officialInvoice?.invoiceStatus || null;

  const paymentStatus =
    officialInvoice?.paymentStatus || "UNPAID";

  const isSentToCustomer =
    invoiceStatus === "SENT_TO_CUSTOMER";

  const canSubmit =
    !isSubmitted &&
    isServiceCompleted &&
    isApprovedQuotation &&
    !submitting &&
    !refreshing &&
    !invoiceError;

  // ==========================================
  // INVOICE AMOUNTS
  // ==========================================

  const source = officialInvoice || quotation;

  const partsCost = Number(source.partsCost ?? 0);

  const labourCost = Number(source.labourCost ?? 0);

  const additionalCharges = Number(
    source.additionalCharges ?? 0
  );

  const totalAmount = Number(
    source.totalAmount ??
      partsCost + labourCost + additionalCharges
  );

  const items = [
    {
      name: "Vehicle Parts",
      description: "Parts cost from approved quotation",
      amount: partsCost,
    },
    {
      name: "Service Labour",
      description: "Labour charges",
      amount: labourCost,
    },
    {
      name: "Additional Charges",
      description: "Additional approved charges",
      amount: additionalCharges,
    },
  ];

  // ==========================================
  // MAIN PAGE
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="mx-auto max-w-6xl space-y-6">

        {/* BACK BUTTON */}
        <Link
          to={`/technician/jobs/${id}/service`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft size={18} />
          Back to Service
        </Link>

        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {isSubmitted
                ? "Submitted Service Invoice"
                : "Invoice Preview"}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Job #{job.assignmentId} | Booking #{job.bookingId}
            </p>
          </div>

          <div
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${
              isSentToCustomer
                ? "bg-green-100 text-green-700"
                : isSubmitted
                ? "bg-blue-100 text-blue-700"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            {isSentToCustomer
              ? "Sent to Customer"
              : isSubmitted
              ? "Submitted to Admin"
              : "Not Submitted"}
          </div>
        </div>

        {/* ERROR */}
        {(error || invoiceError) && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
          >
            <AlertCircle size={20} className="shrink-0" />

            <p>{invoiceError || error}</p>
          </div>
        )}

        {/* SUCCESS */}
        {success && (
          <div className="flex items-center gap-3 rounded-xl bg-green-50 p-4 text-green-700">
            <CheckCircle2 size={20} />
            <p>{success}</p>
          </div>
        )}

        {/* SERVICE COMPLETION WARNING */}
        {!isServiceCompleted && !isSubmitted && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
            <AlertCircle size={22} className="shrink-0" />

            <div>
              <p className="font-bold">
                Service Completion Required
              </p>

              <p className="mt-1 text-sm">
                Complete the vehicle service before submitting
                an invoice to Admin.
              </p>

              <Link
                to={`/technician/jobs/${id}/service`}
                className="mt-2 inline-block font-semibold text-blue-600"
              >
                Go to Service Execution
              </Link>
            </div>
          </div>
        )}

        {/* INVOICE WORKFLOW STATUS */}
        {isSentToCustomer ? (
          <div className="flex items-start gap-3 rounded-xl bg-green-50 p-4 text-green-800">
            <CheckCircle2 size={22} className="shrink-0" />

            <div>
              <p className="font-bold">
                Invoice Sent to Customer
              </p>

              <p className="mt-1 text-sm">
                Admin has released Invoice #{officialInvoice.id}.
                Payment status: {formatStatus(paymentStatus)}.
              </p>
            </div>
          </div>
        ) : isSubmitted ? (
          <div className="flex items-start gap-3 rounded-xl bg-blue-50 p-4 text-blue-800">
            <Clock size={22} className="shrink-0" />

            <div>
              <p className="font-bold">
                Invoice Submitted to Admin
              </p>

              <p className="mt-1 text-sm">
                Invoice #{officialInvoice.id} is awaiting Admin
                review. The customer cannot view it yet.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 rounded-xl bg-amber-50 p-4 text-amber-800">
            <Clock size={22} className="shrink-0" />

            <div>
              <p className="font-bold">
                Invoice Not Submitted
              </p>

              <p className="mt-1 text-sm">
                Review the approved charges below and submit
                the invoice after service completion.
              </p>
            </div>
          </div>
        )}

        {/* MAIN CONTENT */}
        <div className="grid gap-6 lg:grid-cols-3">

          {/* INVOICE DETAILS */}
          <section className="overflow-hidden rounded-2xl bg-white shadow-sm lg:col-span-2">

            {/* INVOICE HEADER */}
            <div className="border-b border-slate-200 p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-blue-600 p-3 text-white">
                    <Receipt size={26} />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold">
                      Smart Vehicle Service
                    </h2>

                    <p className="text-sm text-slate-500">
                      Vehicle Service Center
                    </p>
                  </div>
                </div>

                <div className="text-right text-sm">
                  <p className="font-semibold">
                    {isSubmitted
                      ? `Invoice #${officialInvoice.id}`
                      : `Quotation #${quotation.id}`}
                  </p>

                  <p className="text-slate-500">
                    Booking #{job.bookingId}
                  </p>
                </div>
              </div>
            </div>

            {/* VEHICLE DETAILS */}
            <div className="grid gap-6 border-b border-slate-200 p-6 md:grid-cols-2">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Car size={20} className="text-blue-600" />

                  <h3 className="font-bold">
                    Vehicle Details
                  </h3>
                </div>

                <p className="font-semibold">
                  {job.vehicleMake} {job.vehicleModel}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {job.registrationNumber}
                </p>
              </div>

              <div>
                <h3 className="mb-3 font-bold">
                  Service Details
                </h3>

                <p className="text-sm text-slate-600">
                  Service: {job.serviceType}
                </p>

                <p className="mt-1 text-sm text-slate-600">
                  Date: {job.serviceDate}
                </p>

                <p className="mt-1 text-sm text-slate-600">
                  Quotation: {formatStatus(quotation.status)}
                </p>
              </div>
            </div>

            {/* SERVICE CHARGES */}
            <div className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <FileText size={20} className="text-blue-600" />

                <h3 className="text-lg font-bold">
                  Service Charges
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[400px]">
                  <thead>
                    <tr className="border-b text-left text-sm text-slate-500">
                      <th className="pb-3">
                        Description
                      </th>

                      <th className="pb-3 text-right">
                        Amount
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {items.map((item) => (
                      <tr
                        key={item.name}
                        className="border-b border-slate-100"
                      >
                        <td className="py-4">
                          <p className="font-semibold">
                            {item.name}
                          </p>

                          <p className="text-xs text-slate-500">
                            {item.description}
                          </p>
                        </td>

                        <td className="py-4 text-right font-semibold">
                          {formatMoney(item.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* GRAND TOTAL */}
              <div className="mt-6 flex items-center justify-between border-t pt-5">
                <span className="text-lg font-bold">
                  Grand Total
                </span>

                <span className="text-2xl font-bold text-blue-600">
                  {formatMoney(totalAmount)}
                </span>
              </div>

              <p className="mt-4 text-xs text-slate-500">
                Amount is taken from the approved quotation.
                No additional tax is added by this page.
              </p>
            </div>

            {/* FOOTER - CSS FIXED */}
            <div className="bg-slate-50 p-6 text-center text-xs text-slate-500">
              Thank you for choosing Smart Vehicle Service.
            </div>
          </section>

          {/* RIGHT SIDEBAR */}
          <aside className="space-y-6">

            {/* INVOICE SUMMARY */}
            <section className="rounded-2xl bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-lg font-bold">
                Invoice Summary
              </h3>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">
                    Booking
                  </span>

                  <span>#{job.bookingId}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">
                    Invoice
                  </span>

                  <span>
                    {isSubmitted
                      ? `#${officialInvoice.id}`
                      : "Not submitted"}
                  </span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">
                    Invoice Status
                  </span>

                  <span className="text-right font-semibold">
                    {formatStatus(invoiceStatus)}
                  </span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">
                    Payment
                  </span>

                  <span className="font-semibold">
                    {isSubmitted
                      ? formatStatus(paymentStatus)
                      : "Not available"}
                  </span>
                </div>

                <div className="flex justify-between border-t pt-4">
                  <span className="font-bold">
                    Total
                  </span>

                  <span className="font-bold text-blue-600">
                    {formatMoney(totalAmount)}
                  </span>
                </div>
              </div>
            </section>

            {/* INVOICE ACTIONS */}
            <section className="rounded-2xl bg-white p-5 shadow-sm">
              <h3 className="mb-4 font-bold">
                Invoice Actions
              </h3>

              <div className="space-y-3">

                {/* SUBMIT TO ADMIN */}
                {!isSubmitted && (
                  <button
                    type="button"
                    onClick={handleSubmitInvoice}
                    disabled={canSubmit === false}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2
                          size={18}
                          className="animate-spin"
                        />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Submit Invoice to Admin
                      </>
                    )}
                  </button>
                )}

                {/* ALREADY SUBMITTED */}
                {isSubmitted && (
                  <div className="flex items-center justify-center gap-2 rounded-xl bg-green-50 px-4 py-3 font-semibold text-green-700">
                    <CheckCircle2 size={18} />
                    {isSentToCustomer
                      ? "Sent to Customer"
                      : "Submitted to Admin"}
                  </div>
                )}

                {/* REFRESH */}
                <button
                  type="button"
                  onClick={refreshInvoice}
                  disabled={refreshing || submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  <RefreshCw
                    size={18}
                    className={
                      refreshing ? "animate-spin" : ""
                    }
                  />

                  Refresh Invoice Status
                </button>

                {/* PRINT */}
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"
                >
                  <Printer size={18} />
                  Print {isSubmitted ? "Invoice" : "Preview"}
                </button>
              </div>
            </section>

            {/* PAYMENT INFORMATION */}
            <section className="rounded-2xl bg-blue-50 p-5">
              <div className="flex gap-3">
                <CreditCard
                  size={22}
                  className="shrink-0 text-blue-600"
                />

                <div>
                  <h3 className="font-bold text-blue-800">
                    Payment Information
                  </h3>

                  <p className="mt-2 text-sm text-blue-700">
                    {isSentToCustomer
                      ? "Admin has sent the invoice to the customer. Payment confirmation will be handled by Admin."
                      : isSubmitted
                      ? "Invoice is waiting for Admin review. The customer cannot pay this invoice yet."
                      : "Submit the invoice to Admin after completing the service."}
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
