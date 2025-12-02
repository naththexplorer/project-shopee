// src/components/sidebar/SidebarItem.jsx
import { NavLink } from "react-router-dom";

export default function SidebarItem({ to, icon: Icon, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ease-in-out ${
          isActive
            ? "bg-indigo-600 text-white font-medium shadow-lg scale-[1.02]"
            : "text-slate-300 hover:bg-slate-700 hover:text-white hover:scale-[1.01]"
        }`
      }
    >
      <Icon className="w-5 h-5 flex-shrink-0 transition-transform duration-200" />
      <span className="text-sm font-medium transition-all duration-200">{label}</span>
    </NavLink>
  );
}
