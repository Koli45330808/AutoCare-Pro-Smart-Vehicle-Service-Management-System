
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  ClipboardList,
  CheckCircle2,
  Clock,
  IndianRupee,
  Download,
  Users,
  Wrench,
  RefreshCw,
  AlertCircle,
  Wallet,
  Car,
} from "lucide-react";

import { getAdminReportData } from "../../services/adminReportService";

const EMPTY_DATA = {
  bookings: [],
  customers: [],
  vehicles: [],
  assignments: [],
  technicians: [],
  invoices: [],
  payments: [],
};

function money(value) {
  return Number(value ?? 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });
}

function dateOnly(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

function withinPeriod(value, period) {
  if (period === "all") return true;

  const date = dateOnly(value);
  if (!date) return false;

  const today = new Date();
  const currentDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const target = new Date(`${date}T12:00:00`);
  if (Number.isNaN(target.getTime())) return false;

  if (period === "month") {
    return (
      target.getFullYear() === today.getFullYear() &&
      target.getMonth() === today.getMonth()
    );
  }

  const days = Number(period);
  const start = new Date(currentDate);
  start.setDate(start.getDate() - (days - 1));

  const end = new Date(currentDate);
  end.setDate(end.getDate() + 1);

  return target >= start && target < end;
}

function statusLabel(status) {
  return String(status || "UNKNOWN")
    .replaceAll("_", " ")
    .toUpperCase();
}

function csvValue(value) {
  const text = String(value ?? "");

  // Prevent spreadsheet formula injection.
  const safe = /^[\s]*[=+\-@]/.test(text) ? `'${text}` : text;

  return `"${safe.replace(/"/g, '""')}"`;
}

function downloadCSV(rows) {
  const csv = rows.map((row) => row.map(csvValue).join(",")).join("\r\n");

  const blob = new Blob(["\uFEFF", csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "smart-vehicle-service-report.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function Reports() {
  const [data, setData] = useState(EMPTY_DATA);
  const [period, setPeriod] = useState("all");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await getAdminReportData();
      setData(result);
    } catch (err) {
      setError(err.message || "Unable to load reports.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const {
    bookings,
    customers,
    vehicles,
    assignments,
    technicians,
    invoices,
    payments,
  } = data;

  const vehicleMap = useMemo(
    () => new Map(vehicles.map((v) => [String(v.id), v])),
    [vehicles]
  );

  const customerMap = useMemo(
    () => new Map(customers.map((c) => [String(c.id), c])),
    [customers]
  );

  const technicianMap = useMemo(
    () => new Map(technicians.map((t) => [String(t.id), t])),
    [technicians]
  );

  const assignmentMap = useMemo(
    () => new Map(assignments.map((a) => [String(a.bookingId), a])),
    [assignments]
  );

  const invoiceMap = useMemo(
    () => new Map(invoices.map((i) => [String(i.bookingId), i])),
    [invoices]
  );

  const bookingRows = useMemo(() => {
    return bookings.map((booking) => {
      const vehicle = vehicleMap.get(String(booking.vehicleId));
      const customer = vehicle
        ? customerMap.get(String(vehicle.customerId))
        : null;

      const assignment = assignmentMap.get(String(booking.id));
      const technician = assignment
        ? technicianMap.get(String(assignment.technicianId))
        : null;

      const invoice = invoiceMap.get(String(booking.id));

      return {
        id: booking.id,
        customer: customer?.name || vehicle?.ownerName || "-",
        technician: technician?.name || "Unassigned",
        technicianId: assignment?.technicianId ?? null,
        service: booking.serviceType || "-",
        date: dateOnly(booking.serviceDate),
        status: statusLabel(booking.status),
        amount: invoice?.totalAmount ?? null,
        paymentStatus: invoice?.paymentStatus || "NO INVOICE",
      };
    });
  }, [
    bookings,
    vehicleMap,
    customerMap,
    assignmentMap,
    technicianMap,
    invoiceMap,
  ]);

  const filteredBookings = useMemo(() => {
    return bookingRows.filter((booking) => {
      const dateMatches = withinPeriod(booking.date, period);
      const statusMatches =
        statusFilter === "ALL" || booking.status === statusFilter;

      return dateMatches && statusMatches;
    });
  }, [bookingRows, period, statusFilter]);

  const filteredPayments = useMemo(
    () =>
      payments.filter(
        (payment) =>
          payment.paymentStatus === "SUCCESS" &&
          withinPeriod(payment.paidAt, period)
      ),
    [payments, period]
  );

  const filteredInvoices = useMemo(
    () =>
      invoices.filter((invoice) =>
        withinPeriod(invoice.generatedAt, period)
      ),
    [invoices, period]
  );

  const totalRevenue = filteredPayments.reduce(
    (sum, payment) => sum + Number(payment.amount || 0),
    0
  );

  const pendingAmount = filteredInvoices
    .filter((invoice) => invoice.paymentStatus === "UNPAID")
    .reduce(
      (sum, invoice) => sum + Number(invoice.totalAmount || 0),
      0
    );

  const completed = filteredBookings.filter(
    (booking) => booking.status === "COMPLETED"
  );

  const pending = filteredBookings.filter(
    (booking) => booking.status === "PENDING"
  );

  const statusCounts = useMemo(() => {
    const counts = {};

    filteredBookings.forEach((booking) => {
      counts[booking.status] = (counts[booking.status] || 0) + 1;
    });

    return Object.entries(counts).sort(
      (a, b) => b[1] - a[1]
    );
  }, [filteredBookings]);

  const monthlyRevenue = useMemo(() => {
    const today = new Date();

    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(
        today.getFullYear(),
        today.getMonth() - (5 - index),
        1
      );

      const key = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      return {
        key,
        label: date.toLocaleDateString("en-IN", {
          month: "short",
          year: "2-digit",
        }),
        amount: 0,
      };
    });

    const byMonth = new Map(months.map((month) => [month.key, month]));

    filteredPayments.forEach((payment) => {
      const key = dateOnly(payment.paidAt).slice(0, 7);
      const month = byMonth.get(key);

      if (month) {
        month.amount += Number(payment.amount || 0);
      }
    });

    return months;
  }, [filteredPayments]);

  const maxRevenue = Math.max(
    1,
    ...monthlyRevenue.map((month) => month.amount)
  );

  const technicianStats = useMemo(() => {
    const stats = new Map();

    completed.forEach((booking) => {
      if (booking.technicianId == null) return;

      const id = String(booking.technicianId);

      if (!stats.has(id)) {
        stats.set(id, {
          id,
          name: booking.technician,
          jobs: 0,
          serviceValue: 0,
        });
      }

      const item = stats.get(id);
      item.jobs += 1;
      item.serviceValue += Number(booking.amount || 0);
    });

    return Array.from(stats.values()).sort(
      (a, b) => b.jobs - a.jobs
    );
  }, [completed]);

  function exportReport() {
    const rows = [
      [
        "Booking ID",
        "Customer",
        "Technician",
        "Service",
        "Service Date",
        "Booking Status",
        "Invoice Amount INR",
        "Payment Status",
      ],
      ...filteredBookings.map((booking) => [
        booking.id,
        booking.customer,
        booking.technician,
        booking.service,
        booking.date,
        booking.status,
        booking.amount ?? "",
        booking.paymentStatus,
      ]),
    ];

    downloadCSV(rows);
  }

  return (
    <div className="min-h-screen space-y-6 bg-slate-50 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-blue-600">
            Admin / Analytics
          </p>

          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            Reports & Analytics
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Live booking, invoice, payment, and technician reports.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={loadReports}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={exportReport}
            disabled={loading || !!error || filteredBookings.length === 0}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            <Download size={17} />
            Export CSV
          </button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle size={19} />
          {error}
        </div>
      )}

      {loading && (
        <div className="rounded-xl bg-blue-50 p-4 text-sm text-blue-700">
          Loading report data from backend...
        </div>
      )}

      <div className="grid gap-4 rounded-xl border bg-white p-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">
          Reporting Period

          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3"
          >
            <option value="all">All Time</option>
            <option value="month">This Month</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
          </select>
        </label>

        <label className="text-sm font-medium text-slate-700">
          Booking Status

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3"
          >
            <option value="ALL">All Statuses</option>

            {Array.from(
              new Set(bookingRows.map((b) => b.status))
            )
              .sort()
              .map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Bookings"
          value={filteredBookings.length}
          icon={<ClipboardList size={22} />}
          color="blue"
        />

        <StatCard
          title="Completed Services"
          value={completed.length}
          icon={<CheckCircle2 size={22} />}
          color="green"
        />

        <StatCard
          title="Pending Bookings"
          value={pending.length}
          icon={<Clock size={22} />}
          color="orange"
        />

        <StatCard
          title="Collected Revenue"
          value={money(totalRevenue)}
          icon={<IndianRupee size={22} />}
          color="purple"
        />

        <StatCard
          title="Customers"
          value={customers.length}
          icon={<Users size={22} />}
          color="blue"
        />

        <StatCard
          title="Vehicles"
          value={vehicles.length}
          icon={<Car size={22} />}
          color="green"
        />

        <StatCard
          title="Technicians"
          value={technicians.length}
          icon={<Wrench size={22} />}
          color="purple"
        />

        <StatCard
          title="Unpaid Invoice Value"
          value={money(pendingAmount)}
          icon={<Wallet size={22} />}
          color="orange"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-xl border bg-white p-5 shadow-sm xl:col-span-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="text-blue-600" size={22} />

            <div>
              <h2 className="font-bold text-slate-900">
                Monthly Collected Revenue
              </h2>

              <p className="text-sm text-slate-500">
                Successful payments in the last six calendar months
              </p>
            </div>
          </div>

          <div className="mt-8 flex h-64 items-end justify-around gap-3 border-b border-slate-200">
            {monthlyRevenue.map((month) => {
              const height =
                month.amount === 0
                  ? 0
                  : Math.max(
                      8,
                      (month.amount / maxRevenue) * 185
                    );

              return (
                <div
                  key={month.key}
                  className="flex h-full min-w-0 flex-1 flex-col items-center justify-end"
                >
                  <span className="mb-2 text-center text-xs font-medium text-slate-600">
                    {money(month.amount)}
                  </span>

                  <div
                    className="w-full max-w-16 rounded-t-lg bg-blue-500 transition-all hover:bg-blue-700"
                    style={{ height: `${height}px` }}
                    title={`${month.label}: ${money(month.amount)}`}
                  />

                  <span className="mt-3 pb-2 text-center text-xs text-slate-500">
                    {month.label}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="font-bold text-slate-900">
            Booking Status Breakdown
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Based on selected booking filters
          </p>

          <div className="mt-6 space-y-5">
            {statusCounts.length === 0 ? (
              <p className="text-sm text-slate-500">
                No bookings found.
              </p>
            ) : (
              statusCounts.map(([status, count]) => (
                <StatusRow
                  key={status}
                  label={status}
                  count={count}
                  total={filteredBookings.length}
                />
              ))
            )}
          </div>
        </section>
      </div>

      <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="border-b p-5">
          <h2 className="font-bold text-slate-900">
            Technician Performance
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Completed jobs and their invoice values
          </p>
        </div>

        {technicianStats.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">
            No completed technician jobs found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[550px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-4">Technician</th>
                  <th className="px-5 py-4">Completed Jobs</th>
                  <th className="px-5 py-4">Invoice Value</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {technicianStats.map((tech) => (
                  <tr key={tech.id}>
                    <td className="px-5 py-4 font-semibold">
                      {tech.name}
                    </td>

                    <td className="px-5 py-4">{tech.jobs}</td>

                    <td className="px-5 py-4 font-semibold">
                      {money(tech.serviceValue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="border-b p-5">
          <h2 className="font-bold text-slate-900">
            Booking Report
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {filteredBookings.length} matching bookings
          </p>
        </div>

        {filteredBookings.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">
            No bookings match your filters.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-4">Booking</th>
                  <th className="px-4 py-4">Customer</th>
                  <th className="px-4 py-4">Technician</th>
                  <th className="px-4 py-4">Service</th>
                  <th className="px-4 py-4">Date</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Invoice</th>
                  <th className="px-4 py-4">Payment</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4 font-semibold text-blue-700">
                      #{booking.id}
                    </td>

                    <td className="px-4 py-4">
                      {booking.customer}
                    </td>

                    <td className="px-4 py-4">
                      {booking.technician}
                    </td>

                    <td className="px-4 py-4">
                      {booking.service}
                    </td>

                    <td className="px-4 py-4">
                      {booking.date}
                    </td>

                    <td className="px-4 py-4">
                      <BookingBadge status={booking.status} />
                    </td>

                    <td className="px-4 py-4 font-semibold">
                      {booking.amount == null
                        ? "-"
                        : money(booking.amount)}
                    </td>

                    <td className="px-4 py-4">
                      {booking.paymentStatus}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    orange: "bg-orange-50 text-orange-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">
          {title}
        </p>

        <div className={`rounded-lg p-3 ${colors[color]}`}>
          {icon}
        </div>
      </div>

      <p className="mt-4 break-words text-2xl font-bold">
        {value}
      </p>
    </div>
  );
}

function StatusRow({ label, count, total }) {
  const percentage = total ? (count / total) * 100 : 0;

  return (
    <div>
      <div className="mb-2 flex justify-between text-sm">
        <span>{label}</span>
        <span className="font-semibold">
          {count} ({Math.round(percentage)}%)
        </span>
      </div>

      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-blue-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function BookingBadge({ status }) {
  const colors = {
    COMPLETED: "bg-green-100 text-green-700",
    PENDING: "bg-orange-100 text-orange-700",
    CONFIRMED: "bg-blue-100 text-blue-700",
    IN_PROGRESS: "bg-indigo-100 text-indigo-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        colors[status] || "bg-slate-100 text-slate-700"
      }`}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}
