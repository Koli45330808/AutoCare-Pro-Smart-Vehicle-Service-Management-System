
import axios from "axios";

const API_URL = "http://localhost:8080/api/assignments";

// Get all technician assignments
export const getAllAssignments = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Assign technician to confirmed booking
export const assignTechnician = async (
  bookingId,
  technicianId
) => {
  const response = await axios.post(API_URL, {
    bookingId: Number(bookingId),
    technicianId: Number(technicianId),
  });

  return response.data;
};

// Get all jobs for one technician
export const getTechnicianJobs = async (technicianId) => {
  const response = await axios.get(
    `${API_URL}/technician/${technicianId}`
  );

  return response.data;
};

// Get assignment for a specific booking
export const getAssignmentByBookingId = async (bookingId) => {
  const response = await axios.get(
    `${API_URL}/booking/${bookingId}`
  );

  return response.data;
};
