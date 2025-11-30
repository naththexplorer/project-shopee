// src/components/sidebar/Sidebarr.jsx
import {
  Package,
  Activity,
  Wallet,
  BarChart3,
  X,
} from "lucide-react";
import SidebarItem from "./SidebarItem.jsx";

const SIDEBAR_ITEMS = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: Activity,
  },
  {
    to: "/transactions",
    label: "Transaksi",
    icon: Package,
  },
  {
    to: "/modal",
    label: "Manajemen Uang",
    icon: Wallet,
  },
  {
    to: "/reports",
    label: "Riwayat Laporan",
    icon: BarChart3,
  },
];

export default function Sidebarr({ currentPath, isOpen, onClose }) {
  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside
        className="
          hidden md:flex md:flex-col
          w-64 xl:w-72
          bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900
          text-white
          border-r border-indigo-800/40
          min-h-screen
          sticky top-0
        "
      >
        {/* Logo & brand */}
        <div className="px-5 pt-5 pb-4 border-b border-white/10 flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center shadow-lg">
            <span className="text-xl font-black tracking-tight">BP</span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold">BluePack x CempakaPack</span>
            <span className="text-[11px] text-white/60">
              Shopee Sales Console
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto hide-scrollbar">
          {SIDEBAR_ITEMS.map((item) => (
            <SidebarItem
              key={item.to}
              to={item.to}
              label={item.label}
              icon={item.icon}
              isActive={currentPath === item.to}
            />
          ))}
        </nav>

        {/* Footer kecil */}
        <div className="px-4 py-4 border-t border-white/10 text-[11px] text-white/50">
          v1.0 • React + Vite + Firebase
        </div>
      </aside>

      {/* MOBILE SIDEBAR OVERLAY */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* backdrop */}
        <div
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* drawer panel */}
        <aside
          className="
            relative h-full w-72 max-w-[80vw]
            bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900
            text-white shadow-2xl border-r border-indigo-800/40
            flex flex-col
          "
        >
          {/* Header mobile */}
          <div className="px-4 py-4 border-b border-white/10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-2xl bg-white/10 flex items-center justify-center shadow-lg">
                <span className="text-lg font-black tracking-tight">BP</span>
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-semibold">
                  BluePack x CempakaPack
                </span>
                <span className="text-[11px] text-white/60">Admin Panel</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Tutup menu"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Nav mobile */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto hide-scrollbar">
            {SIDEBAR_ITEMS.map((item) => (
              <SidebarItem
                key={item.to}
                to={item.to}
                label={item.label}
                icon={item.icon}
                isActive={currentPath === item.to}
                onClick={onClose}
              />
            ))}
          </nav>
        </aside>
      </div>
    </>
  );
}
