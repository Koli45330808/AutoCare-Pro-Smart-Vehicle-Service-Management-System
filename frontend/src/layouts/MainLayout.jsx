import { Outlet } from "react-router-dom";

function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-50">

      {/* Navbar */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <h1 className="text-xl font-bold text-blue-600">
            🚗 SmartVehicle
          </h1>

          <nav className="flex gap-6">

            <a
              href="/"
              className="text-slate-700 hover:text-blue-600"
            >
              Home
            </a>

            <a
              href="/services"
              className="text-slate-700 hover:text-blue-600"
            >
              Services
            </a>

            <a
              href="/about"
              className="text-slate-700 hover:text-blue-600"
            >
              About
            </a>

            <a
              href="/contact"
              className="text-slate-700 hover:text-blue-600"
            >
              Contact
            </a>

          </nav>

        </div>
      </header>

      {/* Page Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="mt-20 bg-slate-950 py-8 text-center text-white">
        © 2026 SmartVehicle Service Management System
      </footer>

    </div>
  );
}

export default MainLayout;