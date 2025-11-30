// src/components/topbar/Topbar.jsx
// Topbar berisi judul halaman, search bar, dan mini profile admin.

import { Search } from "lucide-react";

const TITLE_MAP = {
  "/dashboard": "Dashboard",
  "/transactions": "Transaksi",
  "/modal": "Manajemen Modal",
  "/reports": "Laporan & Analisis",
};

export default function Topbar({ currentPath }) {
  const title = TITLE_MAP[currentPath] || "Panel";

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-4 md:px-6">
      <h1 className="text-lg md:text-xl font-semibold">{title}</h1>

      <div className="flex items-center gap-4">
        {/* Search minimalis */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-full bg-slate-100">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari transaksi / buyer / produk..."
            className="bg-transparent text-xs md:text-sm outline-none w-32 md:w-64"
          />
        </div>

        {/* Mini profile */}
        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium">Admin</p>
            <p className="text-xs text-slate-500">BluePack</p>
          </div>
          <div className="h-9 w-9 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-semibold">
            F
          </div>
        </div>
      </div>
    </header>
  );
}
