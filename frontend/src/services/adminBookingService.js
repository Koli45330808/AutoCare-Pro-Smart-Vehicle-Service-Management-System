
import axios from "axios";

const API_URL = "http://localhost:8080/api/admin";

const getAdminHeaders = () => {
  const token = sessionStorage.getItem("adminToken");

  if (!token) {
    throw new Error("Admin login required. Please log in again.");
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};

// Get all bookings
export const getAdminBookings = async () => {
  const response = await axios.get(`${API_URL}/bookings`, {
    headers: getAdminHeaders(),
  });

  return response.data;
};

// Get all vehicles
export const getAdminVehicles = async () => {
  const response = await axios.get(`${API_URL}/vehicles`, {
    headers: getAdminHeaders(),
  });

  return response.data;
};

// Get all technician assignments
export const getAdminAssignments = async () => {
  const response = await axios.get(`${API_URL}/assignments`, {
    headers: getAdminHeaders(),
  });

  return response.data;
};

// Confirm a pending booking
export const confirmAdminBooking = async (bookingId) => {
  const response = await axios.patch(
    `${API_URL}/bookings/${bookingId}/confirm`,
    {},
    {
      headers: getAdminHeaders(),
    }
  );

  return response.data;
};

// Assign technician to confirmed booking
export const assignAdminTechnician = async (
  bookingId,
  technicianId
) => {
  const response = await axios.post(
    `${API_URL}/assignments`,
    {
      bookingId: Number(bookingId),
      technicianId: Number(technicianId),
    },
    {
      headers: getAdminHeaders(),
    }
  );

  return response.data;
};
