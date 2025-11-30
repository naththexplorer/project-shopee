// src/layouts/MainLayout.jsx
import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "../components/sidebar/Sidebarr.jsx";
import Topbar from "../components/topbar/Topbarr.jsx";

export default function MainLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Tutup sidebar mobile setiap ganti halaman
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        {/* Sidebar – desktop + mobile overlay di dalam komponennya */}
        <Sidebar
          currentPath={location.pathname}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Konten utama */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Topbar, kirim handler untuk toggle sidebar mobile */}
          <Topbar
            currentPath={location.pathname}
            onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          />

          {/* Main content */}
          <main className="px-3 pt-3 pb-6 sm:px-4 sm:pt-4 sm:pb-8 md:px-8 md:pt-6 md:pb-10">
            <div className="max-w-6xl mx-auto animate-fadeIn">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
