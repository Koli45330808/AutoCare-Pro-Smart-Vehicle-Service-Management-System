
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  Send,
  LoaderCircle,
  CheckCircle2,
  Clock3,
  AlertCircle,
} from "lucide-react";

import { getAllBookings } from "../../services/bookingService";

import {
  getMyReviews,
  submitBookingReview,
} from "../../services/reviewService";

export default function Reviews() {
  const { id } = useParams();

  const [booking, setBooking] = useState(null);
  const [savedReview, setSavedReview] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isCompleted =
    String(booking?.status || "").toUpperCase() ===
    "COMPLETED";

  useEffect(() => {
    let active = true;

    async function loadReview() {
      setLoading(true);
      setError("");
      setBooking(null);
      setSavedReview(null);
      setRating(0);
      setComment("");

      try {
        const [bookingData, reviewData] = await Promise.all([
          getAllBookings(),
          getMyReviews(),
        ]);

        if (!active) return;

        const bookings = Array.isArray(bookingData)
          ? bookingData
          : Array.isArray(bookingData?.content)
          ? bookingData.content
          : [];

        const reviews = Array.isArray(reviewData)
          ? reviewData
          : [];

        const foundBooking = bookings.find(
          (item) => String(item.id) === String(id)
        );

        if (!foundBooking) {
          throw new Error(
            "Booking not found or you do not have access."
          );
        }

        setBooking(foundBooking);

        // Check existing reviews using the list API.
        // This avoids requesting a missing review (404).
        const existingReview = reviews.find(
          (review) =>
            String(review.bookingId) === String(id)
        );

        if (existingReview) {
          setSavedReview(existingReview);
          setRating(Number(existingReview.rating) || 0);
          setComment(existingReview.comment || "");
        }
      } catch (err) {
        if (!active) return;

        setError(
          err.response?.data?.detail ||
            err.response?.data?.message ||
            err.message ||
            "Unable to load review."
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadReview();

    return () => {
      active = false;
    };
  }, [id]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (saving || savedReview) return;

    if (!isCompleted) {
      setError(
        "You can review only completed services."
      );
      return;
    }

    if (rating < 1 || rating > 5) {
      setError("Please select a rating from 1 to 5.");
      return;
    }

    if (!comment.trim()) {
      setError("Please write your review.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const result = await submitBookingReview(
        id,
        rating,
        comment
      );

      setSavedReview(result);
    } catch (err) {
      const status = err.response?.status;

      if (status === 409) {
        // A review may have been submitted in another tab.
        // Refresh the review list to check.
        try {
          const reviews = await getMyReviews();

          const existing = Array.isArray(reviews)
            ? reviews.find(
                (review) =>
                  String(review.bookingId) === String(id)
              )
            : null;

          if (existing) {
            setSavedReview(existing);
            setRating(Number(existing.rating) || 0);
            setComment(existing.comment || "");
            setError("");
            return;
          }
        } catch (refreshError) {
          console.error(
            "Could not refresh reviews:",
            refreshError
          );
        }

        setError(
          "The service completion record may be missing. " +
            "Please contact the service center."
        );
      } else if (status === 401 || status === 403) {
        setError(
          "Your session may have expired. Please log in again."
        );
      } else if (status === 404) {
        setError(
          "Booking not found or access denied."
        );
      } else {
        setError(
          err.response?.data?.detail ||
            err.response?.data?.message ||
            err.message ||
            "Unable to submit review."
        );
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 p-10 text-slate-600">
        <LoaderCircle
          size={24}
          className="animate-spin"
        />
        Loading review...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <Link
          to="/customer/reviews"
          className="inline-flex items-center gap-2 font-semibold text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft size={18} />
          Back to My Reviews
        </Link>

        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            {savedReview
              ? "Your Service Review"
              : "Rate Your Service"}
          </h1>

          <p className="mt-2 text-slate-500">
            Share your experience with our vehicle
            service team.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
          >
            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0"
            />
            <span>{error}</span>
          </div>
        )}

        {booking && (
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800">
              Booking #{booking.id}
            </h2>

            <div className="mt-3 space-y-2 text-slate-600">
              <p>
                <strong>Service:</strong>{" "}
                {booking.serviceType || "Vehicle Service"}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={
                    isCompleted
                      ? "font-semibold text-green-600"
                      : "font-semibold text-amber-600"
                  }
                >
                  {booking.status || "UNKNOWN"}
                </span>
              </p>

              {booking.serviceDate && (
                <p>
                  <strong>Date:</strong>{" "}
                  {booking.serviceDate}
                </p>
              )}
            </div>
          </div>
        )}

        {booking && !savedReview && !isCompleted && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
            <div className="flex items-center gap-3">
              <Clock3
                size={26}
                className="text-amber-600"
              />

              <h2 className="text-lg font-bold text-amber-800">
                Review Not Available Yet
              </h2>
            </div>

            <p className="mt-3 text-amber-700">
              Your service is currently{" "}
              <strong>{booking.status}</strong>.
              You can submit a review only after the
              service is completed.
            </p>

            <Link
              to="/customer/service-history"
              className="mt-5 inline-flex rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              View Service History
            </Link>
          </div>
        )}

        {booking && savedReview && (
          <div className="rounded-xl border border-green-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <CheckCircle2
                size={27}
                className="text-green-600"
              />

              <h2 className="text-xl font-bold text-green-700">
                Review Submitted
              </h2>
            </div>

            <p className="mt-3 text-slate-600">
              Your review has been saved successfully.
            </p>

            <div className="mt-5 flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={30}
                  className={
                    star <= Number(savedReview.rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-slate-300"
                  }
                />
              ))}
            </div>

            <div className="mt-5 rounded-xl bg-slate-50 p-4">
              <p className="font-semibold text-slate-700">
                Your Comment
              </p>

              <p className="mt-2 whitespace-pre-wrap text-slate-600">
                {savedReview.comment}
              </p>
            </div>
          </div>
        )}

        {booking && isCompleted && !savedReview && (
          <form
            onSubmit={handleSubmit}
            className="rounded-xl bg-white p-6 shadow-sm"
          >
            <h2 className="text-lg font-bold text-slate-800">
              How was your experience?
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Select a rating from 1 to 5 stars.
            </p>

            <div className="mt-5 flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  aria-label={`${star} stars`}
                  aria-pressed={rating === star}
                  onClick={() => setRating(star)}
                  disabled={saving}
                  className="rounded-lg p-1 transition hover:scale-110 disabled:opacity-50"
                >
                  <Star
                    size={34}
                    className={
                      star <= rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-slate-300"
                    }
                  />
                </button>
              ))}
            </div>

            <p className="mt-3 text-sm font-semibold text-slate-600">
              {rating === 1 && "Very Poor"}
              {rating === 2 && "Poor"}
              {rating === 3 && "Average"}
              {rating === 4 && "Good"}
              {rating === 5 && "Excellent"}
            </p>

            <div className="mt-6">
              <label
                htmlFor="review-comment"
                className="block font-semibold text-slate-700"
              >
                Your Review
              </label>

              <textarea
                id="review-comment"
                value={comment}
                onChange={(event) =>
                  setComment(event.target.value)
                }
                maxLength={2000}
                rows={5}
                disabled={saving}
                placeholder="Write your service experience..."
                className="mt-3 w-full resize-none rounded-xl border border-slate-300 p-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <button
              type="submit"
              disabled={
                saving ||
                rating === 0 ||
                !comment.trim()
              }
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <LoaderCircle
                  size={19}
                  className="animate-spin"
                />
              ) : (
                <Send size={19} />
              )}

              {saving
                ? "Submitting..."
                : "Submit Review"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
