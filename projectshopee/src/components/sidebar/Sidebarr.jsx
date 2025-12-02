// src/components/sidebar/Sidebarr.jsx
import { Home, Receipt, Wallet, FileText, Package, X } from "lucide-react";
import SidebarItem from "./SidebarItem.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

export default function Sidebarr({ isOpen, onClose }) {
  const { isBluepack, isCempakapack } = useAuth();

  // Menu lengkap untuk Bluepack
  const bluepackMenu = [
    { to: "/dashboard", icon: Home, label: "Dashboard" },
    { to: "/transactions", icon: Receipt, label: "Input Transaksi" },
    { to: "/modal", icon: Wallet, label: "Riwayat Modal" },
    { to: "/reports", icon: FileText, label: "Laporan Penjualan" },
    { to: "/bluepack", icon: Package, label: "Laporan Bluepack" },
  ];

  // Menu simple untuk Cempakapack (hanya 2)
  const cempakapackMenu = [
    { to: "/transactions", icon: Receipt, label: "Input Transaksi" },
    { to: "/modal", icon: Wallet, label: "Riwayat Modal" },
  ];

  // Pilih menu berdasarkan role
  const menuItems = isCempakapack ? cempakapackMenu : bluepackMenu;

  return (
    <>
      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-slate-800 text-white transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header with Close Button (Mobile Only) */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-slate-700">
            <div className="flex items-center">
              <span className="font-bold text-lg transition-opacity duration-200">
                Sidebar Menu
              </span>
            </div>
            {/* Close button - Only visible on mobile */}
            <button
              onClick={onClose}
              className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all duration-200"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {menuItems.map((item, index) => (
              <div
                key={index}
                className="animate-fadeIn"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <SidebarItem
                  to={item.to}
                  icon={item.icon}
                  label={item.label}
                  onClick={onClose}
                />
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-700 transition-opacity duration-200">
            <p className="text-xs text-slate-400 text-center">
              Version 1.0
            </p>
          </div>
        </div>
      </aside>

      {/* Overlay untuk mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}
    </>
  );
}
