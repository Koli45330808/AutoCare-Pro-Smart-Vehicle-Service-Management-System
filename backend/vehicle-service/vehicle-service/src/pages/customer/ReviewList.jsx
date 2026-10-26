
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star, LoaderCircle } from "lucide-react";

import { getAllBookings } from "../../services/bookingService";
import { getMyReviews } from "../../services/reviewService";

export default function ReviewList() {
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [bookingData, reviewData] = await Promise.all([
          getAllBookings(),
          getMyReviews(),
        ]);

        const bookingList = Array.isArray(bookingData)
          ? bookingData
          : bookingData?.content || [];

        if (active) {
          setBookings(bookingList);
          setReviews(Array.isArray(reviewData) ? reviewData : []);
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              "Unable to load reviews."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-8">
        <LoaderCircle className="animate-spin" />
        Loading reviews...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5 p-4">
      <h1 className="text-3xl font-bold text-slate-800">
        My Reviews
      </h1>

      {error && (
        <p className="rounded-xl bg-red-50 p-4 text-red-700">
          {error}
        </p>
      )}

      {!error && bookings.length === 0 && (
        <p className="rounded-xl bg-white p-6">
          No service bookings found.
        </p>
      )}

      {bookings.map((booking) => {
        const existing = reviews.find(
          (review) => review.bookingId === booking.id
        );

        return (
          <div
            key={booking.id}
            className="flex flex-col justify-between gap-4 rounded-xl bg-white p-5 shadow-sm sm:flex-row sm:items-center"
          >
            <div>
              <h2 className="font-bold">
                Booking #{booking.id}
              </h2>
              <p className="text-sm text-slate-500">
                {booking.serviceType}
              </p>
              <p className="text-sm">
                Status: {booking.status}
              </p>
              <p className="mt-2 text-sm font-semibold">
                {existing
                  ? `Reviewed: ${existing.rating}/5 stars`
                  : booking.status === "COMPLETED"
                  ? "Review may be available"
                  : "Awaiting service completion"}
              </p>
            </div>

            <Link
              to={`/customer/reviews/${booking.id}`}
              className="rounded-xl bg-blue-600 px-5 py-3 text-center font-semibold text-white"
            >
              <span className="inline-flex items-center gap-2">
                <Star size={17} />
                {existing ? "View Review" : "Open Review"}
              </span>
            </Link>
          </div>
        );
      })}
    </div>
  );
}
