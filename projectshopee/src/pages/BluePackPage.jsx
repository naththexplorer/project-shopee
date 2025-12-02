// src/pages/BluePackPage.jsx
import { useMemo, useState } from "react";
import { useData } from "../context/DataContext.jsx";
import { formatRupiah, formatNumber, formatDate } from "../utils/formatters.js";
import { Package, TrendingUp, DollarSign, Calendar, FileText } from "lucide-react";

export default function BluePackPage() {
  const { transactions, loading } = useData();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const bluePackData = useMemo(() => {
    const txAll = Array.isArray(transactions) ? transactions : [];

    const filtered = txAll.filter((t) => {
      const dateStr = t.date || (t.timestamp ? new Date(t.timestamp).toISOString().slice(0, 10) : null);
      if (!dateStr) return false;
      if (startDate && dateStr < startDate) return false;
      if (endDate && dateStr > endDate) return false;
      return true;
    });

    const totalRevenue = filtered.reduce((sum, t) => sum + (t.totalSellPrice || 0), 0);
    const totalCost = filtered.reduce((sum, t) => sum + (t.totalCost || 0), 0);
    const totalProfit = filtered.reduce((sum, t) => sum + (t.profit || 0), 0);
    const totalBluePack = filtered.reduce((sum, t) => sum + (t.bluePack || 0), 0);
    const totalItems = filtered.reduce((sum, t) => sum + (t.quantity || 0), 0);
    const totalTransactions = filtered.length;

    const byDate = new Map();
    filtered.forEach((t) => {
      const dateStr = t.date || new Date(t.timestamp).toISOString().slice(0, 10);
      const existing = byDate.get(dateStr) || {
        date: dateStr,
        revenue: 0,
        cost: 0,
        profit: 0,
        bluePack: 0,
        transactions: 0,
      };
      existing.revenue += t.totalSellPrice || 0;
      existing.cost += t.totalCost || 0;
      existing.profit += t.profit || 0;
      existing.bluePack += t.bluePack || 0;
      existing.transactions += 1;
      byDate.set(dateStr, existing);
    });

    const dailyBreakdown = Array.from(byDate.values()).sort((a, b) => b.date.localeCompare(a.date));

    return {
      summary: {
        totalRevenue,
        totalCost,
        totalProfit,
        totalBluePack,
        totalItems,
        totalTransactions,
      },
      dailyBreakdown,
      filtered,
    };
  }, [transactions, startDate, endDate]);

  const handleExport = () => {
    const headers = ["Tanggal", "Transaksi", "Pendapatan", "Modal", "Laba Total", "BluePack (40%)"];
    const rows = bluePackData.dailyBreakdown.map((d) => [
      d.date,
      d.transactions,
      d.revenue,
      d.cost,
      d.profit,
      d.bluePack,
    ]);
    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan-bluepack-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-4 md:p-6 lg:p-8 animate-fadeIn">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Page Header */}
        <div className="px-1">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Laporan BluePack</h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Detail pembagian laba BluePack (40% dari laba bersih)
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
                disabled={bluePackData.dailyBreakdown.length === 0}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 sm:py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FileText className="w-4 h-4" />
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
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <p className="text-xs font-medium text-slate-600">Total Laba</p>
            </div>
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 tabular-nums">
              {formatRupiah(bluePackData.summary.totalProfit)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 shadow-sm p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4 text-blue-600" />
              <p className="text-xs font-medium text-blue-700">BluePack 40%</p>
            </div>
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-blue-900 tabular-nums">
              {formatRupiah(bluePackData.summary.totalBluePack)}
            </p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <p className="text-xs font-medium text-slate-600">Pendapatan</p>
            </div>
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 tabular-nums">
              {formatRupiah(bluePackData.summary.totalRevenue)}
            </p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-amber-600" />
              <p className="text-xs font-medium text-slate-600">Transaksi</p>
            </div>
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 tabular-nums">
              {bluePackData.summary.totalTransactions}
            </p>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-blue-700">
            💡 <strong>Info:</strong> BluePack menerima 40% dari laba bersih setiap transaksi.
            Data ini menampilkan akumulasi pembagian laba periode terpilih.
          </p>
        </div>

        {/* Daily Breakdown Table */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900">
              Breakdown Harian BluePack
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Detail pembagian laba per hari
            </p>
          </div>

          <div className="p-4 sm:p-6">
            {bluePackData.dailyBreakdown.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">Tidak ada data di periode terpilih</p>
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
                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-right text-xs font-semibold text-slate-600 uppercase whitespace-nowrap">
                          Laba Total
                        </th>
                        <th className="sticky right-0 z-10 bg-slate-50 px-3 sm:px-4 py-2 sm:py-3 text-right text-xs font-semibold text-slate-600 uppercase whitespace-nowrap">
                          BluePack 40%
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {bluePackData.dailyBreakdown.map((d, index) => (
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
                          <td className="px-3 sm:px-4 py-2 sm:py-3 text-right tabular-nums text-xs sm:text-sm font-semibold text-emerald-600 whitespace-nowrap">
                            {formatRupiah(d.profit)}
                          </td>
                          <td className="sticky right-0 z-10 bg-white hover:bg-slate-50 px-3 sm:px-4 py-2 sm:py-3 text-right tabular-nums text-xs sm:text-sm font-semibold text-blue-600 whitespace-nowrap">
                            {formatRupiah(d.bluePack)}
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
