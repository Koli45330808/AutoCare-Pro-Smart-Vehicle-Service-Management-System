
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CreditCard,
  CheckCircle2,
  Clock3,
  AlertCircle,
  LoaderCircle,
  ArrowRight,
} from "lucide-react";

import { getAllBookings } from "../../services/bookingService";
import { getCustomerToken } from "../../services/authService";

const API_URL = "http://localhost:8080";

const formatMoney = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(value || 0));

export default function MyPayments() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadPayments() {
      try {
        setLoading(true);
        setError("");

        const token = getCustomerToken();

        if (!token) {
          throw new Error("Please log in again.");
        }

        const result = await getAllBookings();

        const bookings = Array.isArray(result)
          ? result
          : Array.isArray(result?.content)
          ? result.content
          : [];

        const checked = await Promise.all(
          bookings.map(async (booking) => {
            const bookingId = booking.id;

            if (!/^[1-9]\d*$/.test(String(bookingId))) {
              return null;
            }

            try {
              const response = await fetch(
                `${API_URL}/api/customer/bookings/${bookingId}/invoice`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                  },
                }
              );

              if (response.status === 404) return null;

              if (!response.ok) {
                return { failed: true };
              }

              const invoice = await response.json();

              return { bookingId, invoice };
            } catch {
              return { failed: true };
            }
          })
        );

        if (!active) return;

        setRecords(
          checked.filter((item) => item?.invoice)
        );

        if (checked.some((item) => item?.failed)) {
          setError(
            "Some payment records could not be checked."
          );
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Unable to load payments.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadPayments();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800">
            My Payments
          </h1>
          <p className="mt-2 text-slate-500">
            View payment status for your generated invoices.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 rounded-2xl bg-white p-6 shadow-sm">
            <LoaderCircle
              size={22}
              className="animate-spin text-blue-600"
            />
            Loading payment records...
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-5 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
                <AlertCircle size={20} />
                {error}
              </div>
            )}

            {records.length === 0 ? (
              <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                <CreditCard
                  size={42}
                  className="mx-auto text-slate-300"
                />

                <h2 className="mt-4 text-xl font-bold">
                  No Payment Records Found
                </h2>

                <p className="mt-2 text-slate-500">
                  No invoices were found in the bookings checked.
                  Payment status becomes available when an invoice
                  is generated.
                </p>

                <Link
                  to="/customer/bookings"
                  className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white"
                >
                  View Bookings
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {records.map(({ bookingId, invoice }) => {
                  const paid =
                    String(invoice.paymentStatus || "")
                      .toUpperCase() === "PAID";

                  return (
                    <div
                      key={bookingId}
                      className="flex flex-col justify-between gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center"
                    >
                      <div className="flex items-start gap-4">
                        <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                          <CreditCard size={25} />
                        </div>

                        <div>
                          <h2 className="text-lg font-bold text-slate-800">
                            Booking #{bookingId}
                          </h2>

                          <p className="mt-1 text-sm text-slate-500">
                            Invoice #{invoice.id}
                          </p>

                          <p className="mt-2 text-xl font-bold text-blue-600">
                            {formatMoney(invoice.totalAmount)}
                          </p>

                          <div className="mt-2 flex items-center gap-2">
                            {paid ? (
                              <CheckCircle2
                                size={18}
                                className="text-green-600"
                              />
                            ) : (
                              <Clock3
                                size={18}
                                className="text-amber-600"
                              />
                            )}

                            <span
                              className={`text-sm font-bold ${
                                paid
                                  ? "text-green-700"
                                  : "text-amber-700"
                              }`}
                            >
                              {invoice.paymentStatus || "UNKNOWN"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <Link
                        to={`/customer/payment/${bookingId}`}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                      >
                        View Payment
                        <ArrowRight size={18} />
                      </Link>
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
