
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  Wallet,
  Receipt,
  IndianRupee,
  Loader2,
} from "lucide-react";

import {
  getAdminInvoices,
  getAdminPayments,
  recordAdminPayment,
} from "../../services/adminInvoiceService";

// =====================================
// HELPERS
// =====================================

function money(value) {
  return Number(value ?? 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
  });
}

function errorMessage(error) {
  if (error.response?.status === 401) {
    return "Admin session expired. Please log in again.";
  }

  if (error.response?.status === 403) {
    return "Access denied. Admin permission is required.";
  }

  if (error.response?.status === 409) {
    return (
      error.response?.data?.detail ||
      error.response?.data?.message ||
      "This invoice cannot be paid again or is not ready for payment."
    );
  }

  return (
    error.response?.data?.detail ||
    error.response?.data?.message ||
    error.message ||
    "Request failed. Please try again."
  );
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

// =====================================
// ADMIN PAYMENTS COMPONENT
// =====================================

export default function AdminPayments() {
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);

  const [invoiceId, setInvoiceId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [transactionReference, setTransactionReference] =
    useState("");

  const [verified, setVerified] = useState(false);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================
  // LOAD INVOICES AND PAYMENTS
  // =====================================

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [invoiceData, paymentData] = await Promise.all([
        getAdminInvoices(),
        getAdminPayments(),
      ]);

      if (!Array.isArray(invoiceData)) {
        throw new Error("Invalid invoice API response.");
      }

      if (!Array.isArray(paymentData)) {
        throw new Error("Invalid payment API response.");
      }

      setInvoices(invoiceData);
      setPayments(paymentData);
      setDataLoaded(true);

      return true;
    } catch (err) {
      setDataLoaded(false);
      setError(errorMessage(err));
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // =====================================
  // ELIGIBLE UNPAID INVOICES
  // =====================================

  const unpaidInvoices = useMemo(() => {
    return invoices.filter(
      (invoice) =>
        invoice.paymentStatus === "UNPAID" &&
        invoice.invoiceStatus === "SENT_TO_CUSTOMER"
    );
  }, [invoices]);

  const selectedInvoice = unpaidInvoices.find(
    (invoice) => String(invoice.id) === invoiceId
  );

  // =====================================
  // PAYMENT STATISTICS
  // =====================================

  const stats = useMemo(() => {
    const successfulPayments = payments.filter(
      (payment) => payment.paymentStatus === "SUCCESS"
    );

    const totalCollected = successfulPayments.reduce(
      (sum, payment) => sum + Number(payment.amount || 0),
      0
    );

    const outstandingInvoices = invoices.filter(
      (invoice) => invoice.paymentStatus === "UNPAID"
    );

    const outstandingAmount = outstandingInvoices.reduce(
      (sum, invoice) =>
        sum + Number(invoice.totalAmount || 0),
      0
    );

    return {
      totalPayments: payments.length,
      totalCollected,
      outstandingAmount,
      unpaidCount: outstandingInvoices.length,
    };
  }, [payments, invoices]);

  // =====================================
  // SEARCH PAYMENT HISTORY
  // =====================================

  const filteredPayments = useMemo(() => {
    const term = search.trim().toLowerCase();

    return payments.filter((payment) => {
      const values = [
        payment.id,
        payment.invoiceId,
        payment.bookingId,
        payment.paymentMethod,
        payment.transactionReference,
        payment.paymentStatus,
      ];

      return values
        .map((value) => String(value ?? ""))
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [payments, search]);

  // =====================================
  // RECORD VERIFIED PAYMENT
  // =====================================

  async function handleRecordPayment(event) {
    event.preventDefault();

    if (saving || loading || !dataLoaded) {
      return;
    }

    if (!selectedInvoice) {
      setError("Select an unpaid invoice sent to the customer.");
      return;
    }

    if (!verified) {
      setError("Confirm that the payment was independently verified.");
      return;
    }

    if (
      paymentMethod !== "CASH" &&
      !transactionReference.trim()
    ) {
      setError("Enter the verified transaction reference.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    let recordedPayment;

    try {
      recordedPayment = await recordAdminPayment({
        invoiceId: selectedInvoice.id,
        amount: selectedInvoice.totalAmount,
        paymentMethod,
        transactionReference:
          paymentMethod === "CASH"
            ? null
            : transactionReference.trim(),
      });
    } catch (err) {
      setError(errorMessage(err));
      setSaving(false);
      return;
    }

    // Payment was recorded successfully.
    // Never automatically retry the POST request.

    setSuccess(
      `Payment #${recordedPayment.id} recorded successfully.`
    );

    setInvoiceId("");
    setPaymentMethod("CASH");
    setTransactionReference("");
    setVerified(false);

    // Refresh data after successful payment.
    const refreshed = await loadData();

    if (!refreshed) {
      setError(
        "Payment was recorded, but refreshing the records failed. Click Refresh to load the latest data."
      );
    }

    setSaving(false);
  }

  // =====================================
  // DASHBOARD CARDS
  // =====================================

  const statCards = [
    {
      label: "Total Payments",
      value: stats.totalPayments,
      icon: Receipt,
      color: "text-blue-600",
      background: "bg-blue-100",
    },
    {
      label: "Amount Collected",
      value: money(stats.totalCollected),
      icon: IndianRupee,
      color: "text-green-600",
      background: "bg-green-100",
    },
    {
      label: "Outstanding Amount",
      value: money(stats.outstandingAmount),
      icon: Wallet,
      color: "text-orange-600",
      background: "bg-orange-100",
    },
    {
      label: "Unpaid Invoices",
      value: stats.unpaidCount,
      icon: CreditCard,
      color: "text-purple-600",
      background: "bg-purple-100",
    },
  ];

  // =====================================
  // UI
  // =====================================

  return (
    <div className="min-h-screen space-y-6 bg-slate-50 p-4 md:p-6">

      {/* HEADER */}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Payment Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Record verified customer payments and view payment history.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          disabled={loading || saving}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw
            size={18}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* ERROR MESSAGE */}

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle size={20} className="shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* SUCCESS MESSAGE */}

      {success && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700"
        >
          <CheckCircle2 size={20} className="shrink-0" />
          <p>{success}</p>
        </div>
      )}

      {/* STATISTICS */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    {card.label}
                  </p>

                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {loading || !dataLoaded ? "..." : card.value}
                  </p>
                </div>

                <div
                  className={`rounded-xl p-3 ${card.background} ${card.color}`}
                >
                  <Icon size={23} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* RECORD PAYMENT FORM */}

      <form
        onSubmit={handleRecordPayment}
        className="space-y-5 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm md:p-6"
      >
        <h2 className="text-lg font-bold text-slate-900">
          Record Verified Payment
        </h2>

        {/* INVOICE SELECT */}

        <div>
          <label
            htmlFor="payment-invoice"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Select Unpaid Invoice
          </label>

          <select
            id="payment-invoice"
            required
            value={invoiceId}
            disabled={loading || saving || !dataLoaded}
            onChange={(event) => {
              setInvoiceId(event.target.value);
              setVerified(false);
            }}
            className="w-full rounded-xl border border-slate-300 p-3 focus:border-blue-500 focus:outline-none"
          >
            <option value="">Select invoice</option>

            {unpaidInvoices.map((invoice) => (
              <option key={invoice.id} value={invoice.id}>
                Invoice #{invoice.id} - Booking #{invoice.bookingId}
                {" - "}
                {money(invoice.totalAmount)}
              </option>
            ))}
          </select>

          {!loading && dataLoaded && unpaidInvoices.length === 0 && (
            <p className="mt-2 text-sm text-slate-500">
              No unpaid invoices sent to customers are available.
            </p>
          )}
        </div>

        {/* SELECTED INVOICE */}

        {selectedInvoice && (
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
            <p className="text-sm text-blue-700">
              Exact Amount Due
            </p>

            <p className="mt-1 text-2xl font-bold text-blue-900">
              {money(selectedInvoice.totalAmount)}
            </p>

            <p className="mt-2 text-xs text-blue-700">
              Invoice #{selectedInvoice.id} - Booking #
              {selectedInvoice.bookingId}
            </p>
          </div>
        )}

        {/* PAYMENT METHOD */}

        <div>
          <label
            htmlFor="payment-method"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Payment Method
          </label>

          <select
            id="payment-method"
            value={paymentMethod}
            disabled={saving}
            onChange={(event) => {
              setPaymentMethod(event.target.value);
              setTransactionReference("");
              setVerified(false);
            }}
            className="w-full rounded-xl border border-slate-300 p-3 focus:border-blue-500 focus:outline-none"
          >
            <option value="CASH">Cash</option>
            <option value="UPI">UPI</option>
            <option value="CARD">Card</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
          </select>
        </div>

        {/* TRANSACTION REFERENCE */}

        {paymentMethod !== "CASH" && (
          <div>
            <label
              htmlFor="transaction-reference"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Transaction Reference
            </label>

            <input
              id="transaction-reference"
              required
              value={transactionReference}
              disabled={saving}
              onChange={(event) => {
                setTransactionReference(event.target.value);
                setVerified(false);
              }}
              placeholder="Enter verified transaction reference"
              className="w-full rounded-xl border border-slate-300 p-3 focus:border-blue-500 focus:outline-none"
            />
          </div>
        )}

        {/* PAYMENT VERIFICATION */}

        <label className="flex items-start gap-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={verified}
            disabled={saving || !selectedInvoice}
            onChange={(event) =>
              setVerified(event.target.checked)
            }
            className="mt-1 h-4 w-4"
          />

          <span>
            I confirm that the full payment was independently verified
            and received for this invoice.
          </span>
        </label>

        {/* SUBMIT BUTTON */}

        <button
          type="submit"
          disabled={
            loading ||
            saving ||
            !dataLoaded ||
            !selectedInvoice ||
            !verified ||
            (paymentMethod !== "CASH" &&
              !transactionReference.trim())
          }
          className="flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <CreditCard size={18} />
          )}

          {saving
            ? "Recording Payment..."
            : "Record Verified Payment"}
        </button>
      </form>

      {/* PAYMENT HISTORY */}

      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm md:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Payment History
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {dataLoaded ? filteredPayments.length : 0} payment records
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search payment or invoice..."
              className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 py-12 text-slate-500">
            <Loader2 size={20} className="animate-spin" />
            Loading payments...
          </div>
        ) : !dataLoaded ? (
          <p className="py-12 text-center text-slate-500">
            Unable to load payment records. Please click Refresh.
          </p>
        ) : filteredPayments.length === 0 ? (
          <p className="py-12 text-center text-slate-500">
            No matching payment records found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-4">Payment</th>
                  <th className="px-4 py-4">Invoice</th>
                  <th className="px-4 py-4">Booking</th>
                  <th className="px-4 py-4">Amount</th>
                  <th className="px-4 py-4">Method</th>
                  <th className="px-4 py-4">Reference</th>
                  <th className="px-4 py-4">Date</th>
                  <th className="px-4 py-4">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredPayments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-4 py-4 font-semibold">
                      #{payment.id}
                    </td>

                    <td className="px-4 py-4">
                      #{payment.invoiceId}
                    </td>

                    <td className="px-4 py-4">
                      #{payment.bookingId}
                    </td>

                    <td className="px-4 py-4 font-semibold">
                      {money(payment.amount)}
                    </td>

                    <td className="px-4 py-4">
                      {payment.paymentMethod}
                    </td>

                    <td className="px-4 py-4">
                      {payment.transactionReference || "-"}
                    </td>

                    <td className="px-4 py-4">
                      {formatDate(payment.paidAt)}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          payment.paymentStatus === "SUCCESS"
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {payment.paymentStatus || "UNKNOWN"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
