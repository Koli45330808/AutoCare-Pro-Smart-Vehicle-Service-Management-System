
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// ================= AUTHENTICATION =================
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import AdminLogin from "./pages/admin/AdminLogin";
import TechnicianLogin from "./pages/technician/TechnicianLogin";
import TechnicianRegister from "./pages/technician/TechnicianRegister";

// ================= LAYOUTS =================
import CustomerLayout from "./layouts/CustomerLayout";
import AdminLayout from "./layouts/AdminLayout";
import TechnicianLayout from "./layouts/TechnicianLayout";

// ================= PROTECTED ROUTES =================
import ProtectedRoute from "./routes/ProtectedRoute";

// ================= CUSTOMER PAGES =================
import Dashboard from "./pages/customer/Dashboard";
import MyVehicles from "./pages/customer/MyVehicles";
import AddVehicle from "./pages/customer/AddVehicle";
import BookService from "./pages/customer/BookService";
import MyBookings from "./pages/customer/MyBookings";
import BookingDetails from "./pages/customer/BookingDetails";

import Quotation from "./pages/customer/Quotation";
import QuotationList from "./pages/customer/QuotationList";

import Invoice from "./pages/customer/Invoice";
import InvoiceList from "./pages/customer/InvoiceList";

import Payment from "./pages/customer/Payment";
import MyPayments from "./pages/customer/MyPayments";

import ServiceHistory from "./pages/customer/ServiceHistory";

import Reviews from "./pages/customer/Reviews";
import ReviewList from "./pages/customer/ReviewList";

import Notifications from "./pages/customer/Notifications";
import AIAssistant from "./pages/customer/AIAssistant";

// ================= ADMIN PAGES =================
import AdminDashboard from "./pages/admin/Dashboard";
import ManageBookings from "./pages/admin/ManageBookings";
import AdminCustomers from "./pages/admin/Customers";
import AdminTechnicians from "./pages/admin/Technicians";
import AdminReports from "./pages/admin/Reports";
import AssignTechnician from "./pages/admin/AssignTechnician";

// NEW: ADMIN INVOICES AND PAYMENTS
import AdminInvoices from "./pages/admin/AdminInvoices";
import AdminPayments from "./pages/admin/AdminPayments";

// ================= TECHNICIAN PAGES =================
import TechnicianDashboard from "./pages/technician/Dashboard";
import AssignedJobs from "./pages/technician/AssignedJobs";
import JobDetails from "./pages/technician/JobDetails";
import VehicleInspection from "./pages/technician/VehicleInspection";
import Diagnosis from "./pages/technician/Diagnosis";
import TechnicianQuotation from "./pages/technician/Quotation";
import ServiceExecution from "./pages/technician/ServiceExecution";
import TechnicianInvoice from "./pages/technician/Invoice";
import Delivery from "./pages/technician/Delivery";
import Inspection from "./pages/technician/Inspection";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ================= HOME ================= */}
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        {/* ================= CUSTOMER AUTH ================= */}
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* ================= ADMIN AUTH ================= */}
        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />

        {/* ================= TECHNICIAN AUTH ================= */}
        <Route
          path="/technician/login"
          element={<TechnicianLogin />}
        />

        <Route
          path="/technician/register"
          element={<TechnicianRegister />}
        />

        {/* ================= CUSTOMER ROUTES ================= */}
        <Route
          path="/customer"
          element={<CustomerLayout />}
        >
          <Route
            index
            element={<Dashboard />}
          />

          {/* VEHICLES */}
          <Route
            path="vehicles"
            element={<MyVehicles />}
          />

          <Route
            path="vehicles/add"
            element={<AddVehicle />}
          />

          {/* BOOKINGS */}
          <Route
            path="book-service"
            element={<BookService />}
          />

          <Route
            path="bookings"
            element={<MyBookings />}
          />

          <Route
            path="bookings/:id"
            element={<BookingDetails />}
          />

          {/* QUOTATIONS */}
          <Route
            path="quotations"
            element={<QuotationList />}
          />

          <Route
            path="quotation/:id"
            element={<Quotation />}
          />

          <Route
            path="quotation"
            element={
              <Navigate
                to="/customer/quotations"
                replace
              />
            }
          />

          {/* INVOICES */}
          <Route
            path="invoices"
            element={<InvoiceList />}
          />

          <Route
            path="invoice/:id"
            element={<Invoice />}
          />

          <Route
            path="invoice"
            element={
              <Navigate
                to="/customer/invoices"
                replace
              />
            }
          />

          {/* PAYMENTS */}
          <Route
            path="payments"
            element={<MyPayments />}
          />

          <Route
            path="payment/:id"
            element={<Payment />}
          />

          <Route
            path="payment"
            element={
              <Navigate
                to="/customer/payments"
                replace
              />
            }
          />

          {/* SERVICE HISTORY */}
          <Route
            path="service-history"
            element={<ServiceHistory />}
          />

          {/* REVIEWS */}
          <Route
            path="reviews"
            element={<ReviewList />}
          />

          <Route
            path="reviews/:id"
            element={<Reviews />}
          />

          {/* NOTIFICATIONS */}
          <Route
            path="notifications"
            element={<Notifications />}
          />

          {/* AI ASSISTANT */}
          <Route
            path="ai-assistant"
            element={<AIAssistant />}
          />
        </Route>

        {/* ================= ADMIN ROUTES ================= */}
        <Route
          element={<ProtectedRoute role="ADMIN" />}
        >
          <Route
            path="/admin"
            element={<AdminLayout />}
          >
            {/* ADMIN DASHBOARD */}
            <Route
              index
              element={<AdminDashboard />}
            />

            {/* MANAGE BOOKINGS */}
            <Route
              path="bookings"
              element={<ManageBookings />}
            />

            {/* MANAGE CUSTOMERS */}
            <Route
              path="customers"
              element={<AdminCustomers />}
            />

            {/* MANAGE TECHNICIANS */}
            <Route
              path="technicians"
              element={<AdminTechnicians />}
            />

            {/* REPORTS */}
            <Route
              path="reports"
              element={<AdminReports />}
            />

            {/* ASSIGN TECHNICIAN */}
            <Route
              path="assign-technician"
              element={<AssignTechnician />}
            />

            {/* NEW: ADMIN INVOICES */}
            <Route
              path="invoices"
              element={<AdminInvoices />}
            />

            {/* NEW: ADMIN PAYMENTS */}
            <Route
              path="payments"
              element={<AdminPayments />}
            />
          </Route>
        </Route>

        {/* ================= TECHNICIAN ROUTES ================= */}
        <Route
          element={<ProtectedRoute role="TECHNICIAN" />}
        >
          <Route
            path="/technician"
            element={<TechnicianLayout />}
          >
            {/* TECHNICIAN DASHBOARD */}
            <Route
              index
              element={<TechnicianDashboard />}
            />

            {/* ASSIGNED JOBS */}
            <Route
              path="jobs"
              element={<AssignedJobs />}
            />

            {/* JOB DETAILS */}
            <Route
              path="jobs/:id"
              element={<JobDetails />}
            />

            {/* VEHICLE INSPECTION */}
            <Route
              path="jobs/:id/inspection"
              element={<VehicleInspection />}
            />

            {/* DIAGNOSIS */}
            <Route
              path="jobs/:id/diagnosis"
              element={<Diagnosis />}
            />

            {/* QUOTATION */}
            <Route
              path="jobs/:id/quotation"
              element={<TechnicianQuotation />}
            />

            {/* SERVICE EXECUTION */}
            <Route
              path="jobs/:id/service"
              element={<ServiceExecution />}
            />

            {/* TECHNICIAN INVOICE */}
            <Route
              path="jobs/:id/invoice"
              element={<TechnicianInvoice />}
            />

            {/* VEHICLE DELIVERY */}
            <Route
              path="jobs/:id/delivery"
              element={<Delivery />}
            />
          </Route>

          {/* STANDALONE INSPECTION */}
          <Route
            path="/inspection/:id"
            element={<Inspection />}
          />
        </Route>

        {/* ================= UNKNOWN ROUTES ================= */}
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
