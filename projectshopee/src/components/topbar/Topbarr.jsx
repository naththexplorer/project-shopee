// src/components/topbar/Topbarr.jsx
import { Search, Menu } from "lucide-react";

const TITLE_MAP = {
  "/dashboard": "Dashboard",
  "/transactions": "Transaksi",
  "/modal": "Manajemen Uang",
  "/reports": "Riwayat Laporan",
};

export default function Topbar({ currentPath, onToggleSidebar }) {
  const title = TITLE_MAP[currentPath] || "Panel";

  return (
    <header
      className="
        h-16 sm:h-20
        border-b border-slate-200/80
        bg-white/80 backdrop-blur-xl
        flex items-center justify-between
        px-3 sm:px-6 md:px-8
        sticky top-0 z-30
        shadow-sm
      "
    >
      {/* Kiri: menu mobile + title */}
      <div className="flex items-center gap-3">
        {/* Hamburger – hanya mobile */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="
            inline-flex md:hidden items-center justify-center
            h-9 w-9 rounded-xl
            border border-slate-200
            bg-white
            text-slate-700
            shadow-sm
            hover:border-indigo-400 hover:text-indigo-600 hover:shadow-md
            transition-all
          "
          aria-label="Buka menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Title */}
        <h1 className="
          text-xl sm:text-2xl md:text-3xl
          font-extrabold
          bg-gradient-to-r from-indigo-600 to-violet-600
          bg-clip-text text-transparent
          truncate max-w-[160px] sm:max-w-none
        ">
          {title}
        </h1>
      </div>

      {/* Kanan: search + profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Search – tampil di >= sm */}
        <div
          className="
            hidden sm:flex items-center gap-3
            px-3 sm:px-4 py-2.5
            rounded-2xl
            bg-slate-100/80
            backdrop-blur-sm
            border border-slate-200/50
            hover:border-indigo-300 hover:bg-white/90
            focus-within:border-indigo-400
            focus-within:ring-4 focus-within:ring-indigo-100
            transition-all duration-300
            shadow-sm hover:shadow-md
          "
        >
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari transaksi / buyer / produk..."
            className="
              bg-transparent text-sm outline-none
              w-32 md:w-64
              text-slate-700 placeholder:text-slate-400
            "
          />
        </div>

        {/* Mini profile */}
        <div
          className="
            flex items-center gap-2 px-3 sm:px-3.5 py-2
            rounded-2xl
            bg-gradient-to-r from-indigo-50 to-violet-50
            border border-indigo-100
            hover:border-indigo-300 hover:shadow-lg hover:-translate-y-0.5
            transition-all duration-300
            cursor-default
          "
        >
          <img
            src="/bluepacklogo.jpg"
            alt="Logo BluePack"
            className="h-7 w-7 rounded-xl object-contain"
          />
          <div className="hidden sm:block">
            <p className="text-xs sm:text-sm font-bold text-slate-800">
              Admin
            </p>
            <p className="text-[10px] sm:text-xs text-slate-500">
              BluePack
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
