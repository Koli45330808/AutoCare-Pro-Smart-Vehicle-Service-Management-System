
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api/admin",
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("adminToken");

  if (!token) {
    return Promise.reject(
      new Error("Admin login required. Please log in again.")
    );
  }

  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

async function fetchList(endpoint) {
  try {
    const response = await api.get(endpoint);

    if (!Array.isArray(response.data)) {
      throw new Error(`Invalid response from ${endpoint}`);
    }

    return response.data;
  } catch (error) {
    const data = error.response?.data;

    throw new Error(
      data?.detail ||
        data?.message ||
        error.message ||
        `Failed to load ${endpoint}`
    );
  }
}

export async function getAdminReportData() {
  const [
    bookings,
    customers,
    vehicles,
    assignments,
    technicians,
    invoices,
    payments,
  ] = await Promise.all([
    fetchList("/bookings"),
    fetchList("/customers"),
    fetchList("/vehicles"),
    fetchList("/assignments"),
    fetchList("/technicians"),
    fetchList("/invoices"),
    fetchList("/payments"),
  ]);

  return {
    bookings,
    customers,
    vehicles,
    assignments,
    technicians,
    invoices,
    payments,
  };
}
