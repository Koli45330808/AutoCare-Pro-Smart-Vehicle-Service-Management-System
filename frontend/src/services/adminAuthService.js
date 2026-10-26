
import axios from "axios";

const API_URL = "http://localhost:8080/api/admin/auth";

export const getAdminToken = () => {
  return sessionStorage.getItem("adminToken");
};

export const loginAdmin = async (email, password) => {
  const response = await axios.post(`${API_URL}/login`, {
    email,
    password,
  });

  const token = response.data.token;

  if (!token) {
    throw new Error("Admin login failed: JWT token not received");
  }

  sessionStorage.setItem("adminToken", token);

  return response.data;
};

export const logoutAdmin = () => {
  sessionStorage.removeItem("adminToken");
};

export const getAdminAuthHeaders = () => {
  const token = getAdminToken();

  if (!token) {
    throw new Error("Admin login required. Please log in again.");
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};
