// src/components/dashboard/SectionCard.jsx
export default function SectionCard({ title, subtitle, children, className = "" }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-card ${className}`}>
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-slate-200">
          {title && (
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          )}
          {subtitle && (
            <p className="text-sm text-slate-600 mt-1">{subtitle}</p>
          )}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}
