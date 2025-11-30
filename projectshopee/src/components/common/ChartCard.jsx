// src/components/common/ChartCard.jsx
// Wrapper khusus chart: sekarang placeholder, nanti bisa diisi Recharts.

import SectionCard from "./SectionCard.jsx";

export default function ChartCard({ title, subtitle, right, children }) {
  return (
    <SectionCard title={title} subtitle={subtitle} right={right}>
      <div className="h-52 flex items-center justify-center text-xs text-slate-400">
        {/* Anak "children" di sini nanti diganti dengan <Recharts /> */}
        {children || "[Chart akan ditampilkan di sini]"}
      </div>
    </SectionCard>
  );
}
