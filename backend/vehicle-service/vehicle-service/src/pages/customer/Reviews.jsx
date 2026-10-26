
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  Send,
  LoaderCircle,
} from "lucide-react";

import { getAllBookings } from "../../services/bookingService";
import {
  getBookingReview,
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

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        setError("");
        setBooking(null);
        setSavedReview(null);

        const bookings = await getAllBookings();
        const list = Array.isArray(bookings)
          ? bookings
          : bookings?.content || [];

        const found = list.find(
          (item) => String(item.id) === String(id)
        );

        if (!found) {
          throw new Error("Booking not found.");
        }

        if (active) setBooking(found);

        try {
          const existing = await getBookingReview(id);

          if (active) {
            setSavedReview(existing);
            setRating(existing.rating);
            setComment(existing.comment);
          }
        } catch (err) {
          if (err.response?.status !== 404) {
            throw err;
          }
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Unable to load review."
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
  }, [id]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!rating || !comment.trim()) {
      setError("Please select a rating and write a review.");
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
      setError(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          "Unable to submit review. Make sure the service is completed."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-8">
        <LoaderCircle className="animate-spin" />
        Loading review...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4">
      <Link
        to="/customer/reviews"
        className="inline-flex items-center gap-2 text-blue-600"
      >
        <ArrowLeft size={18} />
        Back to My Reviews
      </Link>

      <h1 className="text-3xl font-bold text-slate-800">
        {savedReview ? "Your Service Review" : "Rate Your Service"}
      </h1>

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">
          {error}
        </p>
      )}

      {booking && (
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="font-bold">
            Booking #{booking.id}
          </h2>
          <p>Service: {booking.serviceType}</p>
          <p>Status: {booking.status}</p>
          <p>Date: {booking.serviceDate}</p>
        </div>
      )}

      {booking && savedReview && (
        <div className="rounded-xl border border-green-200 bg-white p-6">
          <p className="font-semibold text-green-700">
            Review saved successfully
          </p>

          <div className="mt-3 flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={
                  star <= savedReview.rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-slate-300"
                }
              />
            ))}
          </div>

          <p className="mt-4 text-slate-700">
            {savedReview.comment}
          </p>
        </div>
      )}

      {booking && !savedReview && (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl bg-white p-6 shadow-sm"
        >
          <h2 className="font-bold">Your Rating</h2>

          <div className="mt-4 flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                aria-label={`${star} stars`}
                onClick={() => setRating(star)}
              >
                <Star
                  size={32}
                  className={
                    star <= rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-slate-300"
                  }
                />
              </button>
            ))}
          </div>

          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            maxLength={2000}
            rows={5}
            placeholder="Write your service experience..."
            className="mt-6 w-full rounded-xl border p-4"
          />

          <button
            type="submit"
            disabled={saving}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 p-3 font-semibold text-white disabled:opacity-60"
          >
            {saving ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
            {saving ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      )}
    </div>
  );
}
