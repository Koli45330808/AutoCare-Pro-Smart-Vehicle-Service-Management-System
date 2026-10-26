
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CreditCard,
  Download,
  FileText,
  Receipt,
  AlertCircle,
  LoaderCircle,
  CheckCircle2,
} from "lucide-react";

import { getCustomerToken } from "../../services/authService";

const API_URL = "http://localhost:8080";

function formatMoney(amount) {
  if (amount == null) return "N/A";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(amount));
}

function formatDate(value) {
  if (!value) return "N/A";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "N/A";

  return date.toLocaleString("en-IN");
}

export default function Invoice() {
  const { id } = useParams();

  const bookingId = String(id || "").trim();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadInvoice() {
      setInvoice(null);
      setError("");
      setLoading(true);

      if (!/^[1-9]\d*$/.test(bookingId)) {
        setError("A valid numeric Booking ID is required.");
        setLoading(false);
        return;
      }

      const token = getCustomerToken();

      if (!token) {
        setError("Please log in to view your invoice.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/api/customer/bookings/${bookingId}/invoice`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error(
              "Your session has expired. Please log in again."
            );
          }

          if (response.status === 403) {
            throw new Error(
              "You do not have permission to view this invoice."
            );
          }

          if (response.status === 404) {
            throw new Error(
              "Invoice not found for this booking."
            );
          }

          throw new Error(
            `Unable to load invoice. HTTP ${response.status}`
          );
        }

        const data = await response.json();

        if (!data || data.id == null) {
          throw new Error("Invalid invoice data received.");
        }

        if (!controller.signal.aborted) {
          setInvoice(data);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(
            err.message || "Failed to load invoice."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadInvoice();

    return () => controller.abort();
  }, [bookingId]);

  const isPaid =
    String(invoice?.paymentStatus || "").toUpperCase() ===
    "PAID";

  const items = invoice
    ? [
        {
          name: "Parts Cost",
          amount: invoice.partsCost,
        },
        {
          name: "Labour Cost",
          amount: invoice.labourCost,
        },
        {
          name: "Additional Charges",
          amount: invoice.additionalCharges,
        },
      ]
    : [];

  return (
    <div className="min-h-screen space-y-6 bg-slate-100 p-4 md:p-6">
      {/* BACK LINK */}
      <div className="print:hidden">
        <Link
          to="/customer/invoices"
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft size={18} />
          Back to Invoices
        </Link>
      </div>

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          Service Invoice
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Your vehicle service invoice and payment details.
        </p>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="flex items-center gap-3 rounded-2xl bg-white p-6 shadow-sm">
          <LoaderCircle
            size={22}
            className="animate-spin text-blue-600"
          />

          <p className="text-slate-600">
            Loading invoice...
          </p>
        </div>
      )}

      {/* ERROR */}
      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle
              size={22}
              className="shrink-0 text-red-600"
            />

            <div>
              <h2 className="font-bold text-red-800">
                Unable to Display Invoice
              </h2>

              <p className="mt-2 text-sm text-red-700">
                {error}
              </p>
            </div>
          </div>

          <Link
            to="/customer/invoices"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            View My Invoices
            <ArrowLeft size={17} />
          </Link>
        </div>
      )}

      {/* INVOICE DETAILS */}
      {!loading && !error && invoice && (
        <>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            {/* INVOICE TOP */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                  <FileText size={26} />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    Invoice #{invoice.id}
                  </h2>

                  <p className="text-sm text-slate-500">
                    Booking #{invoice.bookingId}
                  </p>
                </div>
              </div>

              <span
                className={`rounded-full px-4 py-2 text-sm font-bold ${
                  isPaid
                    ? "bg-green-100 text-green-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {invoice.paymentStatus || "UNKNOWN"}
              </span>
            </div>

            {/* INVOICE INFORMATION */}
            <div className="grid gap-5 border-b border-slate-200 p-6 md:grid-cols-3">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Booking ID
                </p>

                <p className="mt-2 font-semibold text-slate-800">
                  #{invoice.bookingId}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Quotation ID
                </p>

                <p className="mt-2 font-semibold text-slate-800">
                  {invoice.quotationId != null
                    ? `#${invoice.quotationId}`
                    : "N/A"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Generated At
                </p>

                <p className="mt-2 font-semibold text-slate-800">
                  {formatDate(invoice.generatedAt)}
                </p>
              </div>
            </div>

            {/* COST TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px]">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-600">
                      Description
                    </th>

                    <th className="px-6 py-4 text-right text-sm font-bold text-slate-600">
                      Amount
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((item) => (
                    <tr
                      key={item.name}
                      className="border-t border-slate-100"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <Receipt
                            size={18}
                            className="text-blue-500"
                          />

                          <span className="font-medium text-slate-700">
                            {item.name}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-5 text-right font-semibold text-slate-800">
                        {formatMoney(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* TOTAL */}
            <div className="border-t border-slate-200 bg-slate-50 p-6">
              <div className="ml-auto flex max-w-sm items-center justify-between gap-4">
                <span className="text-lg font-bold text-slate-800">
                  Total Amount
                </span>

                <span className="text-2xl font-bold text-blue-600">
                  {formatMoney(invoice.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* PAYMENT INFORMATION */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-green-100 p-3 text-green-600">
                  <CreditCard size={22} />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    Payment Information
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {isPaid
                      ? "Payment has been recorded successfully."
                      : "Payment has not yet been recorded as paid."}
                  </p>
                </div>
              </div>

              <span
                className={`rounded-full px-4 py-2 font-bold ${
                  isPaid
                    ? "bg-green-100 text-green-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {invoice.paymentStatus || "UNKNOWN"}
              </span>
            </div>

            <div className="mt-6 rounded-xl bg-blue-50 p-5">
              <p className="text-sm font-medium text-blue-600">
                Total Invoice Amount
              </p>

              <p className="mt-2 text-2xl font-bold text-blue-700">
                {formatMoney(invoice.totalAmount)}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3 print:hidden">
              <Link
                to={`/customer/payment/${bookingId}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-300 bg-blue-50 px-5 py-3 font-semibold text-blue-700 hover:bg-blue-100"
              >
                {isPaid && <CheckCircle2 size={18} />}
                <CreditCard size={18} />
                View Payment Details
              </Link>

              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
              >
                <Download size={18} />
                Print / Save as PDF
              </button>
            </div>
          </section>

          <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5">
            <FileText
              size={20}
              className="mt-1 shrink-0 text-slate-400"
            />

            <p className="text-sm leading-6 text-slate-500">
              This invoice displays the charges and payment
              status recorded in the Smart Vehicle Service
              Management System.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
