import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/sidebar/Sidebarr.jsx";
import Topbar from "../components/topbar/Topbarr.jsx";

export default function MainLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-slate-50 to-indigo-50/30">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar currentPath={location.pathname} />
        <main className="flex-1 px-4 md:px-8 pb-10 pt-6 overflow-y-auto">
          {/* Content wrapper with subtle animation */}
          <div className="animate-fadeIn">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Add fadeIn animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
