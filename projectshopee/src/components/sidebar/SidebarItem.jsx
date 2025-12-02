// src/components/layout/SidebarItem.jsx
import { NavLink } from "react-router-dom";

export default function SidebarItem({ to, icon: Icon, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick} // Close sidebar on mobile after click
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
          isActive
            ? "bg-indigo-600 text-white font-medium shadow-lg"
            : "text-slate-300 hover:bg-slate-700 hover:text-white"
        }`
      }
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span className="text-sm">{label}</span>
    </NavLink>
  );
}
