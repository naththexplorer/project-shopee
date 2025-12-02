// src/pages/DashboardPage.jsx
import { useMemo } from "react";
import { useData } from "../context/DataContext.jsx";
import TopProductsTable from "../components/dashboard/TopProductsTable.jsx";
import { formatRupiah, formatNumber, formatDate } from "../utils/formatters.js";
import { Receipt, Loader2, TrendingUp, Package, Wallet, AlertCircle, CheckCircle } from "lucide-react";

export default function DashboardPage() {
  const { transactions, withdrawals, loading } = useData();

  const {
    bluePackToday,
    bluePackYesterday,
    cempakaToday,
    cempakaYesterday,
    modalSummary,
    topProducts,
    recentTransactions,
  } = useMemo(() => {
    const txAll = Array.isArray(transactions) ? transactions : [];
    const wd = Array.isArray(withdrawals) ? withdrawals : [];

    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    let bluePackToday = 0;
    let bluePackYesterday = 0;
    let cempakaToday = 0;
    let cempakaYesterday = 0;
    let totalModalKeluar = 0;
    let totalWithdrawAyah = 0;

    const byProduct = new Map();
    const sortedTx = [...txAll].sort(
      (a, b) => (b.timestamp || 0) - (a.timestamp || 0)
    );

    for (const t of txAll) {
      const dateStr =
        t.date ||
        new Date(t.timestamp || Date.now()).toISOString().slice(0, 10);
      const baseProfit = t.profit ?? (t.bluePack || 0) + (t.cempakaPack || 0);
      const blue = t.bluePack ?? baseProfit * 0.4;
      const cemp = t.cempakaPack ?? baseProfit * 0.6;

      if (dateStr === todayStr) {
        bluePackToday += blue;
        cempakaToday += cemp;
      } else if (dateStr === yesterdayStr) {
        bluePackYesterday += blue;
        cempakaYesterday += cemp;
      }

      totalModalKeluar += t.totalCost || 0;

      const key = t.productCode || t.productName || "UNKNOWN";
      const existing = byProduct.get(key) || {
        code: t.productCode || "-",
        name: t.productName || "Produk Tidak Dikenal",
        quantity: 0,
        revenue: 0,
      };
      existing.quantity += t.quantity || 0;
      existing.revenue += t.totalSellPrice || 0;
      byProduct.set(key, existing);
    }

    for (const w of wd) {
      totalWithdrawAyah += w.amount || 0;
    }

    const saldoHutangModal = totalModalKeluar - totalWithdrawAyah;
    const modalSummary = {
      totalModalKeluar,
      totalWithdrawAyah,
      saldoHutangModal,
      isLunas: saldoHutangModal <= 0,
    };

    const topProducts = Array.from(byProduct.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    const recentTransactions = sortedTx.slice(0, 5);

    return {
      bluePackToday,
      bluePackYesterday,
      cempakaToday,
      cempakaYesterday,
      modalSummary,
      topProducts,
      recentTransactions,
    };
  }, [transactions, withdrawals]);

  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-4 md:p-6 lg:p-8 animate-fadeIn">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 md:space-y-8">
        {/* Page Header */}
        <div className="px-1">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Beranda</h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Ringkasan penjualan dan pembagian laba
          </p>
        </div>

        {/* Status Modal - Alert Box */}
        <div className={`rounded-lg border p-4 sm:p-5 ${
          modalSummary.isLunas
            ? "bg-emerald-50 border-emerald-200"
            : "bg-amber-50 border-amber-200"
        }`}>
          <div className="flex items-start gap-3">
            {modalSummary.isLunas ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <h3 className={`text-sm sm:text-base font-semibold mb-1 ${
                modalSummary.isLunas ? "text-emerald-900" : "text-amber-900"
              }`}>
                {modalSummary.isLunas ? "Modal Sudah Lunas" : "Saldo Hutang Modal"}
              </h3>
              <p className={`text-xs sm:text-sm ${
                modalSummary.isLunas ? "text-emerald-700" : "text-amber-700"
              }`}>
                {modalSummary.isLunas
                  ? "Laba periode sudah bisa diambil. Detail lengkap di menu Laporan CempakaPack."
                  : `Belum boleh bagi laba periode. Sisa hutang: ${formatRupiah(modalSummary.saldoHutangModal)}`}
              </p>
            </div>
          </div>
        </div>

        {/* Pembagian Laba Hari Ini & Kemarin */}
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4 px-1">
            Pembagian Laba
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* BluePack */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 sm:p-2.5 bg-blue-100 rounded-lg">
                    <Package className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-slate-600">BluePack (40%)</p>
                    <p className="text-lg sm:text-2xl font-bold text-slate-900 tabular-nums mt-0.5 sm:mt-1">
                      {formatRupiah(bluePackToday)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm pt-3 sm:pt-4 border-t border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-600">Hari Ini</span>
                  <span className="font-semibold text-slate-900 tabular-nums">{formatRupiah(bluePackToday)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Kemarin</span>
                  <span className="font-semibold text-slate-900 tabular-nums">{formatRupiah(bluePackYesterday)}</span>
                </div>
              </div>
            </div>

            {/* CempakaPack */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 sm:p-2.5 bg-purple-100 rounded-lg">
                    <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-slate-600">CempakaPack (60%)</p>
                    <p className="text-lg sm:text-2xl font-bold text-slate-900 tabular-nums mt-0.5 sm:mt-1">
                      {formatRupiah(cempakaToday)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm pt-3 sm:pt-4 border-t border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-600">Hari Ini</span>
                  <span className="font-semibold text-slate-900 tabular-nums">{formatRupiah(cempakaToday)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Kemarin</span>
                  <span className="font-semibold text-slate-900 tabular-nums">{formatRupiah(cempakaYesterday)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top 5 Produk Terlaris */}
        <div className="bg-white rounded-lg border border-slate-200">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900">Produk Terlaris</h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">Top 5 produk berdasarkan quantity terjual (all time)</p>
          </div>
          <div className="p-4 sm:p-6">
            <TopProductsTable products={topProducts} />
          </div>
        </div>

        {/* Transaksi Terbaru */}
        <div className="bg-white rounded-lg border border-slate-200">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900">Transaksi Terbaru</h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">5 transaksi item terakhir yang kamu input (all time)</p>
          </div>
          <div className="p-4 sm:p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                <span className="ml-3 text-sm text-slate-600">Memuat data...</span>
              </div>
            ) : recentTransactions.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">Belum ada transaksi tercatat</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="sticky left-0 z-10 bg-slate-50 px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                          Tanggal
                        </th>
                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-slate-600 uppercase whitespace-nowrap">
                          Username
                        </th>
                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-slate-600 uppercase whitespace-nowrap">
                          Produk
                        </th>
                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-right text-xs font-semibold text-slate-600 uppercase">
                          Qty
                        </th>
                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-right text-xs font-semibold text-slate-600 uppercase whitespace-nowrap">
                          Total
                        </th>
                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-right text-xs font-semibold text-slate-600 uppercase">
                          Laba
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {recentTransactions.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                          <td className="sticky left-0 z-10 bg-white hover:bg-slate-50 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-slate-600 whitespace-nowrap">
                            {t.date ? formatDate(t.date) : "-"}
                          </td>
                          <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                            <p className="text-xs sm:text-sm font-medium text-slate-900">{t.buyerUsername || "-"}</p>
                            {t.notes && (
                              <p className="text-xs text-slate-500 truncate max-w-[150px]">{t.notes}</p>
                            )}
                          </td>
                          <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                            <p className="text-xs sm:text-sm font-medium text-slate-900">{t.productName || "-"}</p>
                            <p className="text-xs text-slate-500">{t.productCode}</p>
                          </td>
                          <td className="px-3 sm:px-4 py-2 sm:py-3 text-right tabular-nums text-xs sm:text-sm font-semibold text-slate-900">
                            {formatNumber(t.actualQuantity || t.quantity || 0)}
                          </td>
                          <td className="px-3 sm:px-4 py-2 sm:py-3 text-right tabular-nums text-xs sm:text-sm font-semibold text-slate-900 whitespace-nowrap">
                            {formatRupiah(t.totalSellPrice || 0)}
                          </td>
                          <td className="px-3 sm:px-4 py-2 sm:py-3 text-right tabular-nums text-xs sm:text-sm font-semibold text-emerald-600 whitespace-nowrap">
                            {formatRupiah(t.profit || 0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
