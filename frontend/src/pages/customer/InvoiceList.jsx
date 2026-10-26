
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Receipt,
  FileText,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

import { getAllBookings } from "../../services/bookingService";
import { getCustomerToken } from "../../services/authService";

const API_URL = "http://localhost:8080";

const money = (amount) => {
  if (amount == null) return "N/A";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(amount));
};

export default function InvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    async function loadInvoices() {
      setLoading(true);
      setError("");
      setInvoices([]);

      try {
        const token = getCustomerToken();

        if (!token) {
          throw new Error(
            "Please log in again to view your invoices."
          );
        }

        const bookingsResult = await getAllBookings();

        if (!active) return;

        const bookings = Array.isArray(bookingsResult)
          ? bookingsResult
          : Array.isArray(bookingsResult?.content)
          ? bookingsResult.content
          : [];

        // Backend creates invoices only after
        // the service is completed.
        const eligibleBookings = bookings.filter((booking) => {
          const status = String(
            booking.status || ""
          ).toUpperCase();

          return (
            status === "COMPLETED" &&
            /^[1-9]\d*$/.test(String(booking.id))
          );
        });

        const results = await Promise.all(
          eligibleBookings.map(async (booking) => {
            try {
              const response = await fetch(
                `${API_URL}/api/customer/bookings/${booking.id}/invoice`,
                {
                  method: "GET",
                  headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                  },
                  signal: controller.signal,
                }
              );

              // Invoice missing or not yet
              // released by Admin.
              if (response.status === 404) {
                return null;
              }

              if (response.status === 401) {
                throw new Error(
                  "Session expired. Please log in again."
                );
              }

              if (response.status === 403) {
                throw new Error(
                  "Access denied. Check your customer login."
                );
              }

              if (!response.ok) {
                throw new Error(
                  `Invoice request failed (HTTP ${response.status}).`
                );
              }

              const invoice = await response.json();

              return {
                booking,
                invoice,
              };
            } catch (err) {
              if (err.name === "AbortError") {
                return null;
              }

              console.error(
                `Invoice loading failed for booking ${booking.id}:`,
                err
              );

              return {
                failed: true,
                message: err.message,
              };
            }
          })
        );

        if (!active) return;

        setInvoices(
          results.filter((item) => item?.invoice)
        );

        const failed = results.find(
          (item) => item?.failed
        );

        if (failed) {
          setError(
            failed.message ||
              "Some invoices could not be loaded."
          );
        }
      } catch (err) {
        if (active) {
          setError(
            err.message || "Unable to load invoices."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadInvoices();

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <Receipt size={25} />
          </div>

          <h1 className="text-3xl font-bold text-slate-800">
            My Invoices
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            View invoices released by Admin for your
            completed vehicle services.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 rounded-2xl bg-white p-8 text-slate-600 shadow-sm">
            <RefreshCw
              size={20}
              className="animate-spin text-blue-600"
            />
            Loading invoices...
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                <AlertCircle
                  size={20}
                  className="shrink-0"
                />
                <span>{error}</span>
              </div>
            )}

            {invoices.length === 0 ? (
              <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                <FileText
                  size={44}
                  className="mx-auto text-slate-300"
                />

                <h2 className="mt-4 text-xl font-bold text-slate-800">
                  No Invoices Available
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Your invoices will appear after the
                  vehicle service is completed and Admin
                  releases the invoice.
                </p>

                <Link
                  to="/customer/my-bookings"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                >
                  View My Bookings
                  <ArrowRight size={18} />
                </Link>
              </div>
            ) : (
              <div className="grid gap-4">
                {invoices.map(({ booking, invoice }) => {
                  const paid =
                    String(
                      invoice.paymentStatus || ""
                    ).toUpperCase() === "PAID";

                  return (
                    <div
                      key={invoice.id}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6"
                    >
                      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-start gap-4">
                          <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                            <Receipt size={24} />
                          </div>

                          <div>
                            <h2 className="text-lg font-bold text-slate-800">
                              Invoice #{invoice.id}
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                              Booking #
                              {invoice.bookingId || booking.id}
                            </p>

                            <p className="mt-2 text-xl font-bold text-blue-600">
                              {money(invoice.totalAmount)}
                            </p>

                            <div className="mt-2 flex items-center gap-2">
                              {paid && (
                                <CheckCircle2
                                  size={16}
                                  className="text-green-600"
                                />
                              )}

                              <span
                                className={`rounded-full px-3 py-1 text-xs font-bold ${
                                  paid
                                    ? "bg-green-100 text-green-700"
                                    : "bg-amber-100 text-amber-700"
                                }`}
                              >
                                {invoice.paymentStatus || "UNKNOWN"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <Link
                          to={`/customer/invoice/${booking.id}`}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                        >
                          <FileText size={18} />
                          View Invoice
                          <ArrowRight size={16} />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
