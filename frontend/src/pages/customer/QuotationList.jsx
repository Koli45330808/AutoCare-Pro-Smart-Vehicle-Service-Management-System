
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  LoaderCircle,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

import { getAllBookings } from "../../services/bookingService";
import { getCustomerToken } from "../../services/authService";

const API_URL = "http://localhost:8080";

export default function QuotationList() {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadQuotations() {
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

        const results = await Promise.all(
          bookings.map(async (booking) => {
            const bookingId = booking.id;

            if (!/^[1-9]\d*$/.test(String(bookingId))) {
              return null;
            }

            try {
              const response = await fetch(
                `${API_URL}/api/customer/bookings/${bookingId}/quotation`,
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

              const quotation = await response.json();

              return { bookingId, quotation };
            } catch (err) {
              console.error(
                `Quotation loading failed for booking ${bookingId}`,
                err
              );
              return { failed: true };
            }
          })
        );

        if (!active) return;

        setQuotations(
          results.filter((item) => item?.quotation)
        );

        if (results.some((item) => item?.failed)) {
          setError("Some quotations could not be loaded.");
        }
      } catch (err) {
        if (active) {
          setError(
            err.message || "Unable to load quotations."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadQuotations();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-slate-800">
          My Quotations
        </h1>

        <p className="mb-6 mt-2 text-slate-500">
          View quotations for your vehicle service bookings.
        </p>

        {loading ? (
          <div className="flex items-center gap-3 rounded-xl bg-white p-6">
            <LoaderCircle className="animate-spin" />
            Loading quotations...
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-5 flex gap-3 rounded-xl bg-amber-50 p-4 text-amber-800">
                <AlertCircle size={20} />
                {error}
              </div>
            )}

            {quotations.length === 0 ? (
              <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                <FileText
                  size={44}
                  className="mx-auto text-slate-300"
                />

                <h2 className="mt-4 text-xl font-bold">
                  No Quotations Available
                </h2>

                <p className="mt-2 text-slate-500">
                  Quotations will appear after they are created
                  for your service bookings.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {quotations.map(({ bookingId, quotation }) => (
                  <div
                    key={bookingId}
                    className="flex flex-col justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm md:flex-row md:items-center"
                  >
                    <div>
                      <h2 className="text-lg font-bold">
                        Quotation #{quotation.id}
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Booking #{bookingId}
                      </p>

                      <p className="mt-2 font-semibold text-blue-600">
                        Status: {quotation.status || "UNKNOWN"}
                      </p>
                    </div>

                    <Link
                      to={`/customer/quotation/${bookingId}`}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                    >
                      View Quotation
                      <ArrowRight size={18} />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
