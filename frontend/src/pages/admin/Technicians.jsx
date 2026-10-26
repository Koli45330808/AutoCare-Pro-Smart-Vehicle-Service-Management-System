
import { useCallback, useEffect, useState } from "react";

import {
  Users,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Wrench,
  Search,
  AlertCircle,
  Loader2,
} from "lucide-react";

import {
  getTechnicians,
  approveTechnician,
  rejectTechnician,
} from "../../services/adminTechnicianService";

const STATUS_COLORS = {
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  PENDING: "bg-amber-100 text-amber-700",
};

function getErrorMessage(error) {
  const data = error?.response?.data;

  return (
    data?.detail ||
    data?.message ||
    error?.message ||
    "Unable to complete request."
  );
}

export default function Technicians() {
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadTechnicians = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getTechnicians();

      setTechnicians(
        Array.isArray(data) ? data : []
      );

      return true;
    } catch (err) {
      setError(getErrorMessage(err));
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTechnicians();
  }, [loadTechnicians]);

  async function handleAction(id, action) {
    if (updatingId !== null) return;

    const technician = technicians.find(
      (item) => Number(item.id) === Number(id)
    );

    if (
      !technician ||
      technician.approvalStatus !== "PENDING"
    ) {
      setError(
        "Only pending technicians can be reviewed."
      );
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to ${action} technician #${id}?`
    );

    if (!confirmed) return;

    try {
      setUpdatingId(id);
      setError("");
      setSuccess("");

      if (action === "approve") {
        await approveTechnician(id);
      } else if (action === "reject") {
        await rejectTechnician(id);
      } else {
        throw new Error("Invalid action.");
      }

      const refreshed = await loadTechnicians();

      if (refreshed) {
        setSuccess(
          action === "approve"
            ? `Technician #${id} approved successfully.`
            : `Technician #${id} rejected successfully.`
        );
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUpdatingId(null);
    }
  }

  const pending = technicians.filter(
    (item) => item.approvalStatus === "PENDING"
  ).length;

  const approved = technicians.filter(
    (item) => item.approvalStatus === "APPROVED"
  ).length;

  const rejected = technicians.filter(
    (item) => item.approvalStatus === "REJECTED"
  ).length;

  const filteredTechnicians = technicians.filter(
    (technician) => {
      const term = search.trim().toLowerCase();

      const text = [
        technician.id,
        technician.name,
        technician.email,
        technician.phone,
        technician.specialization,
      ]
        .join(" ")
        .toLowerCase();

      return (
        text.includes(term) &&
        (filter === "ALL" ||
          technician.approvalStatus === filter)
      );
    }
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              ADMIN / TEAM MANAGEMENT
            </p>

            <h1 className="mt-2 text-2xl font-bold text-slate-900 md:text-3xl">
              Technician Management
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Review technician registrations and approve accounts.
            </p>
          </div>

          <button
            type="button"
            onClick={loadTechnicians}
            disabled={loading || updatingId !== null}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw
              size={18}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
          >
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {/* SUCCESS */}
        {success && (
          <div
            role="status"
            className="flex items-center gap-3 rounded-xl bg-green-50 p-4 text-green-700"
          >
            <CheckCircle2 size={20} />
            {success}
          </div>
        )}

        {/* STATISTICS */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Total Technicians", technicians.length],
            ["Pending Approval", pending],
            ["Approved", approved],
            ["Rejected", rejected],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-2xl border bg-white p-5 shadow-sm"
            >
              <p className="text-sm text-slate-500">
                {label}
              </p>

              <p className="mt-3 text-3xl font-bold text-slate-900">
                {loading ? "..." : value}
              </p>
            </div>
          ))}
        </div>

        {/* SEARCH AND FILTER */}
        <div className="flex flex-col gap-3 rounded-2xl border bg-white p-5 shadow-sm sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-3.5 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search technician..."
              className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={filter}
            onChange={(event) =>
              setFilter(event.target.value)
            }
            className="rounded-xl border border-slate-300 px-4 py-3"
          >
            <option value="ALL">All Technicians</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {/* TECHNICIAN TABLE */}
        <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b p-5">
            <Users
              size={20}
              className="text-blue-600"
            />

            <h2 className="text-lg font-bold">
              Registered Technicians
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center gap-3 p-8 text-slate-500">
              <Loader2
                size={20}
                className="animate-spin"
              />
              Loading technicians...
            </div>
          ) : filteredTechnicians.length === 0 ? (
            <p className="p-8 text-center text-slate-500">
              No technicians found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="p-4">ID</th>
                    <th className="p-4">Technician</th>
                    <th className="p-4">Phone</th>
                    <th className="p-4">Specialization</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTechnicians.map((tech) => (
                    <tr
                      key={tech.id}
                      className="border-t hover:bg-slate-50"
                    >
                      <td className="p-4 font-semibold">
                        #{tech.id}
                      </td>

                      <td className="p-4">
                        <p className="font-semibold text-slate-900">
                          {tech.name ||
                            `Technician #${tech.id}`}
                        </p>

                        <p className="mt-1 text-slate-500">
                          {tech.email || "N/A"}
                        </p>
                      </td>

                      <td className="p-4">
                        {tech.phone || "N/A"}
                      </td>

                      <td className="p-4">
                        <span className="inline-flex items-center gap-2">
                          <Wrench size={15} />
                          {tech.specialization ||
                            "Not specified"}
                        </span>
                      </td>

                      <td className="p-4">
                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                            STATUS_COLORS[
                              tech.approvalStatus
                            ] ||
                            "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {tech.approvalStatus ||
                            "UNKNOWN"}
                        </span>
                      </td>

                      <td className="p-4">
                        {tech.approvalStatus ===
                        "PENDING" ? (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              disabled={updatingId !== null}
                              onClick={() =>
                                handleAction(
                                  tech.id,
                                  "approve"
                                )
                              }
                              className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-2 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                            >
                              {updatingId === tech.id ? (
                                <Loader2
                                  size={16}
                                  className="animate-spin"
                                />
                              ) : (
                                <CheckCircle2 size={16} />
                              )}
                              Approve
                            </button>

                            <button
                              type="button"
                              disabled={updatingId !== null}
                              onClick={() =>
                                handleAction(
                                  tech.id,
                                  "reject"
                                )
                              }
                              className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-2 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                            >
                              <XCircle size={16} />
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs font-medium text-slate-400">
                            Reviewed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
