// src/components/dashboard/RevenueOverview.jsx
// Placeholder untuk chart penjualan (nanti gampang diganti Recharts).

import ChartCard from "../common/ChartCard.jsx";

export default function RevenueOverview() {
  return (
    <ChartCard
      title="Total Penjualan"
      subtitle="Online (Shopee) 7 hari terakhir"
      right={
        <select className="text-xs border rounded-full px-2 py-1 text-slate-500">
          <option>7 hari</option>
          <option>30 hari</option>
        </select>
      }
    >
      {/* TODO: ganti dengan chart Recharts yang beneran */}
      [Chart penjualan harian akan dibuat di sini]
    </ChartCard>
  );
}
