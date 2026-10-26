import { Bell, Car, User } from "lucide-react";

function Navbar() {
  return (
    <header className="sticky top-0 z-50 flex h-[72px] items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm md:px-6">

      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
          <Car size={22} />
        </div>

        <div>
          <h1 className="text-lg font-bold text-slate-800">
            Smart Vehicle
          </h1>

          <p className="hidden text-xs text-slate-500 sm:block">
            Service Management
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">

        <button className="relative rounded-xl p-2 text-slate-600 hover:bg-slate-100">
          <Bell size={21} />

          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"></span>
        </button>

        <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-700">
            <User size={19} />
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-slate-800">
              Customer
            </p>

            <p className="text-xs text-slate-500">
              customer@example.com
            </p>
          </div>
        </div>

      </div>

    </header>
  );
}

export default Navbar;