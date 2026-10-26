import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Car,
  User,
  Calendar,
  Clock,
  CreditCard,
  CheckCircle2,
  KeyRound,
  Gauge,
  FileText,
  PackageCheck,
  ClipboardCheck,
} from "lucide-react";

function Delivery() {
  const { id } = useParams();

  const [formData, setFormData] = useState({
    deliveryDate: "2026-10-15",
    deliveryTime: "05:00 PM",
    odometer: "45280",
    vehicleCondition:
      "Vehicle cleaned and inspected. No new visible damage found.",
    keysHandedOver: true,
    documentsHandedOver: true,
    customerConfirmed: false,
    deliveryNotes: "",
  });

  const [status, setStatus] = useState("Ready for Delivery");
  const [message, setMessage] = useState("");

  const job = {
    id: id || "SVS-1001",
    invoiceNumber: "INV-2026-1001",
    customer: "Akash Koli",
    phone: "+91 98765 43210",
    vehicle: "Honda City",
    registration: "MH12AB1234",
    service: "General Service + Brake Repair",
    technician: "Rahul Patil",
    paymentStatus: "Paid",
    totalAmount: 7080,
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleMarkDelivered = () => {
    if (!formData.customerConfirmed) {
      setMessage("Please confirm that the customer has received the vehicle.");
      return;
    }

    setStatus("Delivered");
    setMessage(
      "Vehicle delivered successfully. Delivery record has been completed."
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="mx-auto w-full max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <Link
            to={`/technician/jobs/${job.id}/service`}
            className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600"
          >
            <ArrowLeft size={18} />
            Back to Service
          </Link>

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-semibold text-blue-600">
                Vehicle Handover
              </p>

              <h1 className="mt-1 text-2xl font-bold text-slate-800 md:text-3xl">
                Vehicle Delivery
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Complete the final vehicle delivery and customer handover.
              </p>
            </div>

            <div
              className={`rounded-full px-4 py-2 text-sm font-bold ${
                status === "Delivered"
                  ? "bg-green-100 text-green-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {status}
            </div>
          </div>
        </div>

        {message && (
          <div
            className={`mb-6 rounded-xl border p-4 text-sm font-medium ${
              status === "Delivered"
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-blue-200 bg-blue-50 text-blue-700"
            }`}
          >
            {message}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Customer + Vehicle */}
            <section className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-slate-800">
                <Car size={21} className="text-blue-600" />
                Customer & Vehicle
              </h2>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <User size={22} />
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">Customer</p>
                      <p className="font-bold text-slate-800">
                        {job.customer}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600">{job.phone}</p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-100 text-green-600">
                      <Car size={22} />
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">Vehicle</p>
                      <p className="font-bold text-slate-800">
                        {job.vehicle}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm font-semibold text-slate-600">
                    {job.registration}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs text-slate-500">Service</p>
                  <p className="mt-1 text-sm font-bold text-slate-800">
                    {job.service}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs text-slate-500">Invoice</p>
                  <p className="mt-1 text-sm font-bold text-slate-800">
                    {job.invoiceNumber}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs text-slate-500">Payment</p>
                  <p className="mt-1 font-bold text-green-600">
                    {job.paymentStatus} · ₹{job.totalAmount.toLocaleString()}
                  </p>
                </div>
              </div>
            </section>

            {/* Delivery details */}
            <section className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-slate-800">
                <ClipboardCheck size={21} className="text-blue-600" />
                Delivery Details
              </h2>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Delivery Date
                  </label>

                  <div className="relative">
                    <Calendar
                      size={18}
                      className="absolute left-3 top-3 text-slate-400"
                    />

                    <input
                      type="date"
                      name="deliveryDate"
                      value={formData.deliveryDate}
                      onChange={handleChange}
                      disabled={status === "Delivered"}
                      className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Delivery Time
                  </label>

                  <div className="relative">
                    <Clock
                      size={18}
                      className="absolute left-3 top-3 text-slate-400"
                    />

                    <input
                      type="time"
                      name="deliveryTime"
                      value={formData.deliveryTime}
                      onChange={handleChange}
                      disabled={status === "Delivered"}
                      className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Odometer Reading (KM)
                  </label>

                  <div className="relative">
                    <Gauge
                      size={18}
                      className="absolute left-3 top-3 text-slate-400"
                    />

                    <input
                      type="number"
                      name="odometer"
                      value={formData.odometer}
                      onChange={handleChange}
                      disabled={status === "Delivered"}
                      placeholder="Enter current KM"
                      className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Technician
                  </label>

                  <input
                    value={job.technician}
                    disabled
                    className="w-full rounded-xl border border-slate-300 bg-slate-100 px-4 py-3 text-slate-600"
                  />
                </div>
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Vehicle Condition at Delivery
                </label>

                <textarea
                  name="vehicleCondition"
                  value={formData.vehicleCondition}
                  onChange={handleChange}
                  disabled={status === "Delivered"}
                  rows="4"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                />
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Delivery Notes
                </label>

                <textarea
                  name="deliveryNotes"
                  value={formData.deliveryNotes}
                  onChange={handleChange}
                  disabled={status === "Delivered"}
                  rows="3"
                  placeholder="Add any final notes..."
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                />
              </div>
            </section>

            {/* Handover checklist */}
            <section className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-slate-800">
                <PackageCheck size={21} className="text-blue-600" />
                Handover Checklist
              </h2>

              <div className="space-y-3">
                <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 p-4 hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <KeyRound size={20} className="text-slate-600" />
                    <div>
                      <p className="font-semibold text-slate-800">
                        Vehicle Keys Handed Over
                      </p>
                      <p className="text-xs text-slate-500">
                        Confirm keys are given to the customer.
                      </p>
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    name="keysHandedOver"
                    checked={formData.keysHandedOver}
                    onChange={handleChange}
                    disabled={status === "Delivered"}
                    className="h-5 w-5 accent-blue-600"
                  />
                </label>

                <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 p-4 hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <FileText size={20} className="text-slate-600" />
                    <div>
                      <p className="font-semibold text-slate-800">
                        Documents / Invoice Handed Over
                      </p>
                      <p className="text-xs text-slate-500">
                        Confirm invoice and required documents are provided.
                      </p>
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    name="documentsHandedOver"
                    checked={formData.documentsHandedOver}
                    onChange={handleChange}
                    disabled={status === "Delivered"}
                    className="h-5 w-5 accent-blue-600"
                  />
                </label>

                <label className="flex cursor-pointer items-center justify-between rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={20} className="text-blue-600" />
                    <div>
                      <p className="font-semibold text-slate-800">
                        Customer Received Vehicle
                      </p>
                      <p className="text-xs text-slate-500">
                        Required before marking the job as delivered.
                      </p>
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    name="customerConfirmed"
                    checked={formData.customerConfirmed}
                    onChange={handleChange}
                    disabled={status === "Delivered"}
                    className="h-5 w-5 accent-blue-600"
                  />
                </label>
              </div>
            </section>
          </div>

          {/* Right panel */}
          <div className="space-y-6">
            <section className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="mb-4 font-bold text-slate-800">
                Delivery Summary
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between gap-4">
                  <span className="text-sm text-slate-500">Job ID</span>
                  <span className="text-sm font-bold text-slate-800">
                    {job.id}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-sm text-slate-500">Vehicle</span>
                  <span className="text-right text-sm font-bold text-slate-800">
                    {job.vehicle}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-sm text-slate-500">Registration</span>
                  <span className="text-sm font-bold text-slate-800">
                    {job.registration}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-sm text-slate-500">Payment</span>
                  <span className="text-sm font-bold text-green-600">
                    Paid
                  </span>
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <p className="text-xs text-slate-500">Delivery Status</p>

                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={`h-3 w-3 rounded-full ${
                        status === "Delivered"
                          ? "bg-green-500"
                          : "bg-blue-500"
                      }`}
                    />

                    <span className="font-bold text-slate-800">
                      {status}
                    </span>
                  </div>
                </div>
              </div>

              {status !== "Delivered" ? (
                <button
                  type="button"
                  onClick={handleMarkDelivered}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 font-semibold text-white transition hover:bg-green-700"
                >
                  <CheckCircle2 size={19} />
                  Mark Vehicle Delivered
                </button>
              ) : (
                <div className="mt-6 rounded-xl bg-green-50 p-4 text-center">
                  <CheckCircle2
                    size={28}
                    className="mx-auto text-green-600"
                  />

                  <p className="mt-2 font-bold text-green-700">
                    Vehicle Delivered Successfully
                  </p>

                  <p className="mt-1 text-xs text-green-600">
                    The service lifecycle is now complete.
                  </p>
                </div>
              )}
            </section>

            <section className="rounded-2xl bg-blue-50 p-5">
              <h3 className="font-bold text-blue-900">Next Step</h3>

              <p className="mt-2 text-sm leading-6 text-blue-800">
                After successful delivery, the customer can provide a service
                review and the completed service will appear in Service
                History.
              </p>

              {status === "Delivered" && (
                <Link
                  to={`/customer/reviews/${job.id}`}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Customer Review
                </Link>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Delivery;