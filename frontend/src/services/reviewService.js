
import axios from "axios";
import { getCustomerToken } from "./authService";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8080"
).replace(/\/$/, "");

function getHeaders() {
  const token = getCustomerToken();

  if (!token) {
    throw new Error("Please login first.");
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function getMyReviews() {
  const response = await axios.get(
    `${API_BASE_URL}/api/customer/reviews`,
    { headers: getHeaders() }
  );

  return response.data;
}

export async function getBookingReview(bookingId) {
  const response = await axios.get(
    `${API_BASE_URL}/api/customer/bookings/${bookingId}/review`,
    { headers: getHeaders() }
  );

  return response.data;
}

export async function submitBookingReview(
  bookingId,
  rating,
  comment
) {
  const response = await axios.post(
    `${API_BASE_URL}/api/customer/bookings/${bookingId}/review`,
    {
      rating: Number(rating),
      comment: comment.trim(),
    },
    { headers: getHeaders() }
  );

  return response.data;
}
