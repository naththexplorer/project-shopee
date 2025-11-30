import { NavLink } from "react-router-dom";

export default function SidebarItem({ to, label, icon: Icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3.5 rounded-xl text-[15px] font-medium transition-all duration-300 relative group ${
          isActive
            ? "bg-white/25 text-white shadow-lg backdrop-blur-sm border border-white/30"
            : "text-white/80 hover:bg-white/15 hover:text-white"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {/* Active indicator bar */}
          <div
            className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full transition-all duration-300 ${
              isActive ? "opacity-100 scale-100" : "opacity-0 scale-0"
            }`}
          />

          {/* Icon with scale effect */}
          <Icon
            className={`h-5 w-5 transition-all duration-300 ${
              isActive ? "scale-110" : "group-hover:scale-110"
            }`}
          />

          {/* Label */}
          <span className="font-semibold">{label}</span>

          {/* Hover glow effect */}
          <div className="absolute inset-0 rounded-xl bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </>
      )}
    </NavLink>
  );
}
