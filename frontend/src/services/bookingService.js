
import axios from "axios";
import { getCustomerToken } from "./authService";

const API_URL = "http://localhost:8080/api/customer/bookings";

const getAuthHeaders = () => {
  const token = getCustomerToken();

  if (!token) {
    throw new Error(
      "Authentication required. Please log in again."
    );
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};

// Create customer booking
export const createBooking = async (bookingData) => {
  const response = await axios.post(
    API_URL,
    bookingData,
    {
      headers: getAuthHeaders(),
    }
  );

  return response.data;
};

// Get logged-in customer's bookings
export const getAllBookings = async () => {
  const response = await axios.get(API_URL, {
    headers: getAuthHeaders(),
  });

  return response.data;
};

// Get one customer booking
export const getBookingById = async (id) => {
  const response = await axios.get(
    `${API_URL}/${id}`,
    {
      headers: getAuthHeaders(),
    }
  );

  return response.data;
};

// Get bookings belonging to one of the customer's vehicles
export const getBookingsByVehicleId = async (vehicleId) => {
  const bookings = await getAllBookings();

  return bookings.filter(
    (booking) =>
      Number(booking.vehicleId) === Number(vehicleId)
  );
};

// Cancel booking
export const cancelBooking = async (id) => {
  const response = await axios.patch(
    `${API_URL}/${id}/cancel`,
    {},
    {
      headers: getAuthHeaders(),
    }
  );

  return response.data;
};
