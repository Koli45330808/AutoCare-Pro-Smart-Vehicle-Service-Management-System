
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  CalendarDays,
  UserRound,
  Car,
  Wrench,
  CheckCircle2,
  Clock,
} from "lucide-react";

const initialBookings = [
  {
    id: "SVS-1001",
    customer: "Rahul Sharma",
    phone: "9876543210",
    vehicle: "Honda City",
    service: "General Service",
    date: "2026-10-10",
    status: "Pending",
    technician: "Not Assigned",
  },
  {
    id: "SVS-1002",
    customer: "Priya Patil",
    phone: "9876543211",
    vehicle: "Hyundai Creta",
    service: "Engine Repair",
    date: "2026-10-10",
    status: "Confirmed",
    technician: "Rahul Patil",
  },
  {
    id: "SVS-1003",
    customer: "Amit Verma",
    phone: "9876543212",
    vehicle: "Maruti Swift",
    service: "Oil Change",
    date: "2026-10-11",
    status: "In Progress",
    technician: "Sagar More",
  },
  {
    id: "SVS-1004",
    customer: "Sneha Joshi",
    phone: "9876543213",
    vehicle: "Tata Nexon",
    service: "Brake Inspection",
    date: "2026-10-12",
    status: "Completed",
    technician: "Rahul Patil",
  },
  {
    id: "SVS-1005",
    customer: "Vikas Jadhav",
    phone: "9876543214",
    vehicle: "Mahindra Thar",
    service: "AC Repair",
    date: "2026-10-13",
    status: "Pending",
    technician: "Not Assigned",
  },
];

const technicians = [
  "Rahul Patil",
  "Sagar More",
  "Amit Deshmukh",
  "Neha Shinde",
];

const statusStyles = {
  Pending: "bg-amber-100 text-amber-700",
  Confirmed: "bg-blue-100 text-blue-700",
  "In Progress": "bg-purple-100 text-purple-700",
  Completed: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

function AdminBookings() {
  const [bookings, setBookings] = useState(initialBookings);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [technicianFilter, setTechnicianFilter] = useState("All");

  const updateBooking = (id, updates) => {
    setBookings((previous) =>
      previous.map((booking) =>
        booking.id === id ? { ...booking, ...updates } : booking
      )
    );
  };

  const filteredBookings = bookings.filter((booking) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      booking.id.toLowerCase().includes(searchText) ||
      booking.customer.toLowerCase().includes(searchText) ||
      booking.vehicle.toLowerCase().includes(searchText) ||
      booking.service.toLowerCase().includes(searchText);

    const matchesStatus =
      statusFilter === "All" || booking.status === statusFilter;

    const matchesTechnician =
      technicianFilter === "All" ||
      booking.technician === technicianFilter;

    return matchesSearch && matchesStatus && matchesTechnician;
  });

  const pendingCount = bookings.filter(
    (booking) => booking.status === "Pending"
  ).length;

  const activeCount = bookings.filter(
    (booking) =>
      booking.status === "Confirmed" ||
      booking.status === "In Progress"
  ).length;

  const completedCount = bookings.filter(
    (booking) => booking.status === "Completed"
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              to="/admin"
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft size={17} />
              Back to Dashboard
            </Link>

            <h1 className="text-3xl font-bold text-slate-800">
              Booking Management
            </h1>

            <p className="mt-2 text-slate-500">
              Review service requests, assign technicians and manage status.
            </p>
          </div>

          <div className="rounded-xl bg-white px-4 py-3 shadow-sm">
            <p className="text-sm text-slate-500">Total Bookings</p>
            <p className="text-2xl font-bold text-slate-800">
              {bookings.length}
            </p>
          </div>
        </div>

        {/* Summary cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-100 p-3 text-amber-700">
                <Clock size={23} />
              </div>
              <div>
                <p className="text-sm text-slate-500">Pending</p>
                <p className="text-2xl font-bold text-slate-800">
                  {pendingCount}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
                <Wrench size={23} />
              </div>
              <div>
                <p className="text-sm text-slate-500">Active Services</p>
                <p className="text-2xl font-bold text-slate-800">
                  {activeCount}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-green-100 p-3 text-green-700">
                <CheckCircle2 size={23} />
              </div>
              <div>
                <p className="text-sm text-slate-500">Completed</p>
                <p className="text-2xl font-bold text-slate-800">
                  {completedCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and filters */}
        <div className="mb-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="relative">
              <Search
                size={19}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search booking, customer, vehicle..."
                className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
            >
              <option value="All">All statuses</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <select
              value={technicianFilter}
              onChange={(event) =>
                setTechnicianFilter(event.target.value)
              }
              className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
            >
              <option value="All">All technicians</option>
              <option value="Not Assigned">Not Assigned</option>
              {technicians.map((technician) => (
                <option key={technician} value={technician}>
                  {technician}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bookings table */}
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <h2 className="text-xl font-bold text-slate-800">
              Service Requests
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Showing {filteredBookings.length} of {bookings.length} bookings
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4">Booking / Customer</th>
                  <th className="px-5 py-4">Vehicle / Service</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Technician</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="align-top hover:bg-slate-50">
                    <td className="px-5 py-5">
                      <p className="font-semibold text-slate-800">
                        {booking.id}
                      </p>
                      <p className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                        <UserRound size={15} />
                        {booking.customer}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {booking.phone}
                      </p>
                    </td>

                    <td className="px-5 py-5">
                      <p className="flex items-center gap-2 font-medium text-slate-700">
                        <Car size={16} />
                        {booking.vehicle}
                      </p>
                      <p className="mt-2 text-sm text-slate-500">
                        {booking.service}
                      </p>
                    </td>

                    <td className="px-5 py-5">
                      <p className="flex items-center gap-2 text-sm text-slate-600">
                        <CalendarDays size={16} />
                        {booking.date}
                      </p>
                    </td>

                    <td className="px-5 py-5">
                      <select
                        value={booking.technician}
                        onChange={(event) => {
                          const technician = event.target.value;
                          updateBooking(booking.id, {
                            technician,
                            status:
                              technician !== "Not Assigned" &&
                              booking.status === "Pending"
                                ? "Confirmed"
                                : booking.status,
                          });
                        }}
                        className="max-w-[180px] rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                      >
                        <option value="Not Assigned">Not Assigned</option>
                        {technicians.map((technician) => (
                          <option key={technician} value={technician}>
                            {technician}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="px-5 py-5">
                      <span
                        className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
                          statusStyles[booking.status] ||
                          "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>

                    <td className="px-5 py-5">
                      <div className="flex min-w-[150px] flex-col items-start gap-2">
                        {booking.status === "Pending" && (
                          <button
                            onClick={() =>
                              updateBooking(booking.id, {
                                status: "Confirmed",
                              })
                            }
                            className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                          >
                            Confirm Booking
                          </button>
                        )}

                        {booking.status === "Confirmed" && (
                          <button
                            onClick={() =>
                              updateBooking(booking.id, {
                                status: "In Progress",
                              })
                            }
                            className="rounded-lg bg-purple-600 px-3 py-2 text-xs font-semibold text-white hover:bg-purple-700"
                          >
                            Start Service
                          </button>
                        )}

                        {booking.status === "In Progress" && (
                          <button
                            onClick={() =>
                              updateBooking(booking.id, {
                                status: "Completed",
                              })
                            }
                            className="rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700"
                          >
                            Mark Completed
                          </button>
                        )}

                        {booking.status !== "Completed" &&
                          booking.status !== "Cancelled" && (
                            <button
                              onClick={() =>
                                updateBooking(booking.id, {
                                  status: "Cancelled",
                                })
                              }
                              className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                            >
                              Cancel Booking
                            </button>
                          )}

                        {(booking.status === "Completed" ||
                          booking.status === "Cancelled") && (
                          <span className="text-xs text-slate-400">
                            No further actions
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredBookings.length === 0 && (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-5 py-12 text-center text-slate-500"
                    >
                      No bookings match your search or filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-5 text-center text-sm text-slate-400">
          Demo data only — changes reset when this page is refreshed.
        </p>
      </div>
    </div>
  );
}

export default AdminBookings;