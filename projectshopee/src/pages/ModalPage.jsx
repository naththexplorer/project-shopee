// src/pages/ModalPage.jsx
// Halaman manajemen modal & withdraw ayah.

import { useMemo, useState } from "react";
import { useData } from "../context/DataContext.jsx";
import { formatRupiah, formatDate } from "../utils/formatters.js";

export default function ModalPage() {
  const {
    transactions,
    withdrawals,
    addWithdrawal,
    deleteWithdrawal,
    loading,
  } = useData();

  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  );
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  // ============================
  // HITUNG STATUS MODAL AYAH
  // ============================

  const modalStatus = useMemo(() => {
    // Total modal yang pernah keluar (berdasarkan field totalCost dari transaksi)
    const totalModalKeluar = transactions.reduce(
      (acc, t) => acc + (t.totalCost || 0),
      0
    );

    // Total withdraw yang sudah ditarik oleh ayah
    const totalWithdraw = withdrawals.reduce(
      (acc, w) => acc + (w.amount || 0),
      0
    );

    // Status modal saat ini (berapa yang "masih nyangkut" di modal)
    const statusModal = totalModalKeluar - totalWithdraw;

    return {
      totalModalKeluar,
      totalWithdraw,
      statusModal,
    };
  }, [transactions, withdrawals]);

  // ============================
  // INPUT WITHDRAW
  // ============================

  async function handleSubmit(e) {
    e.preventDefault();

    const nominal = Number(amount);
    if (!date || !nominal || nominal <= 0) {
      alert("Tanggal dan nominal withdraw harus diisi dengan benar.");
      return;
    }

    try {
      setSaving(true);
      await addWithdrawal({
        date,
        amount: nominal,
        notes,
      });

      setAmount("");
      setNotes("");
      setDate(new Date().toISOString().slice(0, 10));

      alert("Withdraw tersimpan.");
    } catch (err) {
      console.error(err);
      alert(err.message || "Gagal menyimpan withdraw.");
    } finally {
      setSaving(false);
    }
  }

  // ============================
  // HAPUS RIWAYAT WITHDRAW (FITUR 2)
  // ============================

  async function handleDeleteWithdraw(id) {
    const ok = window.confirm(
      "Yakin ingin menghapus riwayat withdraw ini? Aksi tidak bisa dibatalkan."
    );
    if (!ok) return;

    try {
      await deleteWithdrawal(id);
      alert("Riwayat withdraw berhasil dihapus.");
    } catch (err) {
      console.error(err);
      alert(err.message || "Gagal menghapus withdraw.");
    }
  }

  return (
    <div className="space-y-8">
      {/* Header dengan style yang sama seperti Dashboard */}
      <div className="relative">
        <div className="absolute -top-4 -left-4 w-32 h-32 bg-indigo-200/30 rounded-full blur-3xl" />
        <div className="absolute -top-4 -right-4 w-32 h-32 bg-violet-200/30 rounded-full blur-3xl" />
        <div className="relative">
          <h1 className="text-3xl font-extrabold text-slate-800 mb-2">
            Riwayat Modal & Withdraw
          </h1>
          <p className="text-sm text-slate-600 max-w-xl">
            Mengelola bagian laba Cempakapack, secara terpisah dari modal. Di sini hanya fokus ke saldo, withdraw, dan riwayat tarik Cempakapack.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* FORM INPUT WITHDRAW */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/70 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Input Withdraw Ayah
              </h2>
              <p className="text-xs text-slate-500 max-w-xs">
                Catat setiap kali ayah menarik uang dari laba / modal agar
                status keuangan selalu rapi.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Tanggal Withdraw
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-slate-300 rounded-2xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Nominal Withdraw
              </label>
              <input
                type="number"
                min={1}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="contoh: 500000"
                className="w-full border border-slate-300 rounded-2xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
              <p className="mt-1 text-[11px] text-slate-400">
                Disarankan hanya tarik dari laba yang sudah tercatat di
                laporan.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Catatan (opsional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="misal: untuk kebutuhan keluarga"
                className="w-full border border-slate-300 rounded-2xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-2xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 shadow-md shadow-indigo-500/30"
              >
                {saving ? "Menyimpan…" : "Simpan Withdraw"}
              </button>
            </div>
          </form>
        </div>

        {/* KARTU STATUS MODAL */}
        <div className="xl:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card
              title="Total Modal Keluar"
              value={formatRupiah(modalStatus.totalModalKeluar)}
              subtitle="Akumulasi seluruh modal yang sudah diputar"
            />
            <Card
              title="Total Withdraw Ayah"
              value={formatRupiah(modalStatus.totalWithdraw)}
              subtitle="Total yang sudah ditarik dari sistem"
            />
            <Card
              title="Status Modal Saat Ini"
              value={formatRupiah(modalStatus.statusModal)}
              subtitle="Modal yang masih tertahan di usaha"
              important
            />
          </div>

          {/* RIWAYAT WITHDRAW */}
          <div className="xl:col-span-2 bg-white rounded-3xl shadow-lg border border-slate-200/50 p-6 text-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base font-semibold text-slate-800">
                  Riwayat Withdraw Ayah
                </h2>
                <p className="text-xs text-slate-500">
                  Menampilkan semua withdraw yang sudah dicatat di sistem.
                </p>
              </div>
            </div>

            {loading ? (
              <p className="text-xs text-slate-500">Memuat data…</p>
            ) : withdrawals.length === 0 ? (
              <p className="text-xs text-slate-500">
                Belum ada withdraw tercatat. Input withdraw pertama di form
                sebelah kiri.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className="text-left text-[11px] uppercase text-slate-400 border-b border-slate-100">
                      <th className="py-2 pr-4">Tanggal</th>
                      <th className="py-2 pr-4 text-right">Nominal</th>
                      <th className="py-2 pr-4">Catatan</th>
                      <th className="py-2 pr-2 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawals.map((w) => (
                      <tr
                        key={w.id}
                        className="border-b border-slate-50 hover:bg-slate-50/60"
                      >
                        <td className="py-2 pr-4 whitespace-nowrap">
                          {formatDate(w.date)}
                        </td>
                        <td className="py-2 pr-4 text-right whitespace-nowrap">
                          {formatRupiah(w.amount)}
                        </td>
                        <td className="py-2 pr-4">
                          {w.notes || (
                            <span className="text-slate-400 italic">
                              (tanpa catatan)
                            </span>
                          )}
                        </td>
                        <td className="py-2 pr-2 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteWithdraw(w.id)}
                            className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:underline"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, highlight = false }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      <span
        className={`font-semibold ${
          highlight ? "text-rose-600" : "text-slate-900"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function Card({ title, value, subtitle, important = false }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/70 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          {title}
        </p>
        <p
          className={`mt-1 text-lg font-semibold ${
            important ? "text-rose-600" : "text-slate-900"
          }`}
        >
          {value}
        </p>
      </div>
      {subtitle && (
        <p className="mt-2 text-[11px] text-slate-400">{subtitle}</p>
      )}
    </div>
  );
}
