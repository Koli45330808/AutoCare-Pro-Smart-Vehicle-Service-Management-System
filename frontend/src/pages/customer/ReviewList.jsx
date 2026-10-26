
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Star,
  LoaderCircle,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";

import { getAllBookings } from "../../services/bookingService";
import { getMyReviews } from "../../services/reviewService";

export default function ReviewList() {
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadReviews() {
      setLoading(true);
      setError("");

      try {
        const [bookingData, reviewData] = await Promise.all([
          getAllBookings(),
          getMyReviews(),
        ]);

        if (!active) return;

        const bookingList = Array.isArray(bookingData)
          ? bookingData
          : Array.isArray(bookingData?.content)
          ? bookingData.content
          : [];

        const reviewList = Array.isArray(reviewData)
          ? reviewData
          : Array.isArray(reviewData?.content)
          ? reviewData.content
          : [];

        setBookings(bookingList);
        setReviews(reviewList);
      } catch (err) {
        if (!active) return;

        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load reviews."
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadReviews();

    return () => {
      active = false;
    };
  }, []);

  const reviewMap = new Map(
    reviews.map((review) => [
      String(review.bookingId),
      review,
    ])
  );

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100 text-yellow-600">
            <Star size={25} />
          </div>

          <h1 className="text-3xl font-bold text-slate-800">
            My Reviews
          </h1>

          <p className="mt-2 text-slate-500">
            View your reviews and rate completed
            vehicle services.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 rounded-xl bg-white p-6">
            <LoaderCircle
              className="animate-spin text-blue-600"
            />
            Loading reviews...
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-5 flex items-center gap-3 rounded-xl bg-red-50 p-4 text-red-700">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            {!error && bookings.length === 0 && (
              <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                <Star
                  size={44}
                  className="mx-auto text-slate-300"
                />

                <h2 className="mt-4 text-xl font-bold">
                  No Service Bookings Found
                </h2>

                <p className="mt-2 text-slate-500">
                  Your service bookings will appear here.
                </p>
              </div>
            )}

            <div className="space-y-4">
              {bookings.map((booking) => {
                const existingReview = reviewMap.get(
                  String(booking.id)
                );

                const completed =
                  String(booking.status || "")
                    .toUpperCase() === "COMPLETED";

                return (
                  <div
                    key={booking.id}
                    className="flex flex-col justify-between gap-4 rounded-2xl bg-white p-5 shadow-sm sm:flex-row sm:items-center"
                  >
                    <div>
                      <h2 className="text-lg font-bold text-slate-800">
                        Booking #{booking.id}
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        {booking.serviceType ||
                          "Vehicle Service"}
                      </p>

                      <p className="mt-2 text-sm text-slate-600">
                        Status:{" "}
                        <span className="font-semibold">
                          {booking.status || "UNKNOWN"}
                        </span>
                      </p>

                      <div className="mt-3">
                        {existingReview ? (
                          <div className="flex items-center gap-2 text-green-700">
                            <CheckCircle2 size={18} />
                            <span className="font-semibold">
                              Reviewed:{" "}
                              {existingReview.rating}/5 stars
                            </span>
                          </div>
                        ) : completed ? (
                          <div className="flex items-center gap-2 text-blue-700">
                            <Star size={18} />
                            <span className="font-semibold">
                              Ready for review
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-amber-700">
                            <Clock size={18} />
                            <span className="font-semibold">
                              Awaiting service completion
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {existingReview ? (
                      <Link
                        to={`/customer/reviews/${booking.id}`}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
                      >
                        <Star size={18} />
                        View Review
                      </Link>
                    ) : completed ? (
                      <Link
                        to={`/customer/reviews/${booking.id}`}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                      >
                        <Star size={18} />
                        Write Review
                      </Link>
                    ) : (
                      <span className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-slate-200 px-5 py-3 font-semibold text-slate-500">
                        <Clock size={18} />
                        Not Available Yet
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
