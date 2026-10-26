
import axios from "axios";

const API_URL = "http://localhost:8080/api/admin/technicians";

function authHeaders() {
  const token = sessionStorage.getItem("adminToken");

  if (!token) {
    throw new Error("Admin login required.");
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function getTechnicians() {
  const response = await axios.get(API_URL, {
    headers: authHeaders(),
  });

  return response.data;
}

export async function getPendingTechnicians() {
  const response = await axios.get(`${API_URL}/pending`, {
    headers: authHeaders(),
  });

  return response.data;
}

export async function approveTechnician(id) {
  const response = await axios.patch(
    `${API_URL}/${id}/approve`,
    {},
    { headers: authHeaders() }
  );

  return response.data;
}

export async function rejectTechnician(id) {
  const response = await axios.patch(
    `${API_URL}/${id}/reject`,
    {},
    { headers: authHeaders() }
  );

  return response.data;
}
