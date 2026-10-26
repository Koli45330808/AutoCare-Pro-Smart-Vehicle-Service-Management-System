import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  CalendarDays,
  Wrench,
  FileText,
  CreditCard,
  Car,
  AlertCircle,
  CheckCheck,
  Trash2,
} from "lucide-react";

function Notifications() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "booking",
      title: "Booking Confirmed",
      message:
        "Your service booking for Honda City has been confirmed.",
      time: "10 minutes ago",
      date: "10 October 2026",
      read: false,
      link: "/customer/bookings/SVS-1001",
    },
    {
      id: 2,
      type: "technician",
      title: "Technician Assigned",
      message:
        "Rahul Patil has been assigned to service your Honda City.",
      time: "2 hours ago",
      date: "10 October 2026",
      read: false,
      link: "/customer/bookings/SVS-1001",
    },
    {
      id: 3,
      type: "quotation",
      title: "Quotation Ready",
      message:
        "A new service quotation of ₹5,664 is ready for your approval.",
      time: "Yesterday",
      date: "09 October 2026",
      read: false,
      link: "/customer/quotation/SVS-1001",
    },
    {
      id: 4,
      type: "service",
      title: "Vehicle Inspection Started",
      message:
        "The technician has started inspecting your vehicle.",
      time: "Yesterday",
      date: "09 October 2026",
      read: true,
      link: "/customer/bookings/SVS-1001",
    },
    {
      id: 5,
      type: "payment",
      title: "Payment Successful",
      message:
        "Your payment of ₹3,200 for the previous service was successful.",
      time: "5 days ago",
      date: "05 October 2026",
      read: true,
      link: "/customer/invoice/SVS-0998",
    },
    {
      id: 6,
      type: "completed",
      title: "Service Completed",
      message:
        "Your Tata Nexon service has been successfully completed.",
      time: "1 week ago",
      date: "01 October 2026",
      read: true,
      link: "/customer/service-history",
    },
  ]);

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const markAsRead = (id) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  };

  const deleteNotification = (id) => {
    setNotifications((current) =>
      current.filter((notification) => notification.id !== id)
    );
  };

  return (
    <div className="space-y-8">

      {/* Header */}

      <div>

        <Link
          to="/customer"
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </Link>

        <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>

            <div className="flex items-center gap-3">

              <h1 className="text-3xl font-bold text-slate-800">
                Notifications
              </h1>

              {unreadCount > 0 && (
                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-600">
                  {unreadCount} New
                </span>
              )}

            </div>

            <p className="mt-2 text-slate-500">
              Stay updated about your vehicle service.
            </p>

          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <CheckCheck size={17} />
              Mark All as Read
            </button>
          )}

        </div>

      </div>

      {/* Summary */}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

        <SummaryCard
          icon={<Bell size={21} />}
          label="Total Notifications"
          value={notifications.length}
          bg="bg-blue-100"
          text="text-blue-600"
        />

        <SummaryCard
          icon={<AlertCircle size={21} />}
          label="Unread"
          value={unreadCount}
          bg="bg-red-100"
          text="text-red-600"
        />

        <SummaryCard
          icon={<CheckCircle2 size={21} />}
          label="Read"
          value={notifications.length - unreadCount}
          bg="bg-green-100"
          text="text-green-600"
        />

      </div>

      {/* Notifications */}

      {notifications.length === 0 ? (

        <div className="rounded-2xl bg-white p-12 text-center shadow-sm">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Bell size={30} />
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-800">
            No Notifications
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            You are all caught up.
          </p>

        </div>

      ) : (

        <div className="space-y-4">

          {notifications.map((notification) => (

            <NotificationCard
              key={notification.id}
              notification={notification}
              onRead={markAsRead}
              onDelete={deleteNotification}
            />

          ))}

        </div>

      )}

    </div>
  );
}

function NotificationCard({
  notification,
  onRead,
  onDelete,
}) {
  return (
    <div
      className={`rounded-2xl border p-5 transition ${
        notification.read
          ? "border-slate-200 bg-white"
          : "border-blue-100 bg-blue-50/50"
      }`}
    >

      <div className="flex gap-4">

        {/* Icon */}

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
            getNotificationStyle(notification.type).background
          } ${
            getNotificationStyle(notification.type).text
          }`}
        >
          {getNotificationIcon(notification.type)}
        </div>

        {/* Content */}

        <div className="min-w-0 flex-1">

          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">

            <div>

              <div className="flex flex-wrap items-center gap-2">

                <h2 className="font-bold text-slate-800">
                  {notification.title}
                </h2>

                {!notification.read && (
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                )}

              </div>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {notification.message}
              </p>

            </div>

            <p className="shrink-0 text-xs font-medium text-slate-400">
              {notification.time}
            </p>

          </div>

          {/* Bottom */}

          <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">

            <p className="text-xs text-slate-400">
              {notification.date}
            </p>

            <div className="flex flex-wrap gap-2">

              {!notification.read && (
                <button
                  onClick={() => onRead(notification.id)}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                >
                  <CheckCheck size={15} />
                  Mark as Read
                </button>
              )}

              <Link
                to={notification.link}
                onClick={() => onRead(notification.id)}
                className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
              >
                View Details
              </Link>

              <button
                onClick={() => onDelete(notification.id)}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-50"
              >
                <Trash2 size={15} />
                Delete
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

function getNotificationIcon(type) {
  const icons = {
    booking: <CalendarDays size={22} />,
    technician: <Wrench size={22} />,
    quotation: <FileText size={22} />,
    service: <Car size={22} />,
    payment: <CreditCard size={22} />,
    completed: <CheckCircle2 size={22} />,
  };

  return icons[type] || <Bell size={22} />;
}

function getNotificationStyle(type) {
  const styles = {
    booking: {
      background: "bg-blue-100",
      text: "text-blue-600",
    },
    technician: {
      background: "bg-purple-100",
      text: "text-purple-600",
    },
    quotation: {
      background: "bg-orange-100",
      text: "text-orange-600",
    },
    service: {
      background: "bg-yellow-100",
      text: "text-yellow-600",
    },
    payment: {
      background: "bg-green-100",
      text: "text-green-600",
    },
    completed: {
      background: "bg-emerald-100",
      text: "text-emerald-600",
    },
  };

  return (
    styles[type] || {
      background: "bg-slate-100",
      text: "text-slate-600",
    }
  );
}

function SummaryCard({
  icon,
  label,
  value,
  bg,
  text,
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">

      <div className="flex items-center gap-4">

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${bg} ${text}`}
        >
          {icon}
        </div>

        <div>

          <p className="text-sm text-slate-500">
            {label}
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-800">
            {value}
          </p>

        </div>

      </div>

    </div>
  );
}

export default Notifications;