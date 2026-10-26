
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  getInspectionByBooking,
  createInspection,
} from "../../services/inspectionService";

const emptyForm = {
  engineCondition: "GOOD",
  brakeCondition: "GOOD",
  tyreCondition: "GOOD",
  batteryCondition: "GOOD",
  technicianNotes: "",
};

export default function Inspection() {
  const { id } = useParams();

  const bookingId = Number(id);

  // Temporary ID for local testing.
  // Later this will come from the logged-in technician.
  const technicianId = 2;

  const [form, setForm] = useState(emptyForm);
  const [existingInspection, setExistingInspection] =
    useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadInspection() {
      setLoading(true);
      setError("");
      setExistingInspection(null);

      if (!Number.isInteger(bookingId) || bookingId <= 0) {
        setError("Invalid booking ID.");
        setLoading(false);
        return;
      }

      try {
        const data = await getInspectionByBooking(bookingId);

        setExistingInspection(data);
        setForm({
          engineCondition: data.engineCondition,
          brakeCondition: data.brakeCondition,
          tyreCondition: data.tyreCondition,
          batteryCondition: data.batteryCondition,
          technicianNotes: data.technicianNotes || "",
        });
      } catch (err) {
        if (err.response?.status !== 404) {
          setError("Unable to load inspection.");
        }
      } finally {
        setLoading(false);
      }
    }

    loadInspection();
  }, [bookingId]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (existingInspection || saving) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const saved = await createInspection({
        bookingId,
        technicianId,
        ...form,
      });

      setExistingInspection(saved);
      setMessage("Inspection saved successfully!");
    } catch (err) {
      if (err.response?.status === 409) {
        setError(
          "An inspection already exists for this booking."
        );
      } else {
        setError(
          err.response?.data?.message ||
            "Failed to save inspection."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="p-6">Loading inspection...</p>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">
        Vehicle Inspection
      </h1>

      <p className="text-gray-600 mb-6">
        Booking ID: {bookingId}
      </p>

      {error && (
        <p className="mb-4 text-red-600">{error}</p>
      )}

      {message && (
        <p className="mb-4 text-green-600">{message}</p>
      )}

      {existingInspection && (
        <div className="bg-green-100 text-green-800 p-4 rounded mb-6">
          Inspection already completed.
          <br />
          Inspection ID: {existingInspection.id}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {[
          ["engineCondition", "Engine Condition"],
          ["brakeCondition", "Brake Condition"],
          ["tyreCondition", "Tyre Condition"],
          ["batteryCondition", "Battery Condition"],
        ].map(([name, label]) => (
          <div key={name}>
            <label className="block font-medium mb-2">
              {label}
            </label>

            <select
              name={name}
              value={form[name]}
              onChange={handleChange}
              disabled={Boolean(existingInspection)}
              className="w-full border rounded p-3"
            >
              <option value="GOOD">GOOD</option>
              <option value="FAIR">FAIR</option>
              <option value="POOR">POOR</option>
            </select>
          </div>
        ))}

        <div>
          <label className="block font-medium mb-2">
            Technician Notes
          </label>

          <textarea
            name="technicianNotes"
            value={form.technicianNotes}
            onChange={handleChange}
            disabled={Boolean(existingInspection)}
            rows={4}
            className="w-full border rounded p-3"
            placeholder="Enter vehicle inspection notes"
          />
        </div>

        <button
          type="submit"
          disabled={Boolean(existingInspection) || saving}
          className="bg-blue-600 text-white px-6 py-3 rounded disabled:opacity-50"
        >
          {existingInspection
            ? "Inspection Completed"
            : saving
              ? "Saving..."
              : "Save Inspection"}
        </button>
      </form>
    </div>
  );
}
