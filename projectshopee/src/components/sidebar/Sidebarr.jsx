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
    <aside className="sticky top-0 h-screen hidden md:flex md:flex-col w-64 bg-gradient-to-b from-indigo-600 to-violet-600 text-white p-4 overflow-y-auto">
      {/* Brand/logo */}
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="h-10 w-10 rounded-xl overflow-hidden bg-white/20 flex items-center justify-center">
          <img
            src="/bluepacklogo.jpg"
            alt="Logo BluePack"
            className="h-full w-full object-cover"
          />
        </div>
        <div>
          <p className="text-xs font-medium opacity-90">Shopee</p>
          <p className="text-base font-bold">BluePack</p>
        </div>
      </div>

      {/* Menu utama */}
      <nav className="space-y-1 flex-1">
        {menu.map((item) => (
          <SidebarItem key={item.to} {...item} />
        ))}
      </nav>
    </aside>
  );
}
