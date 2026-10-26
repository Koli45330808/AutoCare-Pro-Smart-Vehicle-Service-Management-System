
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadJobs() {
      try {
        setLoading(true);
        setError("");

        const token = sessionStorage.getItem("technicianToken");

        if (!token) {
          throw new Error("Please log in as Technician.");
        }

        const response = await axios.get(
          "http://localhost:8080/api/technician/jobs",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = response.data;

        const jobList = Array.isArray(data)
          ? data
          : Array.isArray(data?.content)
            ? data.content
            : [];

        if (!cancelled) {
          setJobs(jobList);
        }
      } catch (err) {
        console.error("Technician dashboard error:", err);

        if (!cancelled) {
          setError(
            err.response?.status === 401
              ? "Login expired. Please log in again."
              : err.response?.status === 403
                ? "Technician access denied."
                : err.message || "Unable to load assigned jobs."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadJobs();

    return () => {
      cancelled = true;
    };
  }, []);

  const total = jobs.length;

  const pending = jobs.filter((job) =>
    ["PENDING", "CONFIRMED", "ASSIGNED"].includes(job.status)
  ).length;

  const inProgress = jobs.filter(
    (job) => job.status === "IN_PROGRESS"
  ).length;

  const completed = jobs.filter(
    (job) => job.status === "COMPLETED"
  ).length;

  const stats = [
    { title: "Total Assigned", value: total },
    { title: "Pending", value: pending },
    { title: "In Progress", value: inProgress },
    { title: "Completed", value: completed },
  ];

  return (
    <div className="min-h-screen space-y-6 bg-slate-100 p-6">
      <div>
        <p className="text-sm font-semibold text-emerald-600">
          TECHNICIAN PORTAL
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Technician Dashboard
        </h1>

        <p className="mt-2 text-slate-500">
          View and manage your assigned vehicle services.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">
              {stat.title}
            </p>

            <h2 className="mt-3 text-3xl font-bold text-slate-900">
              {stat.value}
            </h2>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-slate-900">
            My Assigned Jobs
          </h2>

          <Link
            to="/technician/jobs"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            View All Jobs
          </Link>
        </div>

        {loading && (
          <p className="text-slate-500">
            Loading assigned jobs...
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 p-3 text-red-700"
          >
            {error}
          </p>
        )}

        {!loading && !error && jobs.length === 0 && (
          <p className="text-slate-500">
            No jobs assigned to your account yet.
          </p>
        )}

        {!loading && !error && jobs.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="p-3">Job ID</th>
                  <th className="p-3">Vehicle ID</th>
                  <th className="p-3">Service</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>

              <tbody>
                {jobs.map((job, index) => {
                  const jobId = job.id ?? job.jobId;

                  return (
                    <tr
                      key={jobId ?? index}
                      className="border-b border-slate-100"
                    >
                      <td className="p-3">
                        #{jobId ?? "N/A"}
                      </td>

                      <td className="p-3">
                        {job.vehicleId ?? "N/A"}
                      </td>

                      <td className="p-3">
                        {job.serviceType ?? "Vehicle Service"}
                      </td>

                      <td className="p-3">
                        {job.serviceDate ?? "N/A"}
                      </td>

                      <td className="p-3">
                        <span className="font-medium text-slate-700">
                          {job.status ?? "UNKNOWN"}
                        </span>
                      </td>

                      <td className="p-3">
                        {jobId != null ? (
                          <Link
                            to={`/technician/jobs/${jobId}`}
                            className="font-medium text-emerald-600 hover:underline"
                          >
                            View Details
                          </Link>
                        ) : (
                          "N/A"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
