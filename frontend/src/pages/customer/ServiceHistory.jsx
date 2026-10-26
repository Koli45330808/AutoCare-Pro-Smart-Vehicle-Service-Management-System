
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getCustomerToken } from "../../services/authService";

const API_URL = "http://localhost:8080";

export default function ServiceHistory() {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadHistory() {
      setLoading(true);
      setError("");
      setHistory([]);

      try {
        if (bookingId && !/^\d+$/.test(bookingId)) {
          throw new Error("Invalid booking ID.");
        }

        const token = getCustomerToken();

        if (!token) {
          throw new Error(
            "Your login session is missing. Please log in again."
          );
        }

        const endpoint = bookingId
          ? `/api/customer/service-history/booking/${bookingId}`
          : "/api/customer/service-history";

        const response = await fetch(`${API_URL}${endpoint}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error(
              "Your session has expired. Please log in again."
            );
          }

          if (response.status === 403) {
            throw new Error(
              "You do not have permission to view this service history."
            );
          }

          if (response.status === 404) {
            throw new Error(
              "Service history not found. The service may not be completed yet."
            );
          }

          throw new Error(
            `Unable to load service history (HTTP ${response.status}).`
          );
        }

        const data = await response.json();

        setHistory(Array.isArray(data) ? data : [data]);
      } catch (err) {
        if (err.name !== "AbortError" && !controller.signal.aborted) {
          setError(err.message || "Something went wrong.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadHistory();

    return () => controller.abort();
  }, [bookingId]);

  const formatMoney = (amount) => {
    if (amount == null) {
      return "N/A";
    }

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) {
      return "N/A";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "N/A";
    }

    return parsedDate.toLocaleString("en-IN");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Vehicle Service History
          </h1>

          <p className="text-gray-500 mt-1">
            View your completed vehicle services, repairs,
            invoices, and payment details.
          </p>
        </div>

        {bookingId && (
          <Link
            to="/customer/service-history"
            className="text-blue-600 hover:underline"
          >
            View All History
          </Link>
        )}
      </div>

      {loading && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-gray-500">
            Loading service history...
          </p>
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          <p>{error}</p>

          <Link
            to="/customer/my-bookings"
            className="underline mt-3 inline-block"
          >
            Back to My Bookings
          </Link>
        </div>
      )}

      {!loading && !error && history.length === 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-gray-500">
            No completed service history found.
          </p>

          <Link
            to="/customer/my-bookings"
            className="text-blue-600 hover:underline mt-3 inline-block"
          >
            View My Bookings
          </Link>
        </div>
      )}

      {!loading && !error && history.length > 0 && (
        <div className="space-y-5">
          {history.map((item) => (
            <div
              key={item.bookingId}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Booking #{item.bookingId}
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Completed: {formatDate(item.completedAt)}
                  </p>
                </div>

                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                  {item.bookingStatus}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <p className="text-sm text-gray-500">
                    Problem Found
                  </p>
                  <p className="font-medium text-gray-800 mt-1">
                    {item.problemFound ?? "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Recommended Repair
                  </p>
                  <p className="font-medium text-gray-800 mt-1">
                    {item.recommendedRepair ?? "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Work Performed
                  </p>
                  <p className="font-medium text-gray-800 mt-1">
                    {item.workPerformed ?? "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Technician Notes
                  </p>
                  <p className="font-medium text-gray-800 mt-1">
                    {item.technicianNotes ?? "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Technician ID
                  </p>
                  <p className="font-medium text-gray-800 mt-1">
                    {item.technicianId ?? "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Invoice ID
                  </p>
                  <p className="font-medium text-gray-800 mt-1">
                    {item.invoiceId ?? "Not generated"}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-5">
                <div className="flex flex-wrap items-start justify-between gap-5">
                  <div>
                    <p className="text-sm text-gray-500">
                      Total Amount
                    </p>

                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {formatMoney(item.totalAmount)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Payment Status
                    </p>

                    <span
                      className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${
                        item.paymentStatus === "PAID"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {item.paymentStatus ?? "N/A"}
                    </span>

                    <p className="text-sm text-gray-500 mt-2">
                      Payment Method:{" "}
                      {item.paymentMethod ?? "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {!bookingId && (
                <div className="border-t border-gray-100 pt-4">
                  <Link
                    to={`/customer/service-history?bookingId=${item.bookingId}`}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    View Service Details →
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div>
        <Link
          to="/customer/my-bookings"
          className="text-blue-600 hover:underline"
        >
          ← Back to My Bookings
        </Link>
      </div>
    </div>
  );
}
