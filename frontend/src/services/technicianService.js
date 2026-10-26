
import axios from "axios";

// ==========================================
// TECHNICIAN API CONFIGURATION
// ==========================================

const technicianApi = axios.create({
  baseURL: "http://localhost:8080/api/technician",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// ==========================================
// JWT TOKEN INTERCEPTOR
// ==========================================

technicianApi.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("technicianToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ==========================================
// COMMON API REQUEST HELPER
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
      "Something went wrong. Please try again.";

    const apiError = new Error(message);

    apiError.status = error.response?.status;
    apiError.response = error.response;

    throw apiError;
  }
}

// ==========================================
// VALIDATE ID
// ==========================================

function requireId(id, label = "ID") {
  if (
    id === null ||
    id === undefined ||
    String(id).trim() === ""
  ) {
    throw new Error(`${label} is required.`);
  }
}

// ==========================================
// TECHNICIAN PROFILE
// ==========================================

export async function getTechnicianProfile() {
  return apiRequest(() =>
    technicianApi.get("/profile")
  );
}

// ==========================================
// GET ASSIGNED JOBS
// ==========================================

export async function getTechnicianJobs() {
  return apiRequest(() =>
    technicianApi.get("/jobs")
  );
}

// ==========================================
// GET TECHNICIAN BOOKINGS
// ==========================================

export async function getTechnicianBookings() {
  return apiRequest(() =>
    technicianApi.get("/bookings")
  );
}

// ==========================================
// GET JOB DETAILS
// ID = ASSIGNMENT ID
// ==========================================

export async function getTechnicianJobDetails(
  assignmentId
) {
  requireId(assignmentId, "Assignment ID");

  return apiRequest(() =>
    technicianApi.get(`/jobs/${assignmentId}`)
  );
}

// ==========================================
// UPDATE JOB STATUS
// ID = ASSIGNMENT ID
// ==========================================

export async function updateTechnicianJobStatus(
  assignmentId,
  status
) {
  requireId(assignmentId, "Assignment ID");

  if (!status || !String(status).trim()) {
    throw new Error("Job status is required.");
  }

  return apiRequest(() =>
    technicianApi.patch(
      `/jobs/${assignmentId}/status`,
      { status }
    )
  );
}

// ==========================================
// VEHICLE INSPECTION
// ID = BOOKING ID
// CONFIRMED BACKEND URL
// ==========================================

export async function createTechnicianInspection(
  bookingId,
  data
) {
  requireId(bookingId, "Booking ID");

  if (!data || typeof data !== "object") {
    throw new Error("Inspection details are required.");
  }

  return apiRequest(() =>
    technicianApi.post(
      `/jobs/${bookingId}/inspection`,
      data
    )
  );
}

// ==========================================
// VEHICLE DIAGNOSIS
// ID = BOOKING ID
// CONFIRMED BACKEND URL
// ==========================================

export async function createTechnicianDiagnosis(
  bookingId,
  data
) {
  requireId(bookingId, "Booking ID");

  if (!data || typeof data !== "object") {
    throw new Error("Diagnosis details are required.");
  }

  return apiRequest(() =>
    technicianApi.post(
      `/jobs/${bookingId}/diagnosis`,
      data
    )
  );
}

// ==========================================
// CREATE QUOTATION
// ID = BOOKING ID
// CONFIRMED BACKEND URL
// ==========================================

export async function createTechnicianQuotation(
  bookingId,
  data
) {
  requireId(bookingId, "Booking ID");

  if (!data || typeof data !== "object") {
    throw new Error("Quotation details are required.");
  }

  return apiRequest(() =>
    technicianApi.post(
      `/jobs/${bookingId}/quotation`,
      data
    )
  );
}

// ==========================================
// GET QUOTATION
// ID = BOOKING ID
// CONFIRMED BACKEND URL
// ==========================================

export async function getTechnicianQuotation(
  bookingId
) {
  requireId(bookingId, "Booking ID");

  return apiRequest(() =>
    technicianApi.get(
      `/jobs/${bookingId}/quotation`
    )
  );
}

// ==========================================
// COMPLETE SERVICE
// ID = BOOKING ID
// CONFIRMED BACKEND URL
// ==========================================

export async function completeTechnicianService(
  bookingId,
  data
) {
  requireId(bookingId, "Booking ID");

  if (
    !data ||
    typeof data !== "object" ||
    !String(data.workPerformed ?? "").trim()
  ) {
    throw new Error("Work performed is required.");
  }

  return apiRequest(() =>
    technicianApi.post(
      `/bookings/${bookingId}/complete`,
      data
    )
  );
}

// ==========================================
// GET TECHNICIAN INVOICE
// ID = BOOKING ID
// ==========================================

export async function getTechnicianInvoice(
  bookingId
) {
  requireId(bookingId, "Booking ID");

  return apiRequest(() =>
    technicianApi.get(
      `/bookings/${bookingId}/invoice`
    )
  );
}

// ==========================================
// SUBMIT INVOICE TO ADMIN
// ID = BOOKING ID
// ==========================================

export async function submitTechnicianInvoice(
  bookingId
) {
  requireId(bookingId, "Booking ID");

  return apiRequest(() =>
    technicianApi.post(
      `/bookings/${bookingId}/invoice/submit`
    )
  );
}

// ==========================================
// DEFAULT EXPORT
// ==========================================

export default technicianApi;
