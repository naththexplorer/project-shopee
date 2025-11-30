// src/components/common/StatCard.jsx
// Card kecil untuk angka penting (penjualan hari ini, total transaksi, dll).

export default function StatCard({
  label,
  value,
  sublabel,
  trend,
  badge,
  color = "indigo",
}) {
  const colorMap = {
    indigo: "from-indigo-500 to-violet-500",
    emerald: "from-emerald-500 to-teal-500",
    amber: "from-amber-400 to-orange-500",
    pink: "from-pink-500 to-rose-500",
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
          {label}
        </p>
        {badge && (
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {badge}
          </span>
        )}
      </div>
      <p className="text-2xl font-semibold">{value}</p>
      {sublabel && <p className="text-xs text-slate-500">{sublabel}</p>}
      {trend && (
        <p className="text-xs font-medium">
          <span className="text-emerald-500">{trend}</span> dari periode
          sebelumnya
        </p>
      )}
      <div
        className={`mt-2 h-1.5 w-full rounded-full bg-gradient-to-r ${
          colorMap[color] || colorMap.indigo
        }`}
      />
    </div>
  );
}
