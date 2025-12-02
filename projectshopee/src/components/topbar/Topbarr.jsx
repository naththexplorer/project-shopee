// src/components/topbar/Topbarr.jsx
import { Menu, Bell, Search, User, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Topbarr({ onMenuClick }) {
  const { logout, isCempakapack } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    setIsLoggingOut(true);

    // Fade out animation
    document.body.style.opacity = "0";
    document.body.style.transition = "opacity 150ms ease-out";

    setTimeout(() => {
      logout();
      navigate("/login");
      document.body.style.opacity = "1";
    }, 150);
  };

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left: Hamburger + Logo */}
        <div className="flex items-center gap-3">
          {/* Hamburger - Only visible on mobile */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Menu Title */}
          <span className="font-bold text-slate-900 text-lg hidden sm:block">
            Rekap Shopee {isCempakapack && "- Cempakapack"}
          </span>
        </div>

        {/* Right: User Info */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Bell Icon - hidden on small mobile */}
          <button className="hidden sm:flex p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-indigo-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-slate-900">
                {isCempakapack ? "Cempakapack" : "Admin"}
              </p>
              <p className="text-xs text-slate-500">Pemilik Toko</p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="p-2 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group relative"
            title="Logout"
          >
            <LogOut className={`w-5 h-5 transition-transform duration-200 ${
              isLoggingOut ? "animate-spin" : "group-hover:translate-x-0.5"
            }`} />
            {isLoggingOut && (
              <span className="absolute -bottom-8 right-0 text-xs text-slate-500 whitespace-nowrap">
                Logging out...
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
