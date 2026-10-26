
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Car,
  Calendar,
  Clock,
  ArrowRight,
  ClipboardList,
  RefreshCw,
} from "lucide-react";
import { getTechnicianJobs } from "../../services/technicianService";

export default function AssignedJobs() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadJobs() {
    try {
      setLoading(true);
      setError("");

      const data = await getTechnicianJobs();
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Jobs loading error:", err);

      setError(
        err.response?.status === 403
          ? "Access denied. Check technician login and approval."
          : err.response?.data?.message ||
            err.message ||
            "Unable to load assigned jobs."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadJobs();
  }, []);

  const filteredJobs = jobs.filter((job) => {
    const query = search.toLowerCase();

    const searchableText = [
      job.assignmentId,
      job.bookingId,
      job.vehicleMake,
      job.vehicleModel,
      job.registrationNumber,
      job.serviceType,
    ]
      .map((value) => String(value ?? ""))
      .join(" ")
      .toLowerCase();

    return (
      searchableText.includes(query) &&
      (statusFilter === "ALL" || job.status === statusFilter)
    );
  });

  const countStatus = (status) =>
    jobs.filter((job) => job.status === status).length;

  const statusStyle = (status) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-700";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-700";
      case "CONFIRMED":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <ClipboardList className="text-emerald-600" size={28} />
              <h1 className="text-3xl font-bold text-slate-900">
                Assigned Jobs
              </h1>
            </div>

            <p className="mt-2 text-slate-500">
              View and manage your assigned vehicle services.
            </p>
          </div>

          <button
            onClick={loadJobs}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white disabled:opacity-50"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Total Jobs", jobs.length],
            ["Confirmed", countStatus("CONFIRMED")],
            ["In Progress", countStatus("IN_PROGRESS")],
            ["Completed", countStatus("COMPLETED")],
          ].map(([title, value]) => (
            <div
              key={title}
              className="rounded-2xl border bg-white p-5 shadow-sm"
            >
              <p className="text-sm text-slate-500">{title}</p>
              <p className="mt-2 text-3xl font-bold">{value}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm md:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-3.5 text-slate-400"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search job, vehicle, registration..."
              className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-300 px-4 py-3"
          >
            <option value="ALL">All Status</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
          </select>
        </div>

        {error && (
          <div role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <p className="rounded-xl bg-white p-6">
            Loading assigned jobs...
          </p>
        ) : !error && filteredJobs.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center">
            <p className="font-semibold text-slate-700">
              No jobs found
            </p>
            <p className="mt-2 text-sm text-slate-500">
              No matching jobs are currently assigned to you.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <div
                key={job.assignmentId}
                className="rounded-2xl border bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                  <div className="flex gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <Car size={26} />
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        {job.vehicleMake} {job.vehicleModel}
                      </h2>

                      <p className="text-sm text-slate-500">
                        {job.registrationNumber}
                      </p>

                      <p className="mt-2 text-sm">
                        Booking #{job.bookingId} | Job #{job.assignmentId}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={15} />
                          {job.serviceDate ?? "N/A"}
                        </span>

                        <span className="flex items-center gap-1">
                          <Clock size={15} />
                          {job.serviceTime ?? "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="lg:max-w-xs">
                    <p className="font-semibold">
                      {job.serviceType}
                    </p>

                    <p className="mt-2 text-sm text-slate-500">
                      {job.problemDescription || "No problem description"}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <span
                      className={`rounded-full px-3 py-2 text-center text-xs font-bold ${statusStyle(job.status)}`}
                    >
                      {job.status?.replaceAll("_", " ")}
                    </span>

                    <Link
                      to={`/technician/jobs/${job.assignmentId}`}
                      className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
                    >
                      Open Job
                      <ArrowRight size={17} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
