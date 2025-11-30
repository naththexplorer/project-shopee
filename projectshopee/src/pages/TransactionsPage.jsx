// src/pages/TransactionsPage.jsx
// Versi full: form input transaksi + preview kalkulasi + tabel riwayat (local state via DataContext)

import { useState } from "react";
import { useData } from "../context/DataContext.jsx";
import { productList } from "../utils/constants.js";
import { calculateTransaction } from "../utils/calculations.js";
import { formatRupiah, formatDate, formatNumber } from "../utils/formatters.js";

export default function TransactionsPage() {
  const { transactions, addTransaction, loading } = useData();

  const [buyer, setBuyer] = useState("");
  const [productCode, setProductCode] = useState("");
  const [quantity, setQuantity] = useState("");
  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const selectedProduct =
    productList.find((p) => p.code === productCode) || null;
  const calc =
    selectedProduct && quantity
      ? calculateTransaction(selectedProduct, Number(quantity))
      : null;

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (!buyer.trim() || !productCode || !quantity || !date) {
        alert("Mohon lengkapi username, produk, quantity, dan tanggal.");
        return;
      }

      setSaving(true);
      await Promise.resolve(
        addTransaction({
          buyerUsername: buyer,
          productCode,
          quantity: Number(quantity),
          date,
          notes,
        })
      );

      setBuyer("");
      setProductCode("");
      setQuantity("");
      setNotes("");
      alert("Transaksi tersimpan (versi lokal).");
    } catch (err) {
      console.error(err);
      alert(err.message || "Gagal menyimpan transaksi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header halaman */}
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Transaksi</h1>
        <p className="text-sm text-slate-500">
          Input transaksi Shopee, lihat preview perhitungan fee 17% dan
          pembagian laba 40% / 60%.
        </p>
      </div>

      {/* Grid: Form + Preview */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* FORM */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <h2 className="text-base font-semibold text-slate-800 mb-1">
            Input Transaksi
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Isi username pembeli, pilih produk, quantity, tanggal, dan catatan
            opsional.
          </p>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm"
          >
            {/* Username */}
            <div className="flex flex-col gap-1">
              <label className="font-medium text-slate-700 text-xs">
                Username Pembeli
              </label>
              <input
                type="text"
                value={buyer}
                onChange={(e) => setBuyer(e.target.value)}
                placeholder="contoh: tokomakmur123"
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Produk */}
            <div className="flex flex-col gap-1">
              <label className="font-medium text-slate-700 text-xs">
                Produk
              </label>
              <select
                value={productCode}
                onChange={(e) => setProductCode(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Pilih produk…</option>
                {productList.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.name} — {formatRupiah(p.sellPrice)}
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <div className="flex flex-col gap-1">
              <label className="font-medium text-slate-700 text-xs">
                Quantity
              </label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              {selectedProduct?.type === "paket" && (
                <p className="text-[11px] text-slate-400">
                  1 = 1 paket ({formatNumber(selectedProduct.packageSize)} pcs)
                </p>
              )}
            </div>

            {/* Tanggal */}
            <div className="flex flex-col gap-1">
              <label className="font-medium text-slate-700 text-xs">
                Tanggal
              </label>
              <input
                type="date"
                max={new Date().toISOString().slice(0, 10)}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Catatan */}
            <div className="md:col-span-2 flex flex-col gap-1">
              <label className="font-medium text-slate-700 text-xs">
                Catatan (optional)
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="contoh: pesanan rutin bulanan"
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Tombol */}
            <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setBuyer("");
                  setProductCode("");
                  setQuantity("");
                  setNotes("");
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
                {saving ? "Menyimpan…" : "Simpan Transaksi"}
              </button>
            </div>
          </form>
        </div>

        {/* PREVIEW */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 text-sm">
          <h3 className="text-base font-semibold text-slate-800 mb-2">
            Preview Kalkulasi
          </h3>
          <p className="text-xs text-slate-500 mb-3">
            Pilih produk dan isi quantity untuk melihat simulasi fee, modal, dan laba.
          </p>

          {calc ? (
            <div className="space-y-2 text-sm">
              <div className="bg-slate-50 rounded-xl p-3 space-y-1">
                <p className="font-medium text-slate-700">
                  {selectedProduct.name} × {calc.quantity}
                </p>
                {selectedProduct.type === "paket" && (
                  <p className="text-[11px] text-slate-500">
                    Actual: {formatNumber(calc.actualQuantity)} pcs
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-1 text-xs">
                <Row
                  label="Total Harga Jual"
                  value={formatRupiah(calc.totalSellPrice)}
                />
                <Row
                  label="Potongan Shopee (17%)"
                  value={formatRupiah(calc.shopeeDiscount)}
                />
                <Row
                  label="Penghasilan Bersih"
                  value={formatRupiah(calc.netIncome)}
                />
                <Row
                  label="Total Modal"
                  value={formatRupiah(calc.totalCost)}
                />
                <Row label="Laba Bersih" value={formatRupiah(calc.profit)} />
              </div>

              <div className="mt-3 border-t border-slate-100 pt-3">
                <p className="text-xs font-semibold text-slate-700 mb-1">
                  Pembagian Laba
                </p>
                <Row
                  label="BluePack (40%)"
                  value={formatRupiah(calc.bluePack)}
                />
                <Row
                  label="CempakaPack (60%)"
                  value={formatRupiah(calc.cempakaPack)}
                />
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl p-3">
              Belum ada data. Pilih produk & isi quantity untuk melihat preview.
            </div>
          )}
        </div>
      </div>

      {/* TABEL RIWAYAT */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-semibold text-slate-800">
              Riwayat Transaksi (Lokal)
            </h2>
            <p className="text-xs text-slate-500">
              Menampilkan transaksi yang kamu input selama sesi ini.
            </p>
          </div>
        </div>

        {loading ? (
          <p className="text-xs text-slate-500">Memuat data…</p>
        ) : transactions.length === 0 ? (
          <p className="text-xs text-slate-500">
            Belum ada transaksi. Input transaksi pertama di form di atas.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="text-left text-[11px] uppercase text-slate-400 border-b border-slate-100">
                  <th className="py-2 pr-4">Tanggal</th>
                  <th className="py-2 pr-4">Username</th>
                  <th className="py-2 pr-4">Produk</th>
                  <th className="py-2 pr-4 text-right">Qty</th>
                  <th className="py-2 pr-4 text-right">Total Jual</th>
                  <th className="py-2 pr-4 text-right">Laba</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-slate-50 hover:bg-slate-50/60"
                  >
                    <td className="py-2 pr-4 whitespace-nowrap">
                      {formatDate(t.date)}
                    </td>
                    <td className="py-2 pr-4 whitespace-nowrap">
                      {t.buyerUsername}
                    </td>
                    <td className="py-2 pr-4 whitespace-nowrap">
                      {t.productName}
                    </td>
                    <td className="py-2 pr-4 text-right">
                      {formatNumber(t.quantity)}
                    </td>
                    <td className="py-2 pr-4 text-right">
                      {formatRupiah(t.totalSellPrice)}
                    </td>
                    <td className="py-2 pr-4 text-right">
                      {formatRupiah(t.profit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-800">{value}</span>
    </div>
  );
}
