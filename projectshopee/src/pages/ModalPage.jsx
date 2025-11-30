// src/pages/ModalPage.jsx
// Halaman manajemen modal & withdraw ayah.

import { useMemo, useState } from "react";
import { useData } from "../context/DataContext.jsx";
import {
  formatRupiah,
  formatDate,
} from "../utils/formatters.js";

export default function ModalPage() {
  const { transactions, withdrawals, addWithdrawal, loading } = useData();

  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  );
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  // Ringkasan modal berdasarkan transaksi & withdraw
  const summary = useMemo(() => {
    let totalModalKeluar = 0;
    let totalWithdrawAyah = 0;

    for (const t of transactions || []) {
      totalModalKeluar += t.totalCost || 0;
    }
    for (const w of withdrawals || []) {
      totalWithdrawAyah += w.amount || 0;
    }

    const saldoHutangModal = totalModalKeluar - totalWithdrawAyah;
    const isLunas = saldoHutangModal <= 0;

    return {
      totalModalKeluar,
      totalWithdrawAyah,
      saldoHutangModal,
      isLunas,
    };
  }, [transactions, withdrawals]);

  const {
    totalModalKeluar,
    totalWithdrawAyah,
    saldoHutangModal,
    isLunas,
  } = summary;

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

  return (
    <div className="space-y-8">
      {/* Header dengan style yang sama seperti Dashboard */}
      <div className="relative">
        <div className="absolute -top-4 -left-4 w-32 h-32 bg-indigo-200/30 rounded-full blur-3xl" />
        <div className="absolute -top-4 -right-4 w-32 h-32 bg-violet-200/30 rounded-full blur-3xl" />
        <div className="relative">
          <h1 className="text-3xl font-extrabold text-slate-800 mb-2">
            Riwayat Saldo & Penarikan
          </h1>
          <p className="text-base text-slate-600">
            Pantau total modal keluar, riwayat penarikan, saldo, dan hutang modal.
          </p>
        </div>
      </div>

      {/* STATUS MODAL */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Kartu status utama */}
        <div className="md:col-span-1 bg-white rounded-3xl shadow-lg border border-slate-200/50 p-6 flex flex-col justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Status Modal (All Time)
            </p>
            <p
              className={`inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-semibold shadow-sm ${
                isLunas
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                  : "bg-rose-50 text-rose-700 border border-rose-100"
              }`}
            >
              {isLunas
                ? "🟢 MODAL LUNAS — boleh hitung & tarik laba periode"
                : "🔴 SALDO HUTANG MODAL — modal belum lunas"}
            </p>
          </div>

          <div className="mt-5 space-y-2 text-sm">
            <Row
              label="Total Modal Keluar"
              value={formatRupiah(totalModalKeluar)}
            />
            <Row
              label="Total Withdraw Ayah"
              value={formatRupiah(totalWithdrawAyah)}
            />
            <Row
              label="Saldo Hutang Modal"
              value={formatRupiah(
                saldoHutangModal > 0 ? saldoHutangModal : 0
              )}
              highlight={!isLunas}
            />
          </div>

          <p className="mt-5 text-[11px] text-slate-500 bg-slate-50 rounded-xl p-3 border border-slate-100">
            💡 Rule: laba periode hanya boleh dibagi jika{" "}
            <span className="font-semibold text-slate-700">saldo hutang modal = 0</span>.
          </p>
        </div>

        {/* Kartu detail angka */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SmallCard
            title="Total Modal Keluar"
            subtitle="Σ totalCost dari semua transaksi"
            value={formatRupiah(totalModalKeluar)}
          />
          <SmallCard
            title="Total Withdraw Ayah"
            subtitle="Σ nominal withdraw yang sudah dilakukan"
            value={formatRupiah(totalWithdrawAyah)}
          />
          <SmallCard
            title="Saldo Hutang Modal"
            subtitle={
              isLunas
                ? "Modal sudah kembali sepenuhnya"
                : "Modal yang masih harus dikembalikan"
            }
            value={formatRupiah(
              saldoHutangModal > 0 ? saldoHutangModal : 0
            )}
            important={!isLunas}
          />
          <SmallCard
            title="Status"
            subtitle="Kontrol disiplin modal sebelum bagi laba"
            value={isLunas ? "Siap bagi laba" : "Belum boleh bagi laba"}
          />
        </div>
      </div>

      {/* FORM INPUT WITHDRAW + RIWAYAT */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* FORM INPUT WITHDRAW */}
        <div className="xl:col-span-1 bg-white rounded-3xl shadow-lg border border-slate-200/50 p-6 text-sm">
          <h2 className="text-base font-semibold text-slate-800 mb-1">
            Input Withdraw Ayah
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Setiap withdraw dianggap pengembalian modal, bukan pengambilan laba.
            Saldo hutang modal akan berkurang.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex flex-col gap-1">
              <label className="font-medium text-slate-700 text-xs">
                Tanggal Withdraw
              </label>
              <input
                type="date"
                max={new Date().toISOString().slice(0, 10)}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-medium text-slate-700 text-xs">
                Nominal (Rp)
              </label>
              <input
                type="number"
                min={1000}
                step={1000}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="contoh: 500000"
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="text-[11px] text-slate-400">
                Minimal Rp 1.000. Secara logika sebaiknya tidak melebihi saldo Shopee/akun.
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-medium text-slate-700 text-xs">
                Catatan (opsional)
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="contoh: withdraw pengembalian modal periode November"
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                className="px-5 py-2 text-sm rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {saving ? "Menyimpan…" : "Simpan Withdraw"}
              </button>
            </div>
          </form>
        </div>

        {/* TABEL RIWAYAT WITHDRAW */}
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

function SmallCard({ title, subtitle, value, important = false }) {
  return (
    <div className="bg-white rounded-3xl shadow-lg border border-slate-200/50 p-5 flex flex-col justify-between">
      <div>
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
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
