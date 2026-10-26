
import axios from "axios";
import { getAdminAuthHeaders } from "./adminAuthService";

const API_URL = "http://localhost:8080/api/admin";

export const getAdminBookings = async () => {
  const response = await axios.get(`${API_URL}/bookings`, {
    headers: getAdminAuthHeaders(),
  });

  return response.data;
};

export const getAdminVehicles = async () => {
  const response = await axios.get(`${API_URL}/vehicles`, {
    headers: getAdminAuthHeaders(),
  });

  return response.data;
};

export const getAdminAssignments = async () => {
  const response = await axios.get(`${API_URL}/assignments`, {
    headers: getAdminAuthHeaders(),
  });

  return response.data;
};

export const confirmAdminBooking = async (bookingId) => {
  const response = await axios.patch(
    `${API_URL}/bookings/${bookingId}/confirm`,
    {},
    { headers: getAdminAuthHeaders() }
  );

  return response.data;
};

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
    { headers: getAdminAuthHeaders() }
  );

  return response.data;
};
