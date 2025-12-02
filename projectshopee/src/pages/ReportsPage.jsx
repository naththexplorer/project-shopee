// src/pages/ReportsPage.jsx
import { useMemo, useState } from "react";
import { useData } from "../context/DataContext.jsx";
import { formatRupiah, formatNumber, formatDate } from "../utils/formatters.js";
import { FileText, Download, Calendar, TrendingUp, Package, Users, DollarSign } from "lucide-react";

export default function ReportsPage() {
  const { transactions, loading } = useData();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Calculate report data
  const reportData = useMemo(() => {
    const txAll = Array.isArray(transactions) ? transactions : [];

    // Filter by date range if specified
    const filtered = txAll.filter((t) => {
      const dateStr = t.date || (t.timestamp ? new Date(t.timestamp).toISOString().slice(0, 10) : null);
      if (!dateStr) return false;

      if (startDate && dateStr < startDate) return false;
      if (endDate && dateStr > endDate) return false;

      return true;
    });

    // Aggregate data
    const totalRevenue = filtered.reduce((sum, t) => sum + (t.totalSellPrice || 0), 0);
    const totalFees = filtered.reduce((sum, t) => sum + (t.shopeeDiscount || 0), 0);
    const totalCost = filtered.reduce((sum, t) => sum + (t.totalCost || 0), 0);
    const totalProfit = filtered.reduce((sum, t) => sum + (t.profit || 0), 0);
    const totalBluePack = filtered.reduce((sum, t) => sum + (t.bluePack || 0), 0);
    const totalCempakaPack = filtered.reduce((sum, t) => sum + (t.cempakaPack || 0), 0);

    const totalItems = filtered.reduce((sum, t) => sum + (t.quantity || 0), 0);
    const uniqueBuyers = new Set(filtered.map(t => t.buyerUsername)).size;
    const totalTransactions = filtered.length;

    // Product breakdown
    const byProduct = new Map();
    filtered.forEach((t) => {
      const key = t.productCode || "UNKNOWN";
      const existing = byProduct.get(key) || {
        code: t.productCode || "-",
        name: t.productName || "Produk Tidak Dikenal",
        quantity: 0,
        revenue: 0,
        cost: 0,
        profit: 0,
      };
      existing.quantity += t.quantity || 0;
      existing.revenue += t.totalSellPrice || 0;
      existing.cost += t.totalCost || 0;
      existing.profit += t.profit || 0;
      byProduct.set(key, existing);
    });

    const productBreakdown = Array.from(byProduct.values()).sort((a, b) => b.revenue - a.revenue);

    // Daily breakdown
    const byDate = new Map();
    filtered.forEach((t) => {
      const dateStr = t.date || new Date(t.timestamp).toISOString().slice(0, 10);
      const existing = byDate.get(dateStr) || {
        date: dateStr,
        revenue: 0,
        cost: 0,
        profit: 0,
        transactions: 0,
      };
      existing.revenue += t.totalSellPrice || 0;
      existing.cost += t.totalCost || 0;
      existing.profit += t.profit || 0;
      existing.transactions += 1;
      byDate.set(dateStr, existing);
    });

    const dailyBreakdown = Array.from(byDate.values()).sort((a, b) => b.date.localeCompare(a.date));

    return {
      summary: {
        totalRevenue,
        totalFees,
        totalCost,
        totalProfit,
        totalBluePack,
        totalCempakaPack,
        totalItems,
        uniqueBuyers,
        totalTransactions,
      },
      productBreakdown,
      dailyBreakdown,
      filtered,
    };
  }, [transactions, startDate, endDate]);

  const handleExport = () => {
    // Simple CSV export
    const headers = ["Tanggal", "Username", "Produk", "Qty", "Pendapatan", "Modal", "Laba"];
    const rows = reportData.filtered.map((t) => [
      t.date || "-",
      t.buyerUsername || "-",
      t.productName || "-",
      t.quantity || 0,
      t.totalSellPrice || 0,
      t.totalCost || 0,
      t.profit || 0,
    ]);

    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan-shopee-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-4 md:p-6 lg:p-8 animate-fadeIn">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 px-1">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Laporan & Analisis</h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Breakdown detail performa penjualan dan pembagian laba
            </p>
          </div>
          <button
            onClick={handleExport}
            disabled={reportData.filtered.length === 0}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Date Range Filter - Mobile: 1 col, Desktop: 2 cols */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
            <h2 className="text-sm sm:text-base font-semibold text-slate-900">Filter Rentang Tanggal</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">Tanggal Mulai</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">Tanggal Akhir</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          {(startDate || endDate) && (
            <button
              onClick={() => {
                setStartDate("");
                setEndDate("");
              }}
              className="mt-3 text-xs sm:text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Hapus filter
            </button>
          )}
        </div>

        {/* Summary Stats - Mobile: 2 cols, Desktop: 4 cols */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="p-1.5 sm:p-2 bg-indigo-100 rounded-lg">
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
              </div>
              <p className="text-xs font-medium text-slate-600">Total Pendapatan</p>
            </div>
            <p className="text-lg sm:text-2xl font-bold text-slate-900 tabular-nums">
              {formatRupiah(reportData.summary.totalRevenue)}
            </p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="p-1.5 sm:p-2 bg-emerald-100 rounded-lg">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
              </div>
              <p className="text-xs font-medium text-slate-600">Total Laba</p>
            </div>
            <p className="text-lg sm:text-2xl font-bold text-emerald-600 tabular-nums">
              {formatRupiah(reportData.summary.totalProfit)}
            </p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg">
                <Package className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              </div>
              <p className="text-xs font-medium text-slate-600">Item Terjual</p>
            </div>
            <p className="text-lg sm:text-2xl font-bold text-slate-900 tabular-nums">
              {formatNumber(reportData.summary.totalItems)}
            </p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <p className="text-xs font-medium text-slate-600">Pembeli Unik</p>
            </div>
            <p className="text-lg sm:text-2xl font-bold text-slate-900 tabular-nums">
              {reportData.summary.uniqueBuyers}
            </p>
          </div>
        </div>

        {/* Profit Split - Mobile: 1 col, Desktop: 2 cols */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4 sm:p-6 shadow-sm">
          <h3 className="text-sm sm:text-base font-semibold text-slate-900 mb-3 sm:mb-4">Pembagian Laba</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-white rounded-lg p-3 sm:p-4 border border-blue-200">
              <p className="text-xs sm:text-sm font-medium text-blue-700 mb-1">BluePack (40%)</p>
              <p className="text-xl sm:text-2xl font-bold text-blue-900 tabular-nums">
                {formatRupiah(reportData.summary.totalBluePack)}
              </p>
            </div>
            <div className="bg-white rounded-lg p-3 sm:p-4 border border-purple-200">
              <p className="text-xs sm:text-sm font-medium text-purple-700 mb-1">CempakaPack (60%)</p>
              <p className="text-xl sm:text-2xl font-bold text-purple-900 tabular-nums">
                {formatRupiah(reportData.summary.totalCempakaPack)}
              </p>
            </div>
          </div>
        </div>

        {/* Product Breakdown */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900">Breakdown Per Produk</h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">Performa berdasarkan produk</p>
          </div>

          <div className="p-4 sm:p-6">
            {reportData.productBreakdown.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">Tidak ada data produk di periode terpilih</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-slate-600 uppercase">Produk</th>
                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-right text-xs font-semibold text-slate-600 uppercase whitespace-nowrap">Qty Terjual</th>
                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-right text-xs font-semibold text-slate-600 uppercase whitespace-nowrap">Pendapatan</th>
                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-right text-xs font-semibold text-slate-600 uppercase">Modal</th>
                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-right text-xs font-semibold text-slate-600 uppercase">Laba</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {reportData.productBreakdown.map((p) => (
                        <tr key={p.code} className="hover:bg-slate-50 transition-colors">
                          <td className="px-3 sm:px-4 py-2 sm:py-3">
                            <p className="text-xs sm:text-sm font-medium text-slate-900">{p.name}</p>
                            <p className="text-xs text-slate-500">{p.code}</p>
                          </td>
                          <td className="px-3 sm:px-4 py-2 sm:py-3 text-right tabular-nums text-xs sm:text-sm font-semibold text-slate-900 whitespace-nowrap">
                            {formatNumber(p.quantity)}
                          </td>
                          <td className="px-3 sm:px-4 py-2 sm:py-3 text-right tabular-nums text-xs sm:text-sm font-semibold text-slate-900 whitespace-nowrap">
                            {formatRupiah(p.revenue)}
                          </td>
                          <td className="px-3 sm:px-4 py-2 sm:py-3 text-right tabular-nums text-xs sm:text-sm font-semibold text-slate-900 whitespace-nowrap">
                            {formatRupiah(p.cost)}
                          </td>
                          <td className="px-3 sm:px-4 py-2 sm:py-3 text-right tabular-nums text-xs sm:text-sm font-semibold text-emerald-600 whitespace-nowrap">
                            {formatRupiah(p.profit)}
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

        {/* Daily Breakdown */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900">Breakdown Harian</h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">Performa berdasarkan tanggal</p>
          </div>

          <div className="p-4 sm:p-6">
            {reportData.dailyBreakdown.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">Tidak ada data transaksi di periode terpilih</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-slate-600 uppercase">Tanggal</th>
                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-right text-xs font-semibold text-slate-600 uppercase">Transaksi</th>
                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-right text-xs font-semibold text-slate-600 uppercase whitespace-nowrap">Pendapatan</th>
                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-right text-xs font-semibold text-slate-600 uppercase">Modal</th>
                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-right text-xs font-semibold text-slate-600 uppercase">Laba</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {reportData.dailyBreakdown.map((d) => (
                        <tr key={d.date} className="hover:bg-slate-50 transition-colors">
                          <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-slate-900 whitespace-nowrap">
                            {formatDate(d.date)}
                          </td>
                          <td className="px-3 sm:px-4 py-2 sm:py-3 text-right tabular-nums text-xs sm:text-sm font-semibold text-slate-900">
                            {d.transactions}
                          </td>
                          <td className="px-3 sm:px-4 py-2 sm:py-3 text-right tabular-nums text-xs sm:text-sm font-semibold text-slate-900 whitespace-nowrap">
                            {formatRupiah(d.revenue)}
                          </td>
                          <td className="px-3 sm:px-4 py-2 sm:py-3 text-right tabular-nums text-xs sm:text-sm font-semibold text-slate-900 whitespace-nowrap">
                            {formatRupiah(d.cost)}
                          </td>
                          <td className="px-3 sm:px-4 py-2 sm:py-3 text-right tabular-nums text-xs sm:text-sm font-semibold text-emerald-600 whitespace-nowrap">
                            {formatRupiah(d.profit)}
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
