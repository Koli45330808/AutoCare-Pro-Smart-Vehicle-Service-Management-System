
import { useCallback, useEffect, useState } from "react";

import {
  FileText,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Send,
  Clock,
  IndianRupee,
  Eye,
  X,
  Loader2,
} from "lucide-react";

import {
  generateAdminInvoice,
  getAdminInvoices,
  sendAdminInvoiceToCustomer,
} from "../../services/adminInvoiceService";

// ==========================================
// HELPERS
// ==========================================

function money(value) {
  return Number(value ?? 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  });
}

function errorMessage(error) {
  const data = error.response?.data;

  return (
    (typeof data === "string" && data.trim()) ||
    data?.detail ||
    data?.message ||
    data?.error ||
    error.message ||
    "Request failed."
  );
}

function formatStatus(status) {
  return status
    ? String(status).replaceAll("_", " ")
    : "Unknown";
}

function invoiceStatusStyle(status) {
  if (status === "SENT_TO_CUSTOMER") {
    return "bg-green-100 text-green-700";
  }

  if (status === "SUBMITTED_TO_ADMIN") {
    return "bg-blue-100 text-blue-700";
  }

  return "bg-slate-100 text-slate-700";
}

// ==========================================
// ADMIN INVOICE MANAGEMENT
// ==========================================

export default function AdminInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [bookingId, setBookingId] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingId, setSendingId] = useState(null);

  const [selectedInvoice, setSelectedInvoice] =
    useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================
  // LOAD INVOICES
  // ==========================================

  const loadInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAdminInvoices();

      setInvoices(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  // ==========================================
  // GENERATE INVOICE
  // ==========================================

  async function handleGenerate(event) {
    event.preventDefault();

    const id = Number(bookingId);

    if (!Number.isSafeInteger(id) || id <= 0) {
      setError("Enter a valid booking ID.");
      return;
    }

    if (saving) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const invoice = await generateAdminInvoice(id);

      setSuccess(
        `Invoice #${invoice.id} generated for Booking #${id}.`
      );

      setBookingId("");

      await loadInvoices();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  // ==========================================
  // SEND INVOICE TO CUSTOMER
  // ==========================================

  async function handleSendToCustomer(invoice) {
    if (
      sendingId !== null ||
      invoice.invoiceStatus !== "SUBMITTED_TO_ADMIN"
    ) {
      return;
    }

    const confirmed = window.confirm(
      `Send Invoice #${invoice.id} for Booking #${invoice.bookingId} to the customer?\n\nTotal Amount: ${money(invoice.totalAmount)}`
    );

    if (!confirmed) return;

    try {
      setSendingId(invoice.id);
      setError("");
      setSuccess("");

      const updatedInvoice =
        await sendAdminInvoiceToCustomer(invoice.id);

      setInvoices((previous) =>
        previous.map((item) =>
          item.id === updatedInvoice.id
            ? updatedInvoice
            : item
        )
      );

      setSelectedInvoice((previous) =>
        previous?.id === updatedInvoice.id
          ? updatedInvoice
          : previous
      );

      setSuccess(
        `Invoice #${invoice.id} sent to Customer successfully.`
      );
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSendingId(null);
    }
  }

  // ==========================================
  // STATISTICS
  // ==========================================

  const totalInvoices = invoices.length;

  const pendingInvoices = invoices.filter(
    (invoice) =>
      invoice.invoiceStatus === "SUBMITTED_TO_ADMIN"
  ).length;

  const sentInvoices = invoices.filter(
    (invoice) =>
      invoice.invoiceStatus === "SENT_TO_CUSTOMER"
  ).length;

  const totalAmount = invoices.reduce(
    (sum, invoice) =>
      sum + Number(invoice.totalAmount ?? 0),
    0
  );

  // ==========================================
  // MAIN UI
  // ==========================================

  return (
    <div className="space-y-6 p-4 md:p-6">

      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Invoice Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Review technician invoices and send approved
            invoices to customers.
          </p>
        </div>

        <button
          type="button"
          onClick={loadInvoices}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
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
        <div className="flex items-center gap-3 rounded-xl bg-green-50 p-4 text-green-700">
          <CheckCircle2 size={20} />
          <p>{success}</p>
        </div>
      )}

      {/* STATISTICS */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <FileText
            size={25}
            className="mb-3 text-blue-600"
          />

          <p className="text-sm text-slate-500">
            Total Invoices
          </p>

          <h2 className="mt-1 text-2xl font-bold">
            {totalInvoices}
          </h2>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <Clock
            size={25}
            className="mb-3 text-amber-600"
          />

          <p className="text-sm text-slate-500">
            Awaiting Admin Review
          </p>

          <h2 className="mt-1 text-2xl font-bold">
            {pendingInvoices}
          </h2>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <Send
            size={25}
            className="mb-3 text-green-600"
          />

          <p className="text-sm text-slate-500">
            Sent to Customers
          </p>

          <h2 className="mt-1 text-2xl font-bold">
            {sentInvoices}
          </h2>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <IndianRupee
            size={25}
            className="mb-3 text-purple-600"
          />

          <p className="text-sm text-slate-500">
            Total Invoice Value
          </p>

          <h2 className="mt-1 text-xl font-bold">
            {money(totalAmount)}
          </h2>
        </div>
      </div>

      {/* LEGACY GENERATE INVOICE */}
      <form
        onSubmit={handleGenerate}
        className="rounded-2xl bg-white p-6 shadow-sm"
      >
        <h2 className="mb-2 text-lg font-bold">
          Generate Invoice Manually
        </h2>

        <p className="mb-4 text-sm text-slate-500">
          Normally, technicians submit invoices after
          completing service. Manual generation is retained
          for existing Admin workflows.
        </p>

        <div className="flex flex-wrap gap-3">
          <input
            type="number"
            min="1"
            step="1"
            required
            value={bookingId}
            onChange={(event) =>
              setBookingId(event.target.value)
            }
            placeholder="Enter completed Booking ID"
            className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
          />

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? (
              <Loader2
                size={18}
                className="animate-spin"
              />
            ) : (
              <Plus size={18} />
            )}

            {saving
              ? "Generating..."
              : "Generate Invoice"}
          </button>
        </div>
      </form>

      {/* INVOICE TABLE */}
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <FileText size={24} className="text-blue-600" />

          <h2 className="text-lg font-bold">
            Technician Submitted Invoices
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 py-8 text-slate-600">
            <Loader2
              size={22}
              className="animate-spin"
            />

            Loading invoices...
          </div>
        ) : invoices.length === 0 ? (
          <div className="py-10 text-center text-slate-500">
            <FileText
              size={38}
              className="mx-auto mb-3 text-slate-300"
            />

            <p className="font-semibold">
              No invoices available
            </p>

            <p className="mt-2 text-sm">
              Invoices will appear after technicians complete
              service and submit them.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead>
                <tr className="border-b text-sm text-slate-500">
                  <th className="pb-4">Invoice</th>
                  <th className="pb-4">Booking</th>
                  <th className="pb-4">Quotation</th>
                  <th className="pb-4">Amount</th>
                  <th className="pb-4">Invoice Status</th>
                  <th className="pb-4">Payment</th>
                  <th className="pb-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {invoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="border-b border-slate-100 text-sm"
                  >
                    <td className="py-5 font-bold text-slate-800">
                      #{invoice.id}
                    </td>

                    <td>#{invoice.bookingId}</td>

                    <td>#{invoice.quotationId}</td>

                    <td className="font-semibold">
                      {money(invoice.totalAmount)}
                    </td>

                    <td>
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${invoiceStatusStyle(
                          invoice.invoiceStatus
                        )}`}
                      >
                        {formatStatus(invoice.invoiceStatus)}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                          invoice.paymentStatus === "PAID"
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {formatStatus(invoice.paymentStatus)}
                      </span>
                    </td>

                    <td className="py-4">
                      <div className="flex items-center justify-end gap-2">

                        {/* REVIEW */}
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedInvoice(invoice)
                          }
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <Eye size={16} />
                          Review
                        </button>

                        {/* SEND TO CUSTOMER */}
                        {invoice.invoiceStatus ===
                          "SUBMITTED_TO_ADMIN" && (
                          <button
                            type="button"
                            onClick={() =>
                              handleSendToCustomer(invoice)
                            }
                            disabled={sendingId !== null}
                            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                          >
                            {sendingId === invoice.id ? (
                              <Loader2
                                size={16}
                                className="animate-spin"
                              />
                            ) : (
                              <Send size={16} />
                            )}

                            {sendingId === invoice.id
                              ? "Sending..."
                              : "Send to Customer"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* REVIEW MODAL */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Review invoice"
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                Review Invoice #{selectedInvoice.id}
              </h2>

              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="rounded-lg p-2 hover:bg-slate-100"
                aria-label="Close review"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">
                  Booking ID
                </span>
                <span className="font-semibold">
                  #{selectedInvoice.bookingId}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">
                  Quotation ID
                </span>
                <span className="font-semibold">
                  #{selectedInvoice.quotationId}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">
                  Parts Cost
                </span>
                <span>
                  {money(selectedInvoice.partsCost)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">
                  Labour Cost
                </span>
                <span>
                  {money(selectedInvoice.labourCost)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">
                  Additional Charges
                </span>
                <span>
                  {money(selectedInvoice.additionalCharges)}
                </span>
              </div>

              <div className="flex justify-between border-t pt-4">
                <span className="text-lg font-bold">
                  Total Amount
                </span>
                <span className="text-lg font-bold text-blue-600">
                  {money(selectedInvoice.totalAmount)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">
                  Invoice Status
                </span>
                <span className="font-semibold">
                  {formatStatus(
                    selectedInvoice.invoiceStatus
                  )}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">
                  Payment Status
                </span>
                <span className="font-semibold">
                  {formatStatus(
                    selectedInvoice.paymentStatus
                  )}
                </span>
              </div>
            </div>

            {selectedInvoice.invoiceStatus ===
              "SUBMITTED_TO_ADMIN" && (
              <button
                type="button"
                onClick={() =>
                  handleSendToCustomer(selectedInvoice)
                }
                disabled={sendingId !== null}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
              >
                {sendingId === selectedInvoice.id ? (
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                ) : (
                  <Send size={18} />
                )}

                Send Invoice to Customer
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
