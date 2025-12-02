// src/components/dashboard/ChartCard.jsx
export default function ChartCard({ title, children, className = "" }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-card p-6 ${className}`}>
      {title && (
        <h3 className="text-base font-semibold text-slate-900 mb-4">{title}</h3>
      )}
      <div>{children}</div>
    </div>
  );
}
