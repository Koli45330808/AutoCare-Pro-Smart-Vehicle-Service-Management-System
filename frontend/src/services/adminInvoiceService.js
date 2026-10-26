
import axios from "axios";

// ==========================================
// ADMIN API CONFIGURATION
// ==========================================

const adminInvoiceApi = axios.create({
  baseURL: "http://localhost:8080/api/admin",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// ==========================================
// ATTACH ADMIN JWT TOKEN
// ==========================================

adminInvoiceApi.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("adminToken");

    if (!token) {
      return Promise.reject(
        new Error("Admin login required. Please log in again.")
      );
    }

    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ==========================================
// COMMON API HELPER
// ==========================================

async function apiRequest(requestFunction) {
  try {
    const response = await requestFunction();
    return response.data;
  } catch (error) {
    const data = error.response?.data;

    const message =
      (typeof data === "string" && data.trim()) ||
      data?.detail ||
      data?.message ||
      data?.error ||
      error.message ||
      "Request failed. Please try again.";

    const apiError = new Error(message);

    apiError.status = error.response?.status;
    apiError.response = error.response;

    throw apiError;
  }
}

function requireId(id, label) {
  if (
    !Number.isSafeInteger(Number(id)) ||
    Number(id) <= 0
  ) {
    throw new Error(`Valid ${label} is required.`);
  }
}

// ==========================================
// ADMIN: GENERATE INVOICE
// ==========================================

export async function generateAdminInvoice(bookingId) {
  requireId(bookingId, "Booking ID");

  return apiRequest(() =>
    adminInvoiceApi.post(
      `/invoices/generate/${bookingId}`
    )
  );
}

// ==========================================
// ADMIN: GET ALL INVOICES
// ==========================================

export async function getAdminInvoices() {
  return apiRequest(() =>
    adminInvoiceApi.get("/invoices")
  );
}

// ==========================================
// ADMIN: GET INVOICE BY BOOKING
// ==========================================

export async function getAdminInvoiceByBooking(
  bookingId
) {
  requireId(bookingId, "Booking ID");

  return apiRequest(() =>
    adminInvoiceApi.get(
      `/invoices/booking/${bookingId}`
    )
  );
}

// ==========================================
// ADMIN: SEND INVOICE TO CUSTOMER
// ==========================================

export async function sendAdminInvoiceToCustomer(
  invoiceId
) {
  requireId(invoiceId, "Invoice ID");

  return apiRequest(() =>
    adminInvoiceApi.patch(
      `/invoices/${invoiceId}/send-to-customer`
    )
  );
}

// ==========================================
// ADMIN: RECORD VERIFIED PAYMENT
// ==========================================

export async function recordAdminPayment(data) {
  if (!data || typeof data !== "object") {
    throw new Error("Payment details are required.");
  }

  return apiRequest(() =>
    adminInvoiceApi.post("/payments", data)
  );
}

// ==========================================
// ADMIN: GET ALL PAYMENTS
// ==========================================

export async function getAdminPayments() {
  return apiRequest(() =>
    adminInvoiceApi.get("/payments")
  );
}

// ==========================================
// ADMIN: GET PAYMENT BY INVOICE ID
// ==========================================

export async function getAdminPaymentByInvoice(
  invoiceId
) {
  requireId(invoiceId, "Invoice ID");

  return apiRequest(() =>
    adminInvoiceApi.get(
      `/payments/invoice/${invoiceId}`
    )
  );
}

// ==========================================
// DEFAULT EXPORT
// ==========================================

export default adminInvoiceApi;
