// src/components/dashboard/StatCardd.jsx
export default function StatCard({ label, value, subtitle, trend, variant = "default" }) {
  const variantStyles = {
    default: "bg-white border-slate-200",
    primary: "bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200",
    success: "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200",
    warning: "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200",
  };

  const trendColors = {
    up: "text-emerald-600",
    down: "text-red-600",
    neutral: "text-slate-600",
  };

  return (
    <div
      className={`p-6 rounded-xl border ${variantStyles[variant]} shadow-card transition-all hover:shadow-card-hover`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 mb-1">{label}</p>
          <p className="text-2xl font-bold text-slate-900 tabular-nums">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-2">{subtitle}</p>
          )}
        </div>

        {trend && (
          <div className={`text-sm font-semibold ${trendColors[trend.direction] || trendColors.neutral}`}>
            {trend.value}
          </div>
        )}
      </div>
    </div>
  );
}
