
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Car, Plus, Settings, Trash2 } from "lucide-react";
import { getAllVehicles, deleteVehicle } from "../../services/vehicleService";

function MyVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadVehicles = async () => {
    try {
      setError("");
      const data = await getAllVehicles();
      setVehicles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load vehicles:", err);
      setError("Could not load vehicles. Please check that the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const handleDelete = async (vehicle) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${vehicle.make} ${vehicle.model}?`
    );

    if (!confirmed) return;

    try {
      await deleteVehicle(vehicle.id);
      setVehicles((current) =>
        current.filter((item) => item.id !== vehicle.id)
      );
      alert("Vehicle deleted successfully!");
    } catch (err) {
      console.error("Failed to delete vehicle:", err);
      alert(
        err.response?.data?.message || "Failed to delete vehicle. Please try again."
      );
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            My Vehicles
          </h1>
          <p className="mt-2 text-slate-500">
            Manage your vehicles and their service information.
          </p>
        </div>

        <Link
          to="/customer/vehicles/add"
          className="flex w-fit items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          <Plus size={19} />
          Add Vehicle
        </Link>
      </div>

      {loading && (
        <p className="rounded-xl bg-white p-6 text-slate-600">
          Loading vehicles...
        </p>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
          <p>{error}</p>
          <button
            onClick={() => {
              setLoading(true);
              loadVehicles();
            }}
            className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-white"
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && vehicles.length === 0 && (
        <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
          <Car size={42} className="mx-auto text-slate-400" />
          <h2 className="mt-4 text-xl font-bold text-slate-800">
            No vehicles found
          </h2>
          <p className="mt-2 text-slate-500">
            Add your first vehicle to get started.
          </p>
          <Link
            to="/customer/vehicles/add"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            <Plus size={18} />
            Add Vehicle
          </Link>
        </div>
      )}

      {!loading && !error && vehicles.length > 0 && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {vehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="overflow-hidden rounded-2xl bg-white shadow-sm"
            >
              <div className="flex items-center justify-between bg-slate-800 p-6 text-white">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/10">
                    <Car size={28} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">
                      {vehicle.make} {vehicle.model}
                    </h2>
                    <p className="mt-1 text-sm text-slate-300">
                      {vehicle.registrationNumber}
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-300">
                  Active
                </span>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <p className="text-xs font-medium uppercase text-slate-400">
                      Owner
                    </p>
                    <p className="mt-1 font-semibold text-slate-800">
                      {vehicle.ownerName}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase text-slate-400">
                      Model Year
                    </p>
                    <p className="mt-1 font-semibold text-slate-800">
                      {vehicle.year}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase text-slate-400">
                      Vehicle Type
                    </p>
                    <p className="mt-1 font-semibold text-slate-800">
                      {vehicle.vehicleType || "Not specified"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase text-slate-400">
                      Fuel Type
                    </p>
                    <p className="mt-1 font-semibold text-slate-800">
                      {vehicle.fuelType || "Not specified"}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row">
                  <Link
                    to="/customer/book-service"
                    className="flex flex-1 items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Book Service
                  </Link>

                  <button
                    type="button"
                    onClick={() =>
                      alert("Vehicle editing is not connected yet.")
                    }
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    <Settings size={17} />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(vehicle)}
                    className="flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={17} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
        <div className="flex gap-4">
          <div className="text-2xl">💡</div>
          <div>
            <h3 className="font-bold text-blue-900">
              Keep your vehicle information updated
            </h3>
            <p className="mt-1 text-sm leading-6 text-blue-700">
              Accurate vehicle information helps technicians prepare for
              your service and provide better recommendations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyVehicles;
