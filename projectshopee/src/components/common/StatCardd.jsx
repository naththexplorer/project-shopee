export default function StatCard({
  label,
  value,
  sublabel,
  trend,
  badge,
  color = "indigo",
}) {
  const colorMap = {
    indigo: {
      gradient: "from-indigo-500 to-violet-500",
      bg: "from-indigo-50 to-violet-50",
      text: "text-indigo-600",
    },
    emerald: {
      gradient: "from-emerald-500 to-teal-500",
      bg: "from-emerald-50 to-teal-50",
      text: "text-emerald-600",
    },
    amber: {
      gradient: "from-amber-400 to-orange-500",
      bg: "from-amber-50 to-orange-50",
      text: "text-amber-600",
    },
    pink: {
      gradient: "from-pink-500 to-rose-500",
      bg: "from-pink-50 to-rose-50",
      text: "text-pink-600",
    },
  };

  const colors = colorMap[color] || colorMap.indigo;

  return (
    <div className="relative bg-white rounded-3xl p-6 shadow-lg border border-slate-200/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden group">
      {/* Gradient top bar */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${colors.gradient}`} />

      {/* Content */}
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            {label}
          </p>
          {badge && (
            <span className={`text-[10px] px-3 py-1 rounded-full bg-gradient-to-r ${colors.bg} ${colors.text} font-bold`}>
              {badge}
            </span>
          )}
        </div>

        <p className={`text-3xl font-extrabold ${colors.text} mb-2 group-hover:scale-105 transition-transform duration-300`}>
          {value}
        </p>

        {sublabel && <p className="text-sm text-slate-600 mb-2">{sublabel}</p>}

        {trend && (
          <p className="text-xs font-semibold">
            <span className="text-emerald-600">↗ {trend}</span>
            <span className="text-slate-500"> dari periode sebelumnya</span>
          </p>
        )}
      </div>

      {/* Hover glow effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
    </div>
  );
}
