
import axios from "axios";

const API_URL = "http://localhost:8080/api/auth";

// ================= CUSTOMER REGISTER =================

export const registerCustomer = async (customerData) => {
  const response = await axios.post(
    `${API_URL}/register`,
    customerData
  );

  return response.data;
};

// ================= CUSTOMER LOGIN =================

export const loginCustomer = async (email, password) => {
  const response = await axios.post(`${API_URL}/login`, {
    email,
    password,
  });

  const token = response.data.token;

  if (!token) {
    throw new Error("Login failed: JWT token not received");
  }

  sessionStorage.setItem("customerToken", token);

  return response.data;
};

// ================= CUSTOMER TOKEN =================

export const getCustomerToken = () => {
  return sessionStorage.getItem("customerToken");
};

// ================= CUSTOMER LOGOUT =================

export const logoutCustomer = () => {
  sessionStorage.removeItem("customerToken");
  localStorage.removeItem("demoUser");
};

// ================= CUSTOMER PROFILE =================

export const getCustomerProfile = async () => {
  const token = getCustomerToken();

  if (!token) {
    throw new Error("Authentication required");
  }

  const response = await axios.get(`${API_URL}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};
