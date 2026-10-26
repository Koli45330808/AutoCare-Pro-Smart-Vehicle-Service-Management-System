
import axios from "axios";

const API_URL = "http://localhost:8080/api/inspections";

// Get all inspections
export const getAllInspections = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Get inspection by booking ID
export const getInspectionByBooking = async (bookingId) => {
  const response = await axios.get(
    `${API_URL}/booking/${bookingId}`
  );
  return response.data;
};

// Save a new inspection
export const createInspection = async (inspectionData) => {
  const response = await axios.post(API_URL, inspectionData);
  return response.data;
};
