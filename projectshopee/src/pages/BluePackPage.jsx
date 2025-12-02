// src/pages/BluePackPage.jsx
import { useMemo, useState } from "react";
import { useData } from "../context/DataContext.jsx";
import { formatRupiah, formatDate } from "../utils/formatters.js";
import { toast } from "react-hot-toast";
import { Package, TrendingUp, Plus, Loader2, Filter, Calendar, Trash2 } from "lucide-react";

export default function BluePackPage() {
  const {
    transactions,
    bluePackWithdrawals,
    addBluePackWithdrawal,
    deleteBluePackWithdrawal,
    loading,
  } = useData();

  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");

  // Filter state
  const [filterMonth, setFilterMonth] = useState("");

  // Calculate BluePack data dengan filter bulan
  const bluePackData = useMemo(() => {
    const txAll = Array.isArray(transactions) ? transactions : [];
    const wd = Array.isArray(bluePackWithdrawals) ? bluePackWithdrawals : [];

    // Filter transaksi berdasarkan bulan jika ada
    const filteredTx = filterMonth
      ? txAll.filter((t) => {
          const dateStr =
            t.date || (t.timestamp ? new Date(t.timestamp).toISOString().slice(0, 10) : null);
          if (!dateStr) return false;
          const txMonth = dateStr.slice(0, 7); // YYYY-MM
          return txMonth === filterMonth;
        })
      : txAll;

    // Hitung total laba BluePack (40%) dari transaksi terfilter
    const totalBlueProfit = filteredTx.reduce((sum, t) => sum + (t.bluePack || 0), 0);

    // Hitung total penarikan
    const totalWithdrawn = wd.reduce((sum, w) => sum + (w.amount || 0), 0);

    // Hitung saldo tersisa
    const remainingBalance = totalBlueProfit - totalWithdrawn;

    // Group by date untuk breakdown harian
    const byDate = new Map();
    filteredTx.forEach((t) => {
      const dateStr = t.date || new Date(t.timestamp).toISOString().slice(0, 10);
      const existing = byDate.get(dateStr) || {
        date: dateStr,
        bluePack: 0,
        transactions: 0,
      };
      existing.bluePack += t.bluePack || 0;
      existing.transactions += 1;
      byDate.set(dateStr, existing);
    });

    const dailyBreakdown = Array.from(byDate.values()).sort((a, b) =>
      b.date.localeCompare(a.date)
    );

    // Get available months untuk filter
    const months = new Set();
    txAll.forEach((t) => {
      const dateStr =
        t.date || (t.timestamp ? new Date(t.timestamp).toISOString().slice(0, 10) : null);
      if (dateStr) {
        months.add(dateStr.slice(0, 7));
      }
    });
    const availableMonths = Array.from(months).sort().reverse();

    // Sort riwayat penarikan terbaru di atas
    const sortedWithdrawals = [...wd].sort(
      (a, b) => (b.timestamp || 0) - (a.timestamp || 0)
    );

    return {
      totalBlueProfit,
      totalWithdrawn,
      remainingBalance,
      dailyBreakdown,
      availableMonths,
      transactionCount: filteredTx.length,
      sortedWithdrawals,
    };
  }, [transactions, bluePackWithdrawals, filterMonth]);

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
      toast.error("Gagal menghapus data penarikan");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-4 md:p-6 lg:p-8 animate-fadeIn">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Page Header */}
        <div className="px-1">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Laporan BluePack</h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Kelola penarikan laba BluePack (40% dari laba bersih)
          </p>
        </div>

        {/* Month Filter */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
            <h2 className="text-sm sm:text-base font-semibold text-slate-900">
              Filter Berdasarkan Bulan
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Semua Waktu</option>
              {bluePackData.availableMonths.map((month) => (
                <option key={month} value={month}>
                  {new Date(month + "-01").toLocaleDateString("id-ID", {
                    year: "numeric",
                    month: "long",
                  })}
                </option>
              ))}
            </select>
            {filterMonth && (
              <button
                onClick={() => setFilterMonth("")}
                className="px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-indigo-600 hover:text-indigo-700 whitespace-nowrap"
              >
                Hapus filter
              </button>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="p-2 sm:p-2.5 bg-blue-100 rounded-lg">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-slate-600">Total Laba BluePack</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">
              {formatRupiah(bluePackData.totalBlueProfit)}
            </p>
            <p className="text-xs text-blue-600 mt-1">40% dari laba bersih</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="p-2 sm:p-2.5 bg-red-100 rounded-lg">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 rotate-180" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-slate-600">Total Penarikan</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-red-600 tabular-nums">
              {formatRupiah(bluePackData.totalWithdrawn)}
            </p>
            <p className="text-xs text-slate-500 mt-1">Sudah ditarik</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="p-2 sm:p-2.5 bg-blue-100 rounded-lg">
                <Package className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-blue-700">Saldo Tersisa</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-blue-900 tabular-nums">
              {formatRupiah(bluePackData.remainingBalance)}
            </p>
            <p className="text-xs text-blue-600 mt-1">Bisa ditarik</p>
          </div>
        </div>

        {/* Add Withdrawal Form */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900">
              Catat Penarikan BluePack
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                  Jumlah <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="contoh: 100000"
                  min="1"
                  step="1"
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                  Tanggal Penarikan <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
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
                  placeholder="Tujuan penarikan..."
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                Catat Penarikan
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
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                <span className="ml-3 text-sm text-slate-600">Memuat data...</span>
              </div>
            ) : bluePackData.sortedWithdrawals.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">
                  Belum ada data penarikan BluePack
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                          Tanggal
                        </th>
                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-right text-xs font-semibold text-slate-600 uppercase whitespace-nowrap">
                          Jumlah
                        </th>
                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                          Catatan
                        </th>
                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-center text-xs font-semibold text-slate-600 uppercase">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {bluePackData.sortedWithdrawals.map((w) => (
                        <tr key={w.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-slate-900 whitespace-nowrap">
                            {w.date ? formatDate(w.date) : "-"}
                          </td>
                          <td className="px-3 sm:px-4 py-2 sm:py-3 text-right tabular-nums text-xs sm:text-sm font-semibold text-blue-600 whitespace-nowrap">
                            {formatRupiah(w.amount || 0)}
                          </td>
                          <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-slate-600">
                            {w.notes || "-"}
                          </td>
                          <td className="px-3 sm:px-4 py-2 sm:py-3 text-center">
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

        {/* Daily Breakdown */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900">
              Breakdown Harian
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Laba BluePack per hari
            </p>
          </div>

          <div className="p-4 sm:p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                <span className="ml-3 text-sm text-slate-600">Memuat data...</span>
              </div>
            ) : bluePackData.dailyBreakdown.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">
                  Tidak ada data BluePack di periode terpilih
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                          Tanggal
                        </th>
                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-right text-xs font-semibold text-slate-600 uppercase">
                          Transaksi
                        </th>
                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-right text-xs font-semibold text-slate-600 uppercase whitespace-nowrap">
                          Laba BluePack
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {bluePackData.dailyBreakdown.map((d) => (
                        <tr key={d.date} className="hover:bg-slate-50 transition-colors">
                          <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-slate-900 whitespace-nowrap">
                            {formatDate(d.date)}
                          </td>
                          <td className="px-3 sm:px-4 py-2 sm:py-3 text-right tabular-nums text-xs sm:text-sm text-slate-600">
                            {d.transactions} item
                          </td>
                          <td className="px-3 sm:px-4 py-2 sm:py-3 text-right tabular-nums text-xs sm:text-sm font-semibold text-blue-600 whitespace-nowrap">
                            {formatRupiah(d.bluePack)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-t-2 border-slate-300">
                      <tr className="bg-slate-50">
                        <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-bold text-slate-900">
                          Total
                        </td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 text-right tabular-nums text-xs sm:text-sm font-bold text-slate-900">
                          {bluePackData.transactionCount} item
                        </td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 text-right tabular-nums text-xs sm:text-sm font-bold text-blue-600 whitespace-nowrap">
                          {formatRupiah(bluePackData.totalBlueProfit)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
          <h3 className="text-xs sm:text-sm font-semibold text-blue-900 mb-2">
            Tentang BluePack
          </h3>
          <p className="text-xs sm:text-sm text-blue-700">
            BluePack menerima 40% dari laba bersih setiap transaksi. Penarikan
            bisa dilakukan kapan saja sesuai kebutuhan.
          </p>
        </div>
      </div>
    </div>
  );
}
