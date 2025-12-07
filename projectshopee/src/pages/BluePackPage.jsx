// src/pages/BluePackPage.jsx
import { useMemo, useState, useEffect } from "react";
import { useData } from "../context/DataContext.jsx";
import { formatRupiah, formatNumber, formatDate } from "../utils/formatters.js";
import { Package, TrendingUp, DollarSign, Calendar, FileText, Wallet, Plus, Trash2, Loader2, TrendingDown } from "lucide-react";
import { toast } from "react-hot-toast";

export default function BluePackPage() {
  const { transactions, bluePackWithdrawals, addBluePackWithdrawal, deleteBluePackWithdrawal, loading } = useData();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Form withdraw state
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");

  // Set default filter "Bulan Ini" saat pertama load
  useEffect(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    setStartDate(firstDay.toISOString().slice(0, 10));
    setEndDate(lastDay.toISOString().slice(0, 10));
  }, []);

  // Quick filter functions
  const setFilterToday = () => {
    const today = new Date().toISOString().slice(0, 10);
    setStartDate(today);
    setEndDate(today);
  };

  const setFilterThisWeek = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const firstDay = new Date(today);
    firstDay.setDate(today.getDate() - dayOfWeek);
    const lastDay = new Date(today);
    lastDay.setDate(today.getDate() + (6 - dayOfWeek));

    setStartDate(firstDay.toISOString().slice(0, 10));
    setEndDate(lastDay.toISOString().slice(0, 10));
  };

  const setFilterThisMonth = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    setStartDate(firstDay.toISOString().slice(0, 10));
    setEndDate(lastDay.toISOString().slice(0, 10));
  };

  const clearFilter = () => {
    setStartDate("");
    setEndDate("");
  };

  const bluePackData = useMemo(() => {
    const txAll = Array.isArray(transactions) ? transactions : [];
    const wd = Array.isArray(bluePackWithdrawals) ? bluePackWithdrawals : [];

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

    // Total BluePack dari SEMUA transaksi (tidak difilter)
    const totalBluePackAll = txAll.reduce((sum, t) => sum + (t.bluePack || 0), 0);
    const totalWithdrawn = wd.reduce((sum, w) => sum + (w.amount || 0), 0);
    const remainingBluePack = totalBluePackAll - totalWithdrawn;

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

    const sortedWithdrawals = [...wd].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    return {
      summary: {
        totalRevenue,
        totalCost,
        totalProfit,
        totalBluePack,
        totalItems,
        totalTransactions,
        totalBluePackAll,
        totalWithdrawn,
        remainingBluePack,
      },
      dailyBreakdown,
      sortedWithdrawals,
      filtered,
    };
  }, [transactions, bluePackWithdrawals, startDate, endDate]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      toast.error("Jumlah harus lebih dari nol");
      return;
    }
    if (!date) {
      toast.error("Tanggal harus diisi");
      return;
    }

    try {
      await addBluePackWithdrawal({
        amount: numAmount,
        date,
        notes: notes.trim(),
        timestamp: Date.now(),
      });
      toast.success("Penarikan BluePack berhasil dicatat!");
      setAmount("");
      setNotes("");
      setDate(new Date().toISOString().slice(0, 10));
    } catch (err) {
      console.error(err);
      toast.error("Gagal mencatat penarikan");
    }
  };

  const handleDelete = async (id) => {
    if (!id) return;
    const ok = window.confirm("Yakin hapus data penarikan BluePack ini?");
    if (!ok) return;
    try {
      await deleteBluePackWithdrawal(id);
      toast.success("Data penarikan BluePack berhasil dihapus");
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghapus data");
    }
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
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-6 space-y-4">
          {/* Quick Filters */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
              Quick Filter
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={setFilterToday}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Hari Ini
              </button>
              <button
                onClick={setFilterThisWeek}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Minggu Ini
              </button>
              <button
                onClick={setFilterThisMonth}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
              >
                Bulan Ini
              </button>
              <button
                onClick={clearFilter}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Custom Date Range */}
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

          {/* Active Filter Info */}
          {(startDate || endDate) && (
            <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
              <Calendar className="w-4 h-4" />
              <span>
                Menampilkan data: {startDate ? formatDate(startDate) : "Awal"} - {endDate ? formatDate(endDate) : "Akhir"}
              </span>
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <p className="text-xs font-medium text-slate-600">Laba Bersih</p>
            </div>
            <p className="text-base sm:text-lg md:text-xl font-bold text-slate-900 tabular-nums break-words">
              {formatRupiah(bluePackData.summary.totalProfit)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 shadow-sm p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4 text-blue-600" />
              <p className="text-xs font-medium text-blue-700">BluePack 40%</p>
            </div>
            <p className="text-base sm:text-lg md:text-xl font-bold text-blue-900 tabular-nums break-words">
              {formatRupiah(bluePackData.summary.totalBluePackAll)}
            </p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-red-600" />
              <p className="text-xs font-medium text-slate-600">Total Ditarik</p>
            </div>
            <p className="text-base sm:text-lg md:text-xl font-bold text-slate-900 tabular-nums break-words">
              {formatRupiah(bluePackData.summary.totalWithdrawn)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200 shadow-sm p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4 text-emerald-600" />
              <p className="text-xs font-medium text-emerald-700">Sisa BluePack</p>
            </div>
            <p className="text-base sm:text-lg md:text-xl font-bold text-emerald-900 tabular-nums break-words">
              {formatRupiah(Math.max(0, bluePackData.summary.remainingBluePack))}
            </p>
          </div>
        </div>

        {/* Form Input Withdraw BluePack */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900">
              Catat Penarikan BluePack
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                  Jumlah (Rp) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  required
                  min="1"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                  Tanggal <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                  Catatan (Opsional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Catatan..."
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Catat Penarikan</span>
                <span className="sm:hidden">Catat</span>
              </button>
            </div>
          </form>
        </div>

        {/* Riwayat Penarikan BluePack */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900">
              Riwayat Penarikan BluePack
            </h2>
          </div>

          <div className="p-4 sm:p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
              </div>
            ) : bluePackData.sortedWithdrawals.length === 0 ? (
              <div className="text-center py-8">
                <Wallet className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">Belum ada data penarikan BluePack</p>
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
                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-right text-xs font-semibold text-slate-600 uppercase whitespace-nowrap">
                          Jumlah
                        </th>
                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                          Catatan
                        </th>
                        <th className="sticky right-0 z-10 bg-slate-50 px-3 sm:px-4 py-2 sm:py-3 text-center text-xs font-semibold text-slate-600 uppercase">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {bluePackData.sortedWithdrawals.map((w) => (
                        <tr key={w.id} className="hover:bg-slate-50 transition-colors">
                          <td className="sticky left-0 z-10 bg-white hover:bg-slate-50 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-slate-600 whitespace-nowrap">
                            {w.date ? formatDate(w.date) : "-"}
                          </td>
                          <td className="px-3 sm:px-4 py-2 sm:py-3 text-right tabular-nums text-xs sm:text-sm font-semibold text-blue-600 whitespace-nowrap">
                            {formatRupiah(w.amount || 0)}
                          </td>
                          <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-slate-700">
                            {w.notes || "-"}
                          </td>
                          <td className="sticky right-0 z-10 bg-white hover:bg-slate-50 px-3 sm:px-4 py-2 sm:py-3 text-center">
                            <button
                              onClick={() => handleDelete(w.id)}
                              className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
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

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
          <p className="text-sm text-blue-700">
            💡 <strong>Info:</strong> BluePack menerima 40% dari laba bersih setiap transaksi.
            Data ini menampilkan akumulasi pembagian laba dan riwayat penarikan.
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
