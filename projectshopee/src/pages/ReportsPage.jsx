// src/pages/ReportsPage.jsx
import { useMemo, useState } from "react";
import { useData } from "../context/DataContext.jsx";
import { formatRupiah, formatNumber, formatDate } from "../utils/formatters.js";
import { FileText, Download, Calendar, TrendingUp, Package, Users, DollarSign } from "lucide-react";

export default function ReportsPage() {
  const { transactions, loading } = useData();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const reportData = useMemo(() => {
    const txAll = Array.isArray(transactions) ? transactions : [];

    const filtered = txAll.filter((t) => {
      const dateStr = t.date || (t.timestamp ? new Date(t.timestamp).toISOString().slice(0, 10) : null);
      if (!dateStr) return false;
      if (startDate && dateStr < startDate) return false;
      if (endDate && dateStr > endDate) return false;
      return true;
    });

    const totalRevenue = filtered.reduce((sum, t) => sum + (t.totalSellPrice || 0), 0);
    const totalFees = filtered.reduce((sum, t) => sum + (t.shopeeDiscount || 0), 0);
    const totalCost = filtered.reduce((sum, t) => sum + (t.totalCost || 0), 0);
    const totalProfit = filtered.reduce((sum, t) => sum + (t.profit || 0), 0);
    const totalBluePack = filtered.reduce((sum, t) => sum + (t.bluePack || 0), 0);
    const totalCempakaPack = filtered.reduce((sum, t) => sum + (t.cempakaPack || 0), 0);
    const totalItems = filtered.reduce((sum, t) => sum + (t.quantity || 0), 0);
    const uniqueBuyers = new Set(filtered.map(t => t.buyerUsername)).size;
    const totalTransactions = filtered.length;

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
        <div className="px-1">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Laporan Penjualan</h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Breakdown detail performa penjualan dan pembagian laba
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                  Tanggal Mulai
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                  Tanggal Akhir
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleExport}
                disabled={reportData.filtered.length === 0}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 sm:py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export CSV</span>
                <span className="sm:hidden">Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <p className="text-xs font-medium text-slate-600">Pendapatan</p>
            </div>
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 tabular-nums">
              {formatRupiah(reportData.summary.totalRevenue)}
            </p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-blue-600" />
              <p className="text-xs font-medium text-slate-600">Laba</p>
            </div>
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 tabular-nums">
              {formatRupiah(reportData.summary.totalProfit)}
            </p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4 text-purple-600" />
              <p className="text-xs font-medium text-slate-600">Item Terjual</p>
            </div>
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 tabular-nums">
              {formatNumber(reportData.summary.totalItems)}
            </p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-amber-600" />
              <p className="text-xs font-medium text-slate-600">Pembeli</p>
            </div>
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 tabular-nums">
              {reportData.summary.uniqueBuyers}
            </p>
          </div>
        </div>

        {/* Profit Split Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 shadow-sm p-4 sm:p-6">
            <p className="text-xs sm:text-sm font-medium text-blue-700 mb-2">BluePack (40%)</p>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-900 tabular-nums">
              {formatRupiah(reportData.summary.totalBluePack)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 shadow-sm p-4 sm:p-6">
            <p className="text-xs sm:text-sm font-medium text-purple-700 mb-2">CempakaPack (60%)</p>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-900 tabular-nums">
              {formatRupiah(reportData.summary.totalCempakaPack)}
            </p>
          </div>
        </div>

        {/* Product Breakdown Table */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900">Performa per Produk</h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">Breakdown berdasarkan produk</p>
          </div>

          <div className="p-4 sm:p-6">
            {reportData.productBreakdown.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">Tidak ada data produk</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="sticky left-0 z-10 bg-slate-50 px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                          Produk
                        </th>
                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-right text-xs font-semibold text-slate-600 uppercase">
                          Qty
                        </th>
                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-right text-xs font-semibold text-slate-600 uppercase whitespace-nowrap">
                          Pendapatan
                        </th>
                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-right text-xs font-semibold text-slate-600 uppercase">
                          Modal
                        </th>
                        <th className="sticky right-0 z-10 bg-slate-50 px-3 sm:px-4 py-2 sm:py-3 text-right text-xs font-semibold text-slate-600 uppercase">
                          Laba
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {reportData.productBreakdown.map((p, index) => (
                        <tr key={index} className="hover:bg-slate-50 transition-colors">
                          <td className="sticky left-0 z-10 bg-white hover:bg-slate-50 px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                            <p className="text-xs sm:text-sm font-medium text-slate-900">{p.name}</p>
                            <p className="text-xs text-slate-500">{p.code}</p>
                          </td>
                          <td className="px-3 sm:px-4 py-2 sm:py-3 text-right tabular-nums text-xs sm:text-sm font-semibold text-slate-900">
                            {formatNumber(p.quantity)}
                          </td>
                          <td className="px-3 sm:px-4 py-2 sm:py-3 text-right tabular-nums text-xs sm:text-sm font-semibold text-slate-900 whitespace-nowrap">
                            {formatRupiah(p.revenue)}
                          </td>
                          <td className="px-3 sm:px-4 py-2 sm:py-3 text-right tabular-nums text-xs sm:text-sm font-semibold text-slate-900 whitespace-nowrap">
                            {formatRupiah(p.cost)}
                          </td>
                          <td className="sticky right-0 z-10 bg-white hover:bg-slate-50 px-3 sm:px-4 py-2 sm:py-3 text-right tabular-nums text-xs sm:text-sm font-semibold text-emerald-600 whitespace-nowrap">
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

        {/* Daily Breakdown Table */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900">Performa per Tanggal</h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">Breakdown harian</p>
          </div>

          <div className="p-4 sm:p-6">
            {reportData.dailyBreakdown.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">Tidak ada data transaksi</p>
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
                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-right text-xs font-semibold text-slate-600 uppercase">
                          Transaksi
                        </th>
                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-right text-xs font-semibold text-slate-600 uppercase whitespace-nowrap">
                          Pendapatan
                        </th>
                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-right text-xs font-semibold text-slate-600 uppercase">
                          Modal
                        </th>
                        <th className="sticky right-0 z-10 bg-slate-50 px-3 sm:px-4 py-2 sm:py-3 text-right text-xs font-semibold text-slate-600 uppercase">
                          Laba
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {reportData.dailyBreakdown.map((d, index) => (
                        <tr key={index} className="hover:bg-slate-50 transition-colors">
                          <td className="sticky left-0 z-10 bg-white hover:bg-slate-50 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-slate-600 whitespace-nowrap">
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
                          <td className="sticky right-0 z-10 bg-white hover:bg-slate-50 px-3 sm:px-4 py-2 sm:py-3 text-right tabular-nums text-xs sm:text-sm font-semibold text-emerald-600 whitespace-nowrap">
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
