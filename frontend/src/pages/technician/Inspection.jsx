
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getTechnicianJobDetails,
  createTechnicianInspection,
} from "../../services/technicianService";

const initialForm = {
  engineCondition: "",
  brakeCondition: "",
  tyreCondition: "",
  batteryCondition: "",
  technicianNotes: "",
};

export default function Inspection() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    getTechnicianJobDetails(id)
      .then((data) => {
        if (active) setJob(data);
      })
      .catch((err) => {
        if (active) {
          setError(err.response?.data?.detail || err.message);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const updateField = (event) => {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  async function handleSubmit(event) {
    event.preventDefault();
    if (!job?.bookingId) return;

    try {
      setSaving(true);
      setError("");

      await createTechnicianInspection(job.bookingId, form);

      navigate(`/technician/jobs/${id}/diagnosis`);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        "Unable to save inspection."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-6">Loading inspection...</div>;

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <Link to={`/technician/jobs/${id}`} className="text-blue-600">
        ← Back to Job
      </Link>

      <h1 className="text-3xl font-bold">Vehicle Inspection</h1>

      {job && (
        <p className="text-slate-600">
          Booking #{job.bookingId} — {job.vehicleMake} {job.vehicleModel}
        </p>
      )}

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 p-4 text-red-700">
          {error}
        </p>
      )}

      {job && (
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-xl border bg-white p-6 shadow-sm"
        >
          {[
            ["engineCondition", "Engine Condition"],
            ["brakeCondition", "Brake Condition"],
            ["tyreCondition", "Tyre Condition"],
            ["batteryCondition", "Battery Condition"],
          ].map(([name, label]) => (
            <div key={name}>
              <label className="mb-2 block font-medium">{label}</label>
              <select
                name={name}
                required
                value={form[name]}
                onChange={updateField}
                className="w-full rounded-lg border p-3"
              >
                <option value="">Select condition</option>
                <option value="GOOD">Good</option>
                <option value="NEEDS_ATTENTION">Needs Attention</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          ))}

          <div>
            <label className="mb-2 block font-medium">
              Technician Notes
            </label>
            <textarea
              name="technicianNotes"
              value={form.technicianNotes}
              onChange={updateField}
              rows={4}
              className="w-full rounded-lg border p-3"
              placeholder="Describe inspection findings"
            />
          </div>

          <button
            disabled={saving}
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Inspection & Continue"}
          </button>
        </form>
      )}
    </div>
  );
}
