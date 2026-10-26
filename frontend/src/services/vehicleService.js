
import axios from "axios";
import { getCustomerToken } from "./authService";

const API_URL = "http://localhost:8080/api/customer/vehicles";

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

// Get logged-in customer's vehicles
export const getAllVehicles = async () => {
  const response = await axios.get(API_URL, {
    headers: getAuthHeaders(),
  });

  return response.data;
};

// Add vehicle
export const addVehicle = async (vehicle) => {
  const response = await axios.post(
    API_URL,
    vehicle,
    {
      headers: getAuthHeaders(),
    }
  );

  return response.data;
};

// Get vehicle by ID
export const getVehicleById = async (id) => {
  const response = await axios.get(
    `${API_URL}/${id}`,
    {
      headers: getAuthHeaders(),
    }
  );

  return response.data;
};

// Delete vehicle
export const deleteVehicle = async (id) => {
  // CustomerVehicleController does not currently
  // provide a DELETE endpoint.
  throw new Error(
    "Vehicle deletion is not available through the customer API yet."
  );
};
