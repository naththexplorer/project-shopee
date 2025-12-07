// src/pages/ModalPage.jsx
import { useMemo, useState, useEffect } from "react";
import { useData } from "../context/DataContext.jsx";
import { formatRupiah, formatDate } from "../utils/formatters.js";
import { toast } from "react-hot-toast";
import { Wallet, TrendingDown, TrendingUp, Plus, Trash2, Loader2, Calendar } from "lucide-react";

export default function ModalPage() {
  const { transactions, withdrawals, addWithdrawal, deleteWithdrawal, loading } = useData();

  // Form state
  const [withdrawType, setWithdrawType] = useState("modal"); // "modal" atau "laba"
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");

  // Filter state
  const [filterMonth, setFilterMonth] = useState("");

  // Set default filter "Bulan Ini"
  useEffect(() => {
    const today = new Date();
    const currentMonth = today.toISOString().slice(0, 7); // YYYY-MM
    setFilterMonth(currentMonth);
  }, []);

  // Quick filter functions
  const setFilterThisMonth = () => {
    const today = new Date();
    const currentMonth = today.toISOString().slice(0, 7);
    setFilterMonth(currentMonth);
  };

  const setFilterLastMonth = () => {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthStr = lastMonth.toISOString().slice(0, 7);
    setFilterMonth(lastMonthStr);
  };

  const clearMonthFilter = () => {
    setFilterMonth("");
  };

  const cempakaData = useMemo(() => {
    const txAll = Array.isArray(transactions) ? transactions : [];
    const wd = Array.isArray(withdrawals) ? withdrawals : [];

    // Filter transaksi berdasarkan bulan jika ada
    const filteredTx = filterMonth
      ? txAll.filter((t) => {
          const dateStr = t.date || (t.timestamp ? new Date(t.timestamp).toISOString().slice(0, 10) : null);
          if (!dateStr) return false;
          const txMonth = dateStr.slice(0, 7); // YYYY-MM
          return txMonth === filterMonth;
        })
      : txAll;

    // Total modal keluar (dari SEMUA transaksi, tidak difilter)
    const totalModalKeluar = txAll.reduce((sum, t) => sum + (t.totalCost || 0), 0);

    // Total penarikan modal (dari SEMUA withdrawals dengan type "modal")
    const totalWithdrawModal = wd
      .filter((w) => w.type === "modal")
      .reduce((sum, w) => sum + (w.amount || 0), 0);

    // Total penarikan laba (dari SEMUA withdrawals dengan type "laba")
    const totalWithdrawLaba = wd
      .filter((w) => w.type === "laba")
      .reduce((sum, w) => sum + (w.amount || 0), 0);

    // Saldo hutang modal
    const saldoHutangModal = totalModalKeluar - totalWithdrawModal;

    // Total laba CempakaPack dari transaksi terfilter (untuk breakdown)
    const totalCempakaProfit = filteredTx.reduce((sum, t) => sum + (t.cempakaPack || 0), 0);

    // Total laba CempakaPack dari SEMUA transaksi (untuk summary card)
    const totalCempakaProfitAll = txAll.reduce((sum, t) => sum + (t.cempakaPack || 0), 0);

    // Sisa laba yang belum ditarik
    const sisaLaba = totalCempakaProfitAll - totalWithdrawLaba;

    // Breakdown harian
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

    // Available months untuk filter
    const months = new Set();
    txAll.forEach((t) => {
      const dateStr = t.date || (t.timestamp ? new Date(t.timestamp).toISOString().slice(0, 10) : null);
      if (dateStr) {
        months.add(dateStr.slice(0, 7));
      }
    });
    const availableMonths = Array.from(months).sort().reverse();

    // Sort withdrawals
    const sortedWithdrawals = [...wd].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    return {
      totalModalKeluar,
      totalWithdrawModal,
      totalWithdrawLaba,
      saldoHutangModal,
      isLunas: saldoHutangModal <= 0,
      totalCempakaProfit,
      totalCempakaProfitAll,
      sisaLaba,
      dailyBreakdown,
      availableMonths,
      transactionCount: filteredTx.length,
      sortedWithdrawals,
    };
  }, [transactions, withdrawals, filterMonth]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!withdrawType) {
      toast.error("Pilih jenis penarikan terlebih dahulu");
      return;
    }

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
        type: withdrawType,
        amount: numAmount,
        date,
        notes: notes.trim(),
        timestamp: Date.now(),
      });
      toast.success(`Penarikan ${withdrawType === "modal" ? "modal" : "laba"} berhasil dicatat!`);
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
    const ok = window.confirm("Yakin hapus data penarikan ini?");
    if (!ok) return;
    try {
      await deleteWithdrawal(id);
      toast.success("Data penarikan berhasil dihapus");
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
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Laporan Modal</h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Kelola modal usaha dan laba CempakaPack (60% dari laba bersih)
          </p>
        </div>

        {/* Filter Bulan */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-6 space-y-4">
          {/* Quick Filter Buttons */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
              Quick Filter Bulan
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={setFilterThisMonth}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
              >
                Bulan Ini
              </button>
              <button
                onClick={setFilterLastMonth}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Bulan Lalu
              </button>
              <button
                onClick={clearMonthFilter}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Custom Month Select */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <div className="flex-1">
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                Pilih Bulan Custom
              </label>
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Semua Waktu</option>
                {cempakaData.availableMonths.map((month) => (
                  <option key={month} value={month}>
                    {new Date(month + "-01").toLocaleDateString("id-ID", { year: "numeric", month: "long" })}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filter Info */}
          {filterMonth && (
            <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
              <Calendar className="w-4 h-4" />
              <span>
                Menampilkan data bulan:{" "}
                {new Date(filterMonth + "-01").toLocaleDateString("id-ID", { year: "numeric", month: "long" })}
              </span>
            </div>
          )}
        </div>

        {/* Status Modal & Laba */}
        <div
          className={`rounded-lg border p-4 sm:p-6 shadow-sm ${
            cempakaData.isLunas ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"
          }`}
        >
          <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className={`p-2 sm:p-3 rounded-lg ${cempakaData.isLunas ? "bg-emerald-100" : "bg-amber-100"}`}>
              <Wallet
                className={`w-5 h-5 sm:w-6 sm:h-6 ${cempakaData.isLunas ? "text-emerald-600" : "text-amber-600"}`}
              />
            </div>
            <div className="flex-1">
              <h2
                className={`text-base sm:text-xl font-bold mb-1 ${
                  cempakaData.isLunas ? "text-emerald-900" : "text-amber-900"
                }`}
              >
                {cempakaData.isLunas ? "Modal Sudah Lunas" : "Saldo Hutang Modal"}
              </h2>
              <p className={`text-xs sm:text-sm ${cempakaData.isLunas ? "text-emerald-700" : "text-amber-700"}`}>
                {cempakaData.isLunas
                  ? "Semua modal usaha sudah dikembalikan. Laba periode boleh dibagi."
                  : "Modal usaha harus lunas dulu sebelum laba periode boleh diambil."}
              </p>
            </div>
          </div>

          {/* Summary Cards - HANYA 3 CARD */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            {/* Card 1: Sisa Modal */}
            <div className={`bg-white rounded-lg p-3 sm:p-4 border ${
              cempakaData.isLunas ? "border-emerald-200" : "border-amber-200"
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500" />
                <p className="text-xs font-medium text-slate-600 uppercase">Sisa Modal</p>
              </div>
              <p className={`text-lg sm:text-2xl font-bold tabular-nums ${
                cempakaData.isLunas ? "text-emerald-600" : "text-amber-600"
              }`}>
                {formatRupiah(Math.max(0, cempakaData.saldoHutangModal))}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {cempakaData.isLunas ? "Sudah Lunas ✓" : "Hutang modal"}
              </p>
            </div>

            {/* Card 2: Laba Bersih */}
            <div className="bg-white rounded-lg p-3 sm:p-4 border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600" />
                <p className="text-xs font-medium text-purple-700 uppercase">Laba Bersih</p>
              </div>
              <p className="text-lg sm:text-2xl font-bold text-purple-600 tabular-nums">
                {formatRupiah(cempakaData.totalCempakaProfitAll)}
              </p>
              <p className="text-xs text-purple-600 mt-1">60% dari laba bersih</p>
            </div>

            {/* Card 3: Sisa Laba */}
            <div className="bg-white rounded-lg p-3 sm:p-4 border border-emerald-200">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
                <p className="text-xs font-medium text-emerald-700 uppercase">Sisa Laba</p>
              </div>
              <p className="text-lg sm:text-2xl font-bold text-emerald-600 tabular-nums">
                {formatRupiah(Math.max(0, cempakaData.sisaLaba))}
              </p>
              <p className="text-xs text-emerald-600 mt-1">Laba yang belum ditarik</p>
            </div>
          </div>
        </div>

        {/* Form Penarikan Modal/Laba */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900">Catat Penarikan Saldo Penjualan</h2>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Radio Button: Tarik Modal vs Tarik Laba */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-3">
                Jenis Penarikan <span className="text-red-500">*</span>
              </label>
              <div className="space-y-3">
                <label className="flex items-start gap-3 p-3 sm:p-4 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                  <input
                    type="radio"
                    name="withdrawType"
                    value="modal"
                    checked={withdrawType === "modal"}
                    onChange={(e) => setWithdrawType(e.target.value)}
                    className="mt-0.5 w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">Tarik Modal</p>
                    <p className="text-xs text-slate-600 mt-1">Pengembalian modal usaha yang sudah keluar</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 sm:p-4 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                  <input
                    type="radio"
                    name="withdrawType"
                    value="laba"
                    checked={withdrawType === "laba"}
                    onChange={(e) => setWithdrawType(e.target.value)}
                    className="mt-0.5 w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">Tarik Laba</p>
                    <p className="text-xs text-slate-600 mt-1">Penarikan laba CempakaPack (60% dari laba bersih)</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Input Fields */}
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
                  min="1"
                  step="1"
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
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
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">Catatan (Opsional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Catatan..."
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
                <span className="hidden sm:inline">Catat Penarikan</span>
                <span className="sm:hidden">Catat</span>
              </button>
            </div>
          </form>
        </div>

        {/* Riwayat Penarikan */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900">Riwayat Penarikan</h2>
          </div>

          <div className="p-4 sm:p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                <span className="ml-3 text-sm text-slate-600">Memuat data...</span>
              </div>
            ) : cempakaData.sortedWithdrawals.length === 0 ? (
              <div className="text-center py-12">
                <Wallet className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">Belum ada data penarikan</p>
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
                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                          Jenis
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
                          <td className="sticky left-0 z-10 bg-white hover:bg-slate-50 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-slate-900 whitespace-nowrap">
                            {w.date ? formatDate(w.date) : "-"}
                          </td>
                          <td className="px-3 sm:px-4 py-2 sm:py-3">
                            <span
                              className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                                w.type === "modal"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-purple-100 text-purple-700"
                              }`}
                            >
                              {w.type === "modal" ? "Modal" : "Laba"}
                            </span>
                          </td>
                          <td className="px-3 sm:px-4 py-2 sm:py-3 text-right tabular-nums text-xs sm:text-sm font-semibold text-emerald-600 whitespace-nowrap">
                            {formatRupiah(w.amount || 0)}
                          </td>
                          <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-slate-600">
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

        {/* Breakdown Harian */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900">Breakdown Harian</h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">Laba CempakaPack per hari</p>
          </div>

          <div className="p-4 sm:p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                <span className="ml-3 text-sm text-slate-600">Memuat data...</span>
              </div>
            ) : cempakaData.dailyBreakdown.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">Tidak ada data CempakaPack di periode terpilih</p>
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
                          Laba CempakaPack
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {cempakaData.dailyBreakdown.map((d) => (
                        <tr key={d.date} className="hover:bg-slate-50 transition-colors">
                          <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-slate-900 whitespace-nowrap">
                            {formatDate(d.date)}
                          </td>
                          <td className="px-3 sm:px-4 py-2 sm:py-3 text-right tabular-nums text-xs sm:text-sm text-slate-600">
                            {d.transactions} item
                          </td>
                          <td className="px-3 sm:px-4 py-2 sm:py-3 text-right tabular-nums text-xs sm:text-sm font-semibold text-purple-600 whitespace-nowrap">
                            {formatRupiah(d.cempakaPack)}
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
                          {cempakaData.transactionCount} item
                        </td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 text-right tabular-nums text-xs sm:text-sm font-bold text-purple-600 whitespace-nowrap">
                          {formatRupiah(cempakaData.totalCempakaProfit)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 sm:p-4">
          <h3 className="text-xs sm:text-sm font-semibold text-purple-900 mb-2">Tentang CempakaPack</h3>
          <p className="text-sm text-purple-700">
            CempakaPack menerima 60% dari laba bersih setiap transaksi. Modal usaha harus dikembalikan dulu sebelum
            laba periode boleh diambil.
          </p>
        </div>
      </div>
    </div>
  );
}
