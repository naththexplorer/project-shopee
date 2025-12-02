// src/components/layout/Sidebarr.jsx
import { Home, Receipt, Wallet, FileText, Package, X } from "lucide-react";
import SidebarItem from "./SidebarItem.jsx";

export default function Sidebarr({ isOpen, onClose }) {
  return (
    <>
      {/* Sidebar Container */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen w-64 bg-slate-800 text-white
          transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header with Close Button (Mobile Only) */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-slate-700">
            <div className="flex items-center">
              <span className="font-bold text-lg">Sidebar Menu</span>
            </div>

            {/* Close button - Only visible on mobile */}
            <button
              onClick={onClose}
              className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            <SidebarItem
              to="/"
              icon={Home}
              label="Beranda"
              onClick={onClose}
            />
            <SidebarItem
              to="/transactions"
              icon={Receipt}
              label="Input Transaksi"
              onClick={onClose}
            />
            <SidebarItem
              to="/reports"
              icon={FileText}
              label="Laporan Penjualan"
              onClick={onClose}
            />
            <SidebarItem
              to="/cempaka"
              icon={Wallet}
              label="Laporan Cempakapack"
              onClick={onClose}
            />
            <SidebarItem
              to="/bluepack"
              icon={Package}
              label="Laporan Bluepack"
              onClick={onClose}
            />
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-700">
            <p className="text-xs text-slate-400 text-center">
              © Version 1.0
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
