// src/pages/DashboardPage.jsx
// Komposisi dashboard utama: row summary, chart, status modal, top produk, transaksi terbaru, dll.

import { useData } from "../context/DataContext.jsx";
import TodaySummaryRow from "../components/dashboard/TodaySummaryRow.jsx";
import ModalStatusCard from "../components/dashboard/ModalStatusCard.jsx";
import TopProductsTable from "../components/dashboard/TopProductsTable.jsx";
import RevenueOverview from "../components/dashboard/RevenueOverview.jsx";
import SectionCard from "../components/common/SectionCard.jsx";
import { formatDateISO, formatRupiah } from "../utils/formatters.js";

export default function DashboardPage() {
  const { loading, transactions } = useData();

  const recent = transactions.slice(0, 5);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <p className="text-slate-500 text-sm">Memuat data dari Firestore...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Row 1: summary cards */}
      <TodaySummaryRow />

      {/* Row 2: chart + status modal + top products */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueOverview />
        </div>
        <ModalStatusCard />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <TopProductsTable />

        {/* Transaksi terbaru */}
        <SectionCard
          title="Transaksi Terbaru"
          subtitle="5 transaksi terakhir"
          right={
            <button className="text-xs text-indigo-600 hover:underline">
              Lihat semua
            </button>
          }
        >
          {recent.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">
              Belum ada transaksi. Mulai input di menu Transaksi.
            </p>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-400">
                  <th className="py-2 text-left font-medium">Tanggal</th>
                  <th className="py-2 text-left font-medium">Buyer</th>
                  <th className="py-2 text-left font-medium">Produk</th>
                  <th className="py-2 text-right font-medium">Laba</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                {recent.map((t) => (
                  <tr key={t.id} className="border-t">
                    <td className="py-2">{formatDateISO(t.date)}</td>
                    <td className="py-2">{t.buyerUsername}</td>
                    <td className="py-2">
                      {t.productName || t.productCode}
                    </td>
                    <td className="py-2 text-right text-emerald-500">
                      {formatRupiah(t.profit || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
