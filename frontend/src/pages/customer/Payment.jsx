
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Receipt,
  IndianRupee,
  AlertCircle,
  RefreshCw,
  ClipboardList,
} from "lucide-react";

import { getCustomerToken } from "../../services/authService";

const API_URL = "http://localhost:8080";

const formatMoney = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(amount || 0));

function DetailRow({ label, value, strong = false }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-3">
      <span className="text-sm text-slate-500">{label}</span>

      <span
        className={`text-right ${
          strong
            ? "text-lg font-bold text-blue-600"
            : "text-sm font-semibold text-slate-800"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export default function Payment() {
  const { id } = useParams();

  const bookingId = String(id || "").trim();
  const validBookingId = /^[1-9]\d*$/.test(bookingId);

  const [invoice, setInvoice] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadPaymentDetails() {
      if (!validBookingId) {
        setError("A valid numeric Booking ID is required.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        setInvoice(null);
        setPayment(null);

        const token = getCustomerToken();

        if (!token) {
          throw new Error("Please log in to view your payment.");
        }

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const [invoiceResult, paymentResult] =
          await Promise.allSettled([
            axios.get(
              `${API_URL}/api/customer/bookings/${bookingId}/invoice`,
              config
            ),
            axios.get(
              `${API_URL}/api/customer/bookings/${bookingId}/payment`,
              config
            ),
          ]);

        if (!active) return;

        if (invoiceResult.status === "rejected") {
          throw invoiceResult.reason;
        }

        setInvoice(invoiceResult.value.data);

        if (paymentResult.status === "fulfilled") {
          setPayment(paymentResult.value.data);
        } else {
          console.warn(
            "Payment details unavailable:",
            paymentResult.reason
          );
        }
      } catch (err) {
        console.error("Payment loading error:", err);

        if (!active) return;

        setError(
          err.message === "Please log in to view your payment."
            ? err.message
            : err.response?.status === 404
            ? "No invoice was found for this booking."
            : err.response?.status === 401 ||
              err.response?.status === 403
            ? "Your session has expired or access was denied. Please log in again."
            : "Unable to load payment details. Check your backend connection."
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    loadPaymentDetails();

    return () => {
      active = false;
    };
  }, [bookingId, validBookingId]);

  const status = String(
    payment?.paymentStatus ||
    payment?.status ||
    invoice?.paymentStatus ||
    "UNKNOWN"
  ).toUpperCase();

  const isPaid = status === "PAID";

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-3 text-slate-500">
        <RefreshCw size={22} className="animate-spin" />
        Loading payment details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 text-center shadow-sm">
        <AlertCircle
          size={40}
          className="mx-auto text-red-500"
        />

        <h1 className="mt-4 text-2xl font-bold text-red-700">
          Payment Details Unavailable
        </h1>

        <p className="mt-3 text-slate-600">{error}</p>

        <Link
          to="/customer/bookings"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white"
        >
          <ArrowLeft size={18} />
          View My Bookings
        </Link>
      </div>
    );
  }

  if (!invoice) return null;

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="mx-auto max-w-5xl">

        <Link
          to={`/customer/invoice/${bookingId}`}
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft size={18} />
          Back to Invoice
        </Link>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800">
            Payment Details
          </h1>

          <p className="mt-2 text-slate-500">
            Booking #{bookingId} — Invoice #{invoice.id}
          </p>
        </div>

        {/* PAYMENT STATUS */}
        <div
          className={`mb-6 rounded-2xl border p-6 ${
            isPaid
              ? "border-green-200 bg-green-50"
              : "border-amber-200 bg-amber-50"
          }`}
        >
          <div className="flex items-center gap-3">
            {isPaid ? (
              <CheckCircle2
                size={32}
                className="text-green-600"
              />
            ) : (
              <AlertCircle
                size={32}
                className="text-amber-600"
              />
            )}

            <div>
              <h2 className="text-xl font-bold text-slate-800">
                {isPaid
                  ? "Payment Completed"
                  : "Payment Status"}
              </h2>

              <p className="mt-1 text-sm font-semibold text-slate-600">
                {status.replaceAll("_", " ")}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">

          {/* INVOICE SUMMARY */}
          <div className="rounded-2xl bg-white p-6 shadow-sm lg:col-span-2">
            <div className="mb-5 flex items-center gap-3">
              <Receipt size={24} className="text-blue-600" />

              <h2 className="text-xl font-bold text-slate-800">
                Invoice Summary
              </h2>
            </div>

            <DetailRow
              label="Booking ID"
              value={`#${invoice.bookingId}`}
            />

            <DetailRow
              label="Invoice ID"
              value={`#${invoice.id}`}
            />

            <DetailRow
              label="Quotation ID"
              value={`#${invoice.quotationId ?? "N/A"}`}
            />

            <DetailRow
              label="Parts Cost"
              value={formatMoney(invoice.partsCost)}
            />

            <DetailRow
              label="Labour Cost"
              value={formatMoney(invoice.labourCost)}
            />

            <DetailRow
              label="Additional Charges"
              value={formatMoney(invoice.additionalCharges)}
            />

            <DetailRow
              label="Total Amount"
              value={formatMoney(invoice.totalAmount)}
              strong
            />
          </div>

          {/* PAYMENT INFO */}
          <div className="space-y-5">

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <IndianRupee
                  size={23}
                  className="text-blue-600"
                />

                <h2 className="text-lg font-bold text-slate-800">
                  Payment Information
                </h2>
              </div>

              <DetailRow
                label="Amount"
                value={formatMoney(invoice.totalAmount)}
              />

              <DetailRow
                label="Status"
                value={status}
              />

              {payment?.paymentMethod && (
                <DetailRow
                  label="Method"
                  value={payment.paymentMethod}
                />
              )}

              {payment?.transactionId && (
                <DetailRow
                  label="Transaction"
                  value={payment.transactionId}
                />
              )}

              {payment?.paidAt && (
                <DetailRow
                  label="Paid At"
                  value={String(payment.paidAt)}
                />
              )}
            </div>

            <div className="rounded-2xl bg-blue-50 p-5">
              <div className="flex gap-3">
                <ShieldCheck
                  size={22}
                  className="shrink-0 text-blue-600"
                />

                <div>
                  <h3 className="font-bold text-blue-800">
                    Payment Verification
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-blue-700">
                    Payment information is read from your
                    backend. This page does not charge your
                    account or simulate a successful transaction.
                  </p>
                </div>
              </div>
            </div>

            <Link
              to="/customer/bookings"
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              <ClipboardList size={18} />
              My Bookings
            </Link>
          </div>
        </div>

        {/* NEXT ACTION */}
        {!isPaid && (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <h3 className="font-bold text-amber-800">
              Payment Not Confirmed
            </h3>

            <p className="mt-2 text-sm leading-6 text-amber-700">
              This page is currently read-only. A verified
              payment API or payment gateway integration is
              required before online payments can be processed.
            </p>
          </div>
        )}

        {isPaid && (
          <div className="mt-6 text-center">
            <Link
              to="/customer/service-history"
              className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
            >
              <CheckCircle2 size={19} />
              View Service History
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
