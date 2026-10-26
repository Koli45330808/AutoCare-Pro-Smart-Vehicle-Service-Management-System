
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Car,
  CalendarDays,
  Clock,
  Wrench,
  FileText,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  LoaderCircle,
  Lightbulb,
} from "lucide-react";

import { getAllVehicles } from "../../services/vehicleService";
import { createBooking } from "../../services/bookingService";

const serviceTypes = [
  "General Service",
  "Oil Change",
  "Engine Service",
  "Brake Service",
  "AC Service",
  "Battery Service",
  "Tyre Service",
  "Wheel Alignment",
  "Car Washing",
  "Full Vehicle Inspection",
  "Other",
];

const timeSlots = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
];

function getLocalToday() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isPastTime(date, time) {
  if (date !== getLocalToday()) {
    return false;
  }

  const match = time.match(
    /^(\d{1,2}):(\d{2})\s(AM|PM)$/
  );

  if (!match) return true;

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const period = match[3];

  if (period === "PM" && hour !== 12) {
    hour += 12;
  }

  if (period === "AM" && hour === 12) {
    hour = 0;
  }

  const selectedTime = new Date();
  selectedTime.setHours(hour, minute, 0, 0);

  return selectedTime <= new Date();
}

function BookService() {
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState([]);
  const [vehiclesLoading, setVehiclesLoading] =
    useState(true);
  const [vehiclesError, setVehiclesError] =
    useState("");

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [savedBooking, setSavedBooking] =
    useState(null);

  const [formData, setFormData] = useState({
    vehicle: "",
    serviceType: "",
    serviceDate: "",
    serviceTime: "",
    problemDescription: "",
    pickupDrop: "NO",
  });

  useEffect(() => {
    let active = true;

    async function loadVehicles() {
      setVehiclesLoading(true);
      setVehiclesError("");

      try {
        const result = await getAllVehicles();

        if (!active) return;

        const vehicleList = Array.isArray(result)
          ? result
          : Array.isArray(result?.content)
          ? result.content
          : [];

        setVehicles(vehicleList);
      } catch (error) {
        if (!active) return;

        console.error(
          "Vehicle loading error:",
          error
        );

        setVehiclesError(
          error.response?.data?.detail ||
            error.response?.data?.message ||
            error.message ||
            "Unable to load vehicles."
        );
      } finally {
        if (active) {
          setVehiclesLoading(false);
        }
      }
    }

    loadVehicles();

    return () => {
      active = false;
    };
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setFormError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (submitting) return;

    setFormError("");

    const selectedVehicle = vehicles.find(
      (vehicle) =>
        String(vehicle.id) === formData.vehicle
    );

    if (!selectedVehicle) {
      setFormError(
        "Please select a valid vehicle."
      );
      return;
    }

    if (
      !formData.serviceType ||
      !formData.serviceDate ||
      !formData.serviceTime ||
      !formData.problemDescription.trim()
    ) {
      setFormError(
        "Please fill in all required fields."
      );
      return;
    }

    if (
      formData.serviceDate < getLocalToday()
    ) {
      setFormError(
        "Please select today or a future date."
      );
      return;
    }

    if (
      isPastTime(
        formData.serviceDate,
        formData.serviceTime
      )
    ) {
      setFormError(
        "Please select a future time slot."
      );
      return;
    }

    const bookingData = {
      vehicleId: Number(selectedVehicle.id),
      serviceType: formData.serviceType,
      serviceDate: formData.serviceDate,
      serviceTime: formData.serviceTime,
      problemDescription:
        formData.problemDescription.trim(),
      pickupDrop: formData.pickupDrop,
    };

    try {
      setSubmitting(true);

      const saved = await createBooking(
        bookingData
      );

      if (!saved || saved.id == null) {
        throw new Error(
          "Booking response is missing an ID."
        );
      }

      setSavedBooking(saved);
    } catch (error) {
      console.error(
        "Booking submission error:",
        error
      );

      const serverMessage =
        error.response?.data?.detail ||
        error.response?.data?.message;

      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        setFormError(
          "Your session has expired or access was denied. Please log in again."
        );
      } else {
        setFormError(
          typeof serverMessage === "string"
            ? serverMessage
            : error.message ||
                "Unable to save booking."
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pl-11 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  // SUCCESS PAGE
  if (savedBooking) {
    const selectedVehicle = vehicles.find(
      (vehicle) =>
        Number(vehicle.id) ===
        Number(savedBooking.vehicleId)
    );

    return (
      <div className="flex min-h-[70vh] items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-lg">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle
              size={42}
              className="text-green-600"
            />
          </div>

          <h1 className="mt-6 text-2xl font-bold text-slate-800">
            Service Booking Submitted!
          </h1>

          <p className="mt-3 leading-6 text-slate-500">
            Your service request has been saved
            successfully. Our service team will
            review your request and confirm
            your appointment.
          </p>

          <div className="mt-6 rounded-2xl bg-slate-50 p-5 text-left">
            <div className="space-y-4">
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">
                  Booking ID
                </span>
                <span className="font-semibold text-slate-800">
                  #{savedBooking.id}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-slate-500">
                  Vehicle
                </span>
                <span className="text-right font-semibold text-slate-800">
                  {selectedVehicle
                    ? `${selectedVehicle.make} ${selectedVehicle.model}`
                    : `Vehicle #${savedBooking.vehicleId}`}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-slate-500">
                  Service
                </span>
                <span className="text-right font-semibold text-slate-800">
                  {savedBooking.serviceType}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-slate-500">
                  Date
                </span>
                <span className="font-semibold text-slate-800">
                  {savedBooking.serviceDate}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-slate-500">
                  Time
                </span>
                <span className="font-semibold text-slate-800">
                  {savedBooking.serviceTime}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-slate-500">
                  Status
                </span>
                <span className="font-semibold text-amber-600">
                  {savedBooking.status || "PENDING"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() =>
                navigate("/customer/bookings")
              }
              className="flex-1 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              View My Bookings
            </button>

            <Link
              to="/customer"
              className="flex-1 rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-4">
      {/* HEADER */}
      <div className="mb-8">
        <Link
          to="/customer"
          className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </Link>

        <h1 className="text-3xl font-bold text-slate-800">
          Book Vehicle Service
        </h1>

        <p className="mt-2 text-slate-500">
          Tell us about your vehicle and the
          service you need.
        </p>
      </div>

      {/* MAIN CARD */}
      <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
        <div className="bg-slate-800 px-6 py-6 text-white md:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500">
              <Wrench size={25} />
            </div>

            <div>
              <h2 className="text-xl font-bold">
                Service Request
              </h2>

              <p className="mt-1 text-sm text-slate-300">
                Complete the details below to
                request a service.
              </p>
            </div>
          </div>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="p-6 md:p-8"
        >
          {formError && (
            <div
              role="alert"
              className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              <AlertCircle
                size={20}
                className="shrink-0"
              />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* VEHICLE */}
            <div>
              <label
                htmlFor="vehicle"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Select Vehicle *
              </label>

              <div className="relative">
                <Car
                  size={18}
                  className="absolute left-4 top-3.5 text-slate-400"
                />

                <select
                  id="vehicle"
                  name="vehicle"
                  value={formData.vehicle}
                  onChange={handleChange}
                  required
                  disabled={
                    vehiclesLoading ||
                    !!vehiclesError ||
                    vehicles.length === 0
                  }
                  className={inputClass}
                >
                  <option value="">
                    {vehiclesLoading
                      ? "Loading vehicles..."
                      : vehiclesError
                      ? "Unable to load vehicles"
                      : vehicles.length === 0
                      ? "No vehicles available"
                      : "Select your vehicle"}
                  </option>

                  {vehicles.map((vehicle) => (
                    <option
                      key={vehicle.id}
                      value={String(vehicle.id)}
                    >
                      {vehicle.make} {vehicle.model} -{" "}
                      {vehicle.registrationNumber}
                    </option>
                  ))}
                </select>
              </div>

              {vehiclesError && (
                <p className="mt-2 text-sm text-red-600">
                  {vehiclesError}
                </p>
              )}

              {!vehiclesLoading &&
                !vehiclesError &&
                vehicles.length === 0 && (
                  <Link
                    to="/customer/vehicles/add"
                    className="mt-2 inline-block text-sm font-semibold text-blue-600"
                  >
                    Add your first vehicle
                  </Link>
                )}
            </div>

            {/* SERVICE TYPE */}
            <div>
              <label
                htmlFor="serviceType"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Service Required *
              </label>

              <div className="relative">
                <Wrench
                  size={18}
                  className="absolute left-4 top-3.5 text-slate-400"
                />

                <select
                  id="serviceType"
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleChange}
                  required
                  className={inputClass}
                >
                  <option value="">
                    Select service type
                  </option>

                  {serviceTypes.map((service) => (
                    <option
                      key={service}
                      value={service}
                    >
                      {service}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* DATE */}
            <div>
              <label
                htmlFor="serviceDate"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Preferred Service Date *
              </label>

              <div className="relative">
                <CalendarDays
                  size={18}
                  className="absolute left-4 top-3.5 text-slate-400"
                />

                <input
                  id="serviceDate"
                  type="date"
                  name="serviceDate"
                  value={formData.serviceDate}
                  onChange={handleChange}
                  min={getLocalToday()}
                  required
                  className={inputClass}
                />
              </div>
            </div>

            {/* TIME */}
            <div>
              <label
                htmlFor="serviceTime"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Preferred Time *
              </label>

              <div className="relative">
                <Clock
                  size={18}
                  className="absolute left-4 top-3.5 text-slate-400"
                />

                <select
                  id="serviceTime"
                  name="serviceTime"
                  value={formData.serviceTime}
                  onChange={handleChange}
                  required
                  className={inputClass}
                >
                  <option value="">
                    Select time
                  </option>

                  {timeSlots.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* PROBLEM DESCRIPTION */}
          <div className="mt-6">
            <label
              htmlFor="problemDescription"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Vehicle Problem / Service Description *
            </label>

            <div className="relative">
              <FileText
                size={18}
                className="absolute left-4 top-4 text-slate-400"
              />

              <textarea
                id="problemDescription"
                name="problemDescription"
                value={formData.problemDescription}
                onChange={handleChange}
                required
                rows={5}
                maxLength={2000}
                placeholder="Example: Engine making unusual noise, brake issue, AC not cooling..."
                className={`${inputClass} resize-none`}
              />
            </div>

            <p className="mt-2 text-xs text-slate-400">
              Describe the problem clearly so
              the technician can prepare.
            </p>
          </div>

          {/* PICKUP AND DROP */}
          <div className="mt-6">
            <label className="mb-3 block text-sm font-semibold text-slate-700">
              Pickup & Drop Service
            </label>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {["YES", "NO"].map((option) => (
                <label
                  key={option}
                  className={`cursor-pointer rounded-xl border p-4 transition ${
                    formData.pickupDrop === option
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="pickupDrop"
                    value={option}
                    checked={
                      formData.pickupDrop === option
                    }
                    onChange={handleChange}
                    className="mr-3"
                  />

                  <span className="font-semibold text-slate-700">
                    {option === "YES"
                      ? "Yes, I need pickup/drop"
                      : "No, I will bring the vehicle"}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* INFORMATION */}
          <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">
            <div className="flex gap-3">
              <Lightbulb
                size={24}
                className="shrink-0 text-blue-600"
              />

              <div>
                <h3 className="font-bold text-blue-900">
                  Important
                </h3>

                <p className="mt-1 text-sm leading-6 text-blue-700">
                  Your selected date and time are
                  preferred slots. Final confirmation
                  will be provided by our service
                  team after reviewing your request.
                </p>
              </div>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate("/customer")}
              className="rounded-xl border border-slate-200 px-6 py-3 text-center font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                submitting ||
                vehiclesLoading ||
                !!vehiclesError ||
                vehicles.length === 0
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && (
                <LoaderCircle
                  size={19}
                  className="animate-spin"
                />
              )}

              {submitting
                ? "Submitting..."
                : "Submit Service Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BookService;
