
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  IndianRupee,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Wrench,
} from "lucide-react";
import axios from "axios";

const API_URL = "http://localhost:8080/api/customer/bookings";

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(value ?? 0));

function getErrorMessage(error) {
  const data = error.response?.data;

  if (error.response?.status === 401) {
    return "Customer login required. Please log in again.";
  }

  if (error.response?.status === 403) {
    return "You are not authorized to view this quotation.";
  }

  if (error.response?.status === 404) {
    return "Quotation not found. The technician may not have created it yet.";
  }

  if (error.response?.status === 409) {
    return "This quotation has already been reviewed. Refresh to see its latest status.";
  }

  return (
    data?.detail ||
    data?.message ||
    error.message ||
    "Something went wrong."
  );
}

export default function Quotation() {
  // id represents the booking ID
  const { id } = useParams();

  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Uses the same customer token key as the login flow.
  // If your login uses a different key, update this function.
  function getCustomerToken() {
    return (
      sessionStorage.getItem("customerToken") ||
      localStorage.getItem("customerToken")
    );
  }

  function getHeaders() {
    const token = getCustomerToken();

    if (!token) {
      throw new Error(
        "Customer login required. Please log in to view your quotation."
      );
    }

    return {
      Authorization: `Bearer ${token}`,
    };
  }

  async function loadQuotation() {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_URL}/${id}/quotation`,
        {
          headers: getHeaders(),
        }
      );

      setQuotation(response.data);
    } catch (err) {
      console.error("Load quotation error:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    async function fetchQuotation() {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(
          `${API_URL}/${id}/quotation`,
          {
            headers: getHeaders(),
          }
        );

        if (active) {
          setQuotation(response.data);
        }
      } catch (err) {
        if (active) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchQuotation();

    return () => {
      active = false;
    };
  }, [id]);

  async function reviewQuotation(action) {
    if (!quotation || saving) return;

    if (quotation.status !== "PENDING") {
      setError("This quotation has already been reviewed.");
      return;
    }

    const confirmed = window.confirm(
      action === "APPROVED"
        ? "Are you sure you want to approve this quotation?"
        : "Are you sure you want to reject this quotation?"
    );

    if (!confirmed) return;

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const response = await axios.patch(
        `${API_URL}/${id}/quotation`,
        { action },
        {
          headers: getHeaders(),
        }
      );

      setQuotation(response.data);

      setMessage(
        action === "APPROVED"
          ? "Quotation approved successfully. The technician can proceed with the approved repair."
          : "Quotation rejected successfully."
      );
    } catch (err) {
      console.error("Quotation review error:", err);
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-3 text-slate-600">
        <RefreshCw className="animate-spin" size={22} />
        Loading service quotation...
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="mx-auto max-w-3xl space-y-5 p-6">
        <Link
          to={`/customer/bookings/${id}`}
          className="inline-flex items-center gap-2 font-semibold text-blue-600"
        >
          <ArrowLeft size={18} />
          Back to Booking
        </Link>

        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <AlertCircle
            size={36}
            className="mb-4 text-orange-500"
          />

          <h1 className="text-xl font-bold">
            Quotation Unavailable
          </h1>

          <p className="mt-3 text-slate-600">
            {error || "No quotation is available for this booking."}
          </p>

          <button
            type="button"
            onClick={loadQuotation}
            className="mt-5 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const status = quotation.status || "PENDING";

  const partsCost = Number(quotation.partsCost ?? 0);
  const labourCost = Number(quotation.labourCost ?? 0);
  const additionalCharges = Number(
    quotation.additionalCharges ?? 0
  );

  const totalAmount = Number(
    quotation.totalAmount ??
      partsCost + labourCost + additionalCharges
  );

  const statusStyles = {
    PENDING: "bg-yellow-100 text-yellow-700",
    APPROVED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              to={`/customer/bookings/${id}`}
              className="mb-4 inline-flex items-center gap-2 font-semibold text-blue-600"
            >
              <ArrowLeft size={18} />
              Back to Booking
            </Link>

            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                <FileText size={26} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-800">
                  Service Quotation
                </h1>

                <p className="text-sm text-slate-500">
                  Quotation #{quotation.id} | Booking #{id}
                </p>
              </div>
            </div>
          </div>

          <div
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${
              statusStyles[status] ||
              "bg-slate-100 text-slate-700"
            }`}
          >
            {status === "APPROVED" ? (
              <CheckCircle2 size={18} />
            ) : status === "REJECTED" ? (
              <XCircle size={18} />
            ) : (
              <Clock size={18} />
            )}

            {status}
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
          >
            {error}
          </div>
        )}

        {/* SUCCESS */}
        {message && (
          <div
            role="status"
            className="rounded-xl border border-green-200 bg-green-50 p-4 text-green-700"
          >
            {message}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">

          {/* LEFT SIDE */}
          <div className="space-y-6 lg:col-span-2">

            {/* BOOKING DETAILS */}
            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-lg font-bold text-slate-800">
                Booking Information
              </h2>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">
                    Booking ID
                  </p>

                  <p className="mt-1 font-bold">
                    #{quotation.bookingId}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">
                    Diagnosis ID
                  </p>

                  <p className="mt-1 font-bold">
                    #{quotation.diagnosisId}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">
                    Technician ID
                  </p>

                  <p className="mt-1 font-bold">
                    #{quotation.technicianId}
                  </p>
                </div>
              </div>
            </section>

            {/* REPAIR DESCRIPTION */}
            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <Wrench size={24} className="text-blue-600" />

                <h2 className="text-lg font-bold text-slate-800">
                  Recommended Repair
                </h2>
              </div>

              <div className="whitespace-pre-wrap rounded-xl bg-slate-50 p-5 text-sm leading-7 text-slate-700">
                {quotation.description ||
                  "No additional repair description provided."}
              </div>
            </section>

            {/* COST BREAKDOWN */}
            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-lg font-bold text-slate-800">
                Quotation Cost Breakdown
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b text-sm text-slate-500">
                      <th className="pb-3">Description</th>
                      <th className="pb-3 text-right">
                        Amount
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr className="border-b">
                      <td className="py-4">Parts Cost</td>
                      <td className="py-4 text-right">
                        {money(partsCost)}
                      </td>
                    </tr>

                    <tr className="border-b">
                      <td className="py-4">Labour Cost</td>
                      <td className="py-4 text-right">
                        {money(labourCost)}
                      </td>
                    </tr>

                    <tr className="border-b">
                      <td className="py-4">
                        Additional Charges
                      </td>
                      <td className="py-4 text-right">
                        {money(additionalCharges)}
                      </td>
                    </tr>

                    <tr className="text-lg font-bold">
                      <td className="pt-5">
                        Total Estimated Amount
                      </td>

                      <td className="pt-5 text-right text-blue-600">
                        {money(totalAmount)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* QUOTATION INFO */}
            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-3 font-bold text-slate-800">
                Quotation Information
              </h2>

              <p className="text-sm leading-6 text-slate-600">
                This quotation contains the repair estimate
                submitted by the technician. Please review the
                costs before approving or rejecting the repair.
              </p>

              {quotation.createdAt && (
                <p className="mt-3 text-sm text-slate-500">
                  Created:{" "}
                  {new Date(
                    quotation.createdAt
                  ).toLocaleString("en-IN")}
                </p>
              )}
            </section>
          </div>

          {/* RIGHT SIDE */}
          <div className="space-y-6">

            {/* TOTAL CARD */}
            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-3 flex items-center gap-3">
                <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                  <IndianRupee size={24} />
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Total Estimated Cost
                  </p>

                  <p className="text-2xl font-bold text-slate-800">
                    {money(totalAmount)}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-500">
                Amount calculated and saved by the backend.
              </p>
            </section>

            {/* APPROVAL CARD */}
            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-3 text-lg font-bold">
                Quotation Approval
              </h2>

              <p className="mb-5 text-sm text-slate-500">
                Please review the quotation before making
                your decision.
              </p>

              {status === "PENDING" ? (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() =>
                      reviewQuotation("APPROVED")
                    }
                    disabled={saving}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    <CheckCircle2 size={19} />
                    {saving
                      ? "Processing..."
                      : "Approve Quotation"}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      reviewQuotation("REJECTED")
                    }
                    disabled={saving}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50"
                  >
                    <XCircle size={19} />
                    Reject Quotation
                  </button>
                </div>
              ) : (
                <div
                  className={`rounded-xl p-5 text-center ${
                    status === "APPROVED"
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {status === "APPROVED" ? (
                    <CheckCircle2
                      size={32}
                      className="mx-auto"
                    />
                  ) : (
                    <XCircle
                      size={32}
                      className="mx-auto"
                    />
                  )}

                  <p className="mt-3 font-bold">
                    Quotation {status}
                  </p>

                  <p className="mt-2 text-sm">
                    {status === "APPROVED"
                      ? "Your approval has been recorded."
                      : "Your rejection has been recorded."}
                  </p>
                </div>
              )}
            </section>

            {/* SECURITY */}
            <section className="rounded-2xl bg-blue-50 p-5">
              <div className="flex gap-3">
                <ShieldCheck
                  size={22}
                  className="shrink-0 text-blue-600"
                />

                <div>
                  <h3 className="font-bold text-blue-800">
                    Transparent Pricing
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-blue-700">
                    The technician's quotation must be
                    approved before repair work proceeds.
                  </p>
                </div>
              </div>
            </section>

            {/* REFRESH */}
            <button
              type="button"
              onClick={loadQuotation}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw size={18} />
              Refresh Quotation
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}
