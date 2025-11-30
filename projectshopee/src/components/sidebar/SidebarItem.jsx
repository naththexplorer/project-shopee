// src/components/sidebar/SidebarItem.jsx
import { NavLink } from "react-router-dom";

export default function SidebarItem({
  to,
  label,
  icon: Icon,
  isActive,
  onClick,
}) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive: activeFromRouter }) => {
        const active = activeFromRouter || isActive;
        return `
          flex items-center gap-3
          px-4 py-3.5 rounded-xl
          text-sm font-medium
          transition-all duration-200
          relative
          ${
            active
              ? "bg-white/20 text-white shadow-lg border border-white/25"
              : "text-white/80 hover:bg-white/10 hover:text-white"
          }
        `;
      }}
    >
      {Icon && <Icon className="h-4 w-4" />}
      <span className="font-semibold tracking-tight">{label}</span>
    </NavLink>
  );
}
