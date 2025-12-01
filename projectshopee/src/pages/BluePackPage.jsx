// src/pages/BluePackPage.jsx
// Halaman laporan & withdraw khusus BluePack (40% laba).

import { useState } from "react";
import { useData } from "../context/DataContext.jsx";
import { formatRupiah, formatDate } from "../utils/formatters.js";

export default function BluePackPage() {
  const {
    summary,
    bluepackWithdrawals,
    addBluepackWithdrawal,
    deleteBluepackWithdrawal,
    loading,
  } = useData();

  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  );
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const totalBluepackProfit = summary.bluePack || 0;
  const totalBluepackWithdraw = summary.totalBluepackWithdraw || 0;
  const saldoBluepack =
    summary.saldoBluepack ?? totalBluepackProfit - totalBluepackWithdraw;

  async function handleSubmit(e) {
    e.preventDefault();

    const nominal = Number(amount);
    if (!date || !nominal || nominal <= 0) {
      alert("Tanggal dan nominal withdraw harus diisi dengan benar.");
      return;
    }

    try {
      setSaving(true);
      await addBluepackWithdrawal({
        date,
        amount: nominal,
        notes,
      });

      setAmount("");
      setNotes("");
      setDate(new Date().toISOString().slice(0, 10));

      alert("Withdraw BluePack tersimpan.");
    } catch (err) {
      console.error(err);
      alert(err.message || "Gagal menyimpan withdraw BluePack.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    const ok = window.confirm(
      "Yakin ingin menghapus riwayat withdraw BluePack ini? Aksi tidak bisa dibatalkan."
    );
    if (!ok) return;

    try {
      await deleteBluepackWithdrawal(id);
      alert("Riwayat withdraw BluePack berhasil dihapus.");
    } catch (err) {
      console.error(err);
      alert(err.message || "Gagal menghapus withdraw BluePack.");
    }
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="relative">
        <div className="absolute -top-4 -left-4 w-32 h-32 bg-indigo-200/30 rounded-full blur-3xl" />
        <div className="absolute -top-4 -right-4 w-32 h-32 bg-emerald-200/30 rounded-full blur-3xl" />
        <div className="relative">
          <h1 className="text-3xl font-extrabold text-slate-800 mb-2">
            Riwayat Modal & Withdraw
          </h1>
          <p className="text-sm text-slate-600 max-w-xl">
            Mengelola bagian laba Bluepack, secara terpisah dari modal.
            Di sini hanya fokus ke saldo, withdraw, dan riwayat tarik Bluepack.
          </p>
        </div>
      </div>

      {/* RINGKASAN SALDO BLUEPACK */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          title="Total Laba BluePack (All Time)"
          subtitle="Σ 40% laba dari seluruh transaksi"
          value={formatRupiah(totalBluepackProfit)}
        />
        <SummaryCard
          title="Total Withdraw BluePack"
          subtitle="Σ semua penarikan BluePack yang sudah dilakukan"
          value={formatRupiah(totalBluepackWithdraw)}
        />
        <SummaryCard
          title="Saldo BluePack Saat Ini"
          subtitle="Laba BluePack - total withdraw BluePack"
          value={formatRupiah(saldoBluepack)}
          important
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* FORM INPUT WITHDRAW BLUEPACK */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/70 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Input Withdraw BluePack
              </h2>
              <p className="text-xs text-slate-500 max-w-xs">
                Catat setiap penarikan bagian laba BluePack untuk kebutuhan
                pribadi atau tabungan terpisah.
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
                placeholder="contoh: 250000"
                className="w-full border border-slate-300 rounded-2xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
              <p className="mt-1 text-[11px] text-slate-400">
                Idealnya tidak melebihi saldo BluePack yang tersedia.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Catatan (opsional)
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="misal: simpanan pribadi, kebutuhan, dll."
                className="w-full border border-slate-300 rounded-2xl px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setAmount("");
                  setNotes("");
                  setDate(new Date().toISOString().slice(0, 10));
                }}
                className="px-4 py-2 text-sm rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 transition"
              >
                Reset
              </button>
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

        {/* RIWAYAT WITHDRAW BLUEPACK */}
        <div className="xl:col-span-2 bg-white rounded-3xl shadow-lg border border-slate-200/50 p-6 text-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-semibold text-slate-800">
                Riwayat Withdraw BluePack
              </h2>
              <p className="text-xs text-slate-500">
                Semua penarikan BluePack yang pernah dicatat akan muncul di sini.
              </p>
            </div>
          </div>

          {loading ? (
            <p className="text-xs text-slate-500">Memuat data…</p>
          ) : bluepackWithdrawals.length === 0 ? (
            <p className="text-xs text-slate-500">
              Belum ada withdraw BluePack tercatat. Input withdraw pertama di
              form sebelah kiri.
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
                  {bluepackWithdrawals.map((w) => (
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
                          onClick={() => handleDelete(w.id)}
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
  );
}

function SummaryCard({ title, value, subtitle, important = false }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/70 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          {title}
        </p>
        <p
          className={`mt-1 text-lg font-semibold ${
            important ? "text-emerald-600" : "text-slate-900"
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
