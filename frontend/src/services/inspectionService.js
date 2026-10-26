
const API_URL = "http://localhost:8080/api/inspections";

async function handleResponse(response) {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Inspection request failed");
  }

  return response.json();
}

export async function createInspection(data) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return handleResponse(response);
}

export async function getInspectionByBookingId(bookingId) {
  const response = await fetch(
    `${API_URL}/booking/${bookingId}`
  );

  if (response.status === 404) {
    return null;
  }

  return handleResponse(response);
}

export async function getAllInspections() {
  const response = await fetch(API_URL);
  return handleResponse(response);
}
