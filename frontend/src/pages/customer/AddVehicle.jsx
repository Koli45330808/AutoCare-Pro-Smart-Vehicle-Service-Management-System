
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Car, ArrowLeft } from "lucide-react";
import { addVehicle } from "../../services/vehicleService";

function AddVehicle() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    ownerName: "",
    brand: "",
    model: "",
    year: "",
    registrationNumber: "",
    fuelType: "",
    vehicleType: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const currentYear = new Date().getFullYear();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "registrationNumber"
          ? value.toUpperCase()
          : value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setError("");

    const vehicle = {
      ownerName: formData.ownerName.trim(),
      make: formData.brand.trim(),
      model: formData.model.trim(),
      year: Number(formData.year),
      registrationNumber: formData.registrationNumber
        .trim()
        .toUpperCase()
        .replace(/\s+/g, ""),
      fuelType: formData.fuelType,
      vehicleType: formData.vehicleType,
    };

    if (
      !vehicle.ownerName ||
      !vehicle.make ||
      !vehicle.model ||
      !vehicle.registrationNumber ||
      !vehicle.fuelType ||
      !vehicle.vehicleType
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (
      !Number.isInteger(vehicle.year) ||
      vehicle.year < 1950 ||
      vehicle.year > 2100
    ) {
      setError("Please enter a valid manufacturing year.");
      return;
    }

    setLoading(true);

    try {
      const savedVehicle = await addVehicle(vehicle);

      if (!savedVehicle?.id) {
        throw new Error(
          "The server did not confirm the saved vehicle."
        );
      }

      console.log("Vehicle saved successfully:", savedVehicle);

      navigate("/customer/vehicles", {
        replace: true,
        state: {
          success: "Vehicle added successfully!",
        },
      });
    } catch (err) {
      console.error("Failed to add vehicle:", err);

      if (err.response?.status === 409) {
        setError(
          "This registration number already exists. Please enter a unique registration number."
        );
      } else if (err.response?.status === 400) {
        setError(
          "Invalid vehicle details. Please check all fields."
        );
      } else if (!err.response && err.message?.includes("Network")) {
        setError(
          "Cannot connect to backend. Please check that Spring Boot is running on port 8080."
        );
      } else {
        setError(
          err.response?.data?.message ||
          err.message ||
          "Unable to add vehicle. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  return (
    <div className="mx-auto max-w-4xl space-y-8">

      {/* Page Header */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate("/customer/vehicles")}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
        >
          <ArrowLeft size={19} />
        </button>

        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Add Vehicle
          </h1>

          <p className="mt-1 text-slate-500">
            Add your vehicle details to book and manage services.
          </p>
        </div>
      </div>

      {/* Vehicle Form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl bg-white p-6 shadow-sm md:p-8"
      >
        <div className="mb-8 flex items-center gap-4 rounded-xl bg-blue-50 p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
            <Car size={25} />
          </div>

          <div>
            <h2 className="font-bold text-blue-900">
              Vehicle Information
            </h2>

            <p className="text-sm text-blue-700">
              Enter accurate information about your vehicle.
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

          {/* Owner Name */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Owner Name *
            </label>

            <input
              name="ownerName"
              value={formData.ownerName}
              onChange={handleChange}
              placeholder="Enter owner name"
              required
              maxLength={100}
              className={inputClass}
            />
          </div>

          {/* Brand */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Vehicle Brand *
            </label>

            <input
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              placeholder="Example: Tata"
              required
              maxLength={100}
              className={inputClass}
            />
          </div>

          {/* Model */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Vehicle Model *
            </label>

            <input
              name="model"
              value={formData.model}
              onChange={handleChange}
              placeholder="Example: Nexon"
              required
              maxLength={100}
              className={inputClass}
            />
          </div>

          {/* Manufacturing Year */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Manufacturing Year *
            </label>

            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleChange}
              placeholder={`Example: ${currentYear}`}
              min="1950"
              max="2100"
              step="1"
              required
              className={inputClass}
            />
          </div>

          {/* Registration Number */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Registration Number *
            </label>

            <input
              name="registrationNumber"
              value={formData.registrationNumber}
              onChange={handleChange}
              placeholder="Example: MH13AB1234"
              required
              maxLength={20}
              className={`${inputClass} uppercase`}
            />
          </div>

          {/* Vehicle Type */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Vehicle Type *
            </label>

            <select
              name="vehicleType"
              value={formData.vehicleType}
              onChange={handleChange}
              required
              className={`${inputClass} bg-white`}
            >
              <option value="">Select vehicle type</option>
              <option value="Hatchback">Hatchback</option>
              <option value="Sedan">Sedan</option>
              <option value="SUV">SUV</option>
              <option value="MUV">MUV</option>
              <option value="Motorcycle">Motorcycle</option>
              <option value="Scooter">Scooter</option>
              <option value="Commercial">Commercial</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Fuel Type */}
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Fuel Type *
            </label>

            <select
              name="fuelType"
              value={formData.fuelType}
              onChange={handleChange}
              required
              className={`${inputClass} bg-white`}
            >
              <option value="">Select fuel type</option>
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="CNG">CNG</option>
              <option value="Electric">Electric</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={loading}
            onClick={() => navigate("/customer/vehicles")}
            className="rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Saving Vehicle..." : "Add Vehicle"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddVehicle;
