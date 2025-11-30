// src/components/sidebar/SidebarItem.jsx
// Satu item menu sidebar dengan state aktif/nonaktif.

import { NavLink } from "react-router-dom";

export default function SidebarItem({ to, label, icon: Icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition",
          isActive
            ? "bg-white text-indigo-600 shadow-sm"
            : "text-white/80 hover:bg-white/10",
        ].join(" ")
      }
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </NavLink>
  );
}
