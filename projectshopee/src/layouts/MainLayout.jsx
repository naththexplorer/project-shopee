// src/layouts/MainLayout.jsx
// Layout utama: sidebar di kiri, topbar di atas, konten halaman di tengah.

import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/sidebar/Sidebarr.jsx";
import Topbar from "../components/topbar/Topbarr.jsx";

export default function MainLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Topbar currentPath={location.pathname} />
        <main className="flex-1 px-4 md:px-6 pb-8 pt-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
