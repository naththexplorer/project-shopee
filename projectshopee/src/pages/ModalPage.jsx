// src/pages/ModalPage.jsx
import { useMemo, useState } from "react";
import { useData } from "../context/DataContext.jsx";
import { formatRupiah, formatDate } from "../utils/formatters.js";
import { toast } from "react-hot-toast";
import { Wallet, TrendingDown, TrendingUp, Plus, Trash2, Loader2, Filter, Calendar } from "lucide-react";

export default function ModalPage() {
  const { transactions, withdrawals, addWithdrawal, deleteWithdrawal, loading } = useData();

  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [filterMonth, setFilterMonth] = useState("");

  const cempakaData = useMemo(() => {
    const txAll = Array.isArray(transactions) ? transactions : [];
    const wd = Array.isArray(withdrawals) ? withdrawals : [];

    const filteredTx = filterMonth
      ? txAll.filter((t) => {
          const dateStr = t.date || (t.timestamp ? new Date(t.timestamp).toISOString().slice(0, 10) : null);
          if (!dateStr) return false;
          const txMonth = dateStr.slice(0, 7);
          return txMonth === filterMonth;
        })
      : txAll;

    const totalModalKeluar = txAll.reduce((sum, t) => sum + (t.totalCost || 0), 0);
    const totalWithdrawAyah = wd.reduce((sum, w) => sum + (w.amount || 0), 0);
    const saldoHutangModal = totalModalKeluar - totalWithdrawAyah;

    const totalCempakaProfit = filteredTx.reduce((sum, t) => sum + (t.cempakaPack || 0), 0);

    const byDate = new Map();
    filteredTx.forEach((t) => {
      const dateStr = t.date || new Date(t.timestamp).toISOString().slice(0, 10);
      const existing = byDate.get(dateStr) || {
        date: dateStr,
        cempakaPack: 0,
        transactions: 0,
      };
      existing.cempakaPack += t.cempakaPack || 0;
      existing.transactions += 1;
      byDate.set(dateStr, existing);
    });

    const dailyBreakdown = Array.from(byDate.values()).sort((a, b) => b.date.localeCompare(a.date));

    const months = new Set();
    txAll.forEach((t) => {
      const dateStr = t.date || (t.timestamp ? new Date(t.timestamp).toISOString().slice(0, 10) : null);
      if (dateStr) months.add(dateStr.slice(0, 7));
    });
    const availableMonths = Array.from(months).sort().reverse();

    const sortedWithdrawals = [...wd].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    return {
      totalModalKeluar,
      totalWithdrawAyah,
      saldoHutangModal,
      isLunas: saldoHutangModal <= 0,
      totalCempakaProfit,
      dailyBreakdown,
      availableMonths,
      transactionCount: filteredTx.length,
      sortedWithdrawals,
    };
  }, [transactions, withdrawals, filterMonth]);

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
      await addWithdrawal({
        amount: numAmount,
        date,
        notes: notes.trim(),
        timestamp: Date.now(),
      });
      toast.success("Pengembalian modal berhasil dicatat!");
      setAmount("");
      setNotes("");
      setDate(new Date().toISOString().slice(0, 10));
    } catch (err) {
      console.error(err);
      toast.error("Gagal mencatat pengembalian modal");
    }
  };

  const handleDelete = async (id) => {
    if (!id) return;
    const ok = window.confirm("Yakin hapus data pengembalian modal ini?");
    if (!ok) return;
    try {
      await deleteWithdrawal(id);
      toast.success("Data pengembalian modal berhasil dihapus");
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
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Riwayat Modal</h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Kelola modal usaha dan laba CempakaPack (60% dari laba bersih)
          </p>
        </div>

        {/* Status Alert */}
        <div
          className={`rounded-lg border p-3 sm:p-4 ${
            cempakaData.isLunas
              ? "bg-emerald-50 border-emerald-200"
              : "bg-amber-50 border-amber-200"
          }`}
        >
          <div className="flex items-start gap-2 sm:gap-3">
            {cempakaData.isLunas ? (
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            ) : (
              <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <p className={`text-xs sm:text-sm font-medium ${
                cempakaData.isLunas ? "text-emerald-900" : "text-amber-900"
              }`}>
                {cempakaData.isLunas ? "Modal Sudah Lunas" : "Modal Belum Lunas"}
              </p>
              <p className={`text-xs mt-1 ${
                cempakaData.isLunas ? "text-emerald-700" : "text-amber-700"
              }`}>
                {cempakaData.isLunas
                  ? "Semua modal usaha sudah dikembalikan. Laba periode boleh dibagi."
                  : "Modal usaha harus lunas dulu sebelum laba periode boleh diambil."}
              </p>
            </div>
          </div>
        </div>

        {/* Summary Cards - 4 cols → 2 cols mobile */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-red-600" />
              <p className="text-xs font-medium text-slate-600">Modal Keluar</p>
            </div>
            <p className="text-base sm:text-lg md:text-xl font-bold text-slate-900 tabular-nums break-words">
              {formatRupiah(cempakaData.totalModalKeluar)}
            </p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <p className="text-xs font-medium text-slate-600">Dikembalikan</p>
            </div>
            <p className="text-base sm:text-lg md:text-xl font-bold text-slate-900 tabular-nums break-words">
              {formatRupiah(cempakaData.totalWithdrawAyah)}
            </p>
          </div>

          <div className={`rounded-lg border shadow-sm p-3 sm:p-4 ${
            cempakaData.isLunas
              ? "bg-emerald-50 border-emerald-200"
              : "bg-amber-50 border-amber-200"
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <Wallet className={`w-4 h-4 ${
                cempakaData.isLunas ? "text-emerald-600" : "text-amber-600"
              }`} />
              <p className={`text-xs font-medium ${
                cempakaData.isLunas ? "text-emerald-700" : "text-amber-700"
              }`}>
                Sisa Modal
              </p>
            </div>
            <p className={`text-base sm:text-lg md:text-xl font-bold tabular-nums break-words ${
              cempakaData.isLunas ? "text-emerald-900" : "text-amber-900"
            }`}>
              {formatRupiah(Math.max(0, cempakaData.saldoHutangModal))}
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 shadow-sm p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <p className="text-xs font-medium text-purple-700">Laba Bersih</p>
            </div>
            <p className="text-base sm:text-lg md:text-xl font-bold text-purple-900 tabular-nums break-words">
              {formatRupiah(cempakaData.totalCempakaProfit)}
            </p>
            <p className="text-xs text-purple-600 mt-1">60% dari laba</p>
          </div>
        </div>

        {/* Form Input - 3 cols → 1 col mobile */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900">
              Catat Penarikan Saldo Penjual
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
                <span className="hidden sm:inline">Catat Pengembalian</span>
                <span className="sm:hidden">Catat</span>
              </button>
            </div>
          </form>
        </div>

        {/* Withdrawal History Table */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900">
              Riwayat Penarikan
            </h2>
          </div>

          <div className="p-4 sm:p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
              </div>
            ) : cempakaData.sortedWithdrawals.length === 0 ? (
              <div className="text-center py-8">
                <Wallet className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">Belum ada data penarikan saldo</p>
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
                      {cempakaData.sortedWithdrawals.map((w) => (
                        <tr key={w.id} className="hover:bg-slate-50 transition-colors">
                          <td className="sticky left-0 z-10 bg-white hover:bg-slate-50 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-slate-600 whitespace-nowrap">
                            {w.date ? formatDate(w.date) : "-"}
                          </td>
                          <td className="px-3 sm:px-4 py-2 sm:py-3 text-right tabular-nums text-xs sm:text-sm font-semibold text-emerald-600 whitespace-nowrap">
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

        {/* Filter Month */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <label className="text-xs sm:text-sm font-medium text-slate-700 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <span>Filter Bulan:</span>
            </label>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="flex-1 sm:flex-none sm:w-48 px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Semua Periode</option>
              {cempakaData.availableMonths.map((m) => (
                <option key={m} value={m}>
                  {new Date(m + "-01").toLocaleDateString("id-ID", { year: "numeric", month: "long" })}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Daily Breakdown CempakaPack */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900">
              Laba CempakaPack per Hari
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              {filterMonth
                ? `Periode: ${new Date(filterMonth + "-01").toLocaleDateString("id-ID", { year: "numeric", month: "long" })}`
                : "Semua periode"}
            </p>
          </div>

          <div className="p-4 sm:p-6">
            {cempakaData.dailyBreakdown.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">Tidak ada data CempakaPack di periode terpilih</p>
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
                        <th className="sticky right-0 z-10 bg-slate-50 px-3 sm:px-4 py-2 sm:py-3 text-right text-xs font-semibold text-slate-600 uppercase whitespace-nowrap">
                          Laba Cempaka
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {cempakaData.dailyBreakdown.map((d, index) => (
                        <tr key={index} className="hover:bg-slate-50 transition-colors">
                          <td className="sticky left-0 z-10 bg-white hover:bg-slate-50 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-slate-600 whitespace-nowrap">
                            {formatDate(d.date)}
                          </td>
                          <td className="px-3 sm:px-4 py-2 sm:py-3 text-right tabular-nums text-xs sm:text-sm font-semibold text-slate-900">
                            {d.transactions} item
                          </td>
                          <td className="sticky right-0 z-10 bg-white hover:bg-slate-50 px-3 sm:px-4 py-2 sm:py-3 text-right tabular-nums text-xs sm:text-sm font-semibold text-purple-600 whitespace-nowrap">
                            {formatRupiah(d.cempakaPack)}
                          </td>
                        </tr>
                      ))}
                      {/* Total Row */}
                      <tr className="bg-slate-50 font-bold">
                        <td className="sticky left-0 z-10 bg-slate-50 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-slate-900">
                          Total
                        </td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 text-right tabular-nums text-xs sm:text-sm text-slate-900">
                          {cempakaData.transactionCount} item
                        </td>
                        <td className="sticky right-0 z-10 bg-slate-50 px-3 sm:px-4 py-2 sm:py-3 text-right tabular-nums text-xs sm:text-sm text-purple-600 whitespace-nowrap">
                          {formatRupiah(cempakaData.totalCempakaProfit)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Footer */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-purple-700">
            💡 <strong>Info:</strong> CempakaPack menerima 60% dari laba bersih setiap transaksi.
            Modal usaha harus dikembalikan dulu sebelum laba periode boleh diambil.
          </p>
        </div>
      </div>
    </div>
  );
}
