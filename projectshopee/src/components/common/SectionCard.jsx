// src/components/common/SectionCard.jsx
// Card besar untuk chart, tabel, atau blok informasi yang lebih kompleks.

export default function SectionCard({ title, subtitle, children, right }) {
  return (
    <section className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col gap-3">
      {(title || right) && (
        <div className="flex items-center justify-between">
          <div>
            {title && <h2 className="text-sm font-semibold">{title}</h2>}
            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          {right}
        </div>
      )}
      <div className="flex-1">{children}</div>
    </section>
  );
}
