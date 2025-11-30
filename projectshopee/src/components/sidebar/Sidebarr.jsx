// src/components/sidebar/Sidebar.jsx
// Sidebar gradient ala dashboard modern: brand + menu navigasi utama.

import { LayoutDashboard, Receipt, Wallet, BarChart2 } from "lucide-react";
import SidebarItem from "./SidebarItem.jsx";

const menu = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/transactions", label: "Transaksi", icon: Receipt },
  { to: "/modal", label: "Modal", icon: Wallet },
  { to: "/reports", label: "Laporan", icon: BarChart2 },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex md:flex-col w-64 bg-gradient-to-b from-indigo-600 to-violet-600 text-white p-4">
      {/* Brand/logo */}
      <div className="flex items-center gap-2 mb-8 px-2">
        <div className="h-9 w-9 rounded-2xl bg-white/20 flex items-center justify-center font-bold">
          BP
        </div>
        <div>
          <p className="text-xs opacity-80">BluePack x CempakaPack</p>
          <p className="font-semibold text-lg">Shopee Panel</p>
        </div>
      </div>

      {/* Menu utama */}
      <nav className="space-y-1 flex-1">
        {menu.map((item) => (
          <SidebarItem key={item.to} {...item} />
        ))}
      </nav>

      {/* Info kecil di bawah sidebar */}
      <div className="mt-6 p-4 rounded-2xl bg-white/10 text-[11px] leading-snug">
        <p className="font-semibold mb-1">Status Modal</p>
        <p className="opacity-80">
          Pantau hutang modal & laba periode langsung dari dashboard.
        </p>
      </div>
    </aside>
  );
}
