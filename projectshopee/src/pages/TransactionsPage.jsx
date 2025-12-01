// src/pages/TransactionsPage.jsx
// Halaman input & riwayat transaksi Shopee (per item).

import { useMemo, useState } from "react";
import { useData } from "../context/DataContext.jsx";
import { PRODUCTS } from "../utils/constants.js";
import { calculateItemValues } from "../utils/calculations.js";
import {
  formatRupiah,
  formatNumber,
  formatDate,
} from "../utils/formatters.js";
import { toast } from "react-hot-toast";

const EMPTY_ITEM = {
  productCode: "",
  quantity: "",
};

export default function TransactionsPage() {
  const { transactions, addTransaction, deleteTransaction, loading } = useData();

  const [buyerUsername, setBuyerUsername] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");

  const [items, setItems] = useState([{ ...EMPTY_ITEM }]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [filterProductCode, setFilterProductCode] = useState("");

  // ============================================================
  // HANDLER ITEM FORM
  // ============================================================

  const handleItemChange = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;

        if (field === "quantity") {
          if (value === "") {
            return { ...item, quantity: "" };
          }

          const numeric = Number(value);
          if (Number.isNaN(numeric)) return item;

          return { ...item, quantity: numeric };
        }

        return { ...item, [field]: value };
      })
    );
  };

  const addEmptyItemRow = () => {
    setItems((prev) => [...prev, { ...EMPTY_ITEM }]);
  };

  const removeItemRow = (index) => {
    setItems((prev) =>
      prev.length === 1 ? prev : prev.filter((_, i) => i !== index)
    );
  };

  // ============================================================
  // PERHITUNGAN ITEM + TOTAL (1x via useMemo)
  // ============================================================

  const { previewItems, totalPreview } = useMemo(() => {
    const list = [];
    const totals = {
      totalSell: 0,
      totalFee: 0,
      totalNet: 0,
      totalCost: 0,
      totalProfit: 0,
      totalBluePack: 0,
      totalCempakaPack: 0,
    };

    items.forEach((item) => {
      const product = PRODUCTS.find((p) => p.code === item.productCode);

      if (!product || !item.quantity || item.quantity <= 0) {
        list.push(null);
        return;
      }

      const calc = calculateItemValues({
        product,
        quantity: item.quantity,
      });

      const row = {
        ...calc,
        productCode: product.code,
        productName: product.name,
        quantity: item.quantity,
      };

      list.push(row);

      totals.totalSell += row.totalSellPrice;
      totals.totalFee += row.shopeeDiscount;
      totals.totalNet += row.netIncome;
      totals.totalCost += row.totalCost;
      totals.totalProfit += row.profit;
      totals.totalBluePack += row.bluePack || 0;
      totals.totalCempakaPack += row.cempakaPack || 0;
    });

    return {
      previewItems: list,
      totalPreview: totals,
    };
  }, [items]);

  // ============================================================
  // SUBMIT TRANSAKSI
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!buyerUsername.trim()) {
      toast.error("Username pembeli harus diisi.");
      return;
    }

    if (!date) {
      toast.error("Tanggal transaksi harus diisi.");
      return;
    }

    const groupId = `TRX_${date}_${Date.now()}`;

    const validItems = previewItems.filter(Boolean);
    if (validItems.length === 0) {
      toast.error("Minimal harus ada 1 item dengan produk & quantity valid.");
      return;
    }

    try {
      const now = Date.now();

      for (const item of validItems) {
        await addTransaction({
          groupId,
          buyerUsername: buyerUsername.trim(),
          date,
          notes: notes.trim(),

          productCode: item.productCode,
          productName: item.productName,
          productType: item.productType,

          quantity: item.actualQuantity,
          sellPrice: item.sellPrice,
          shopeeFeePercent: item.shopeeFeePercent,
          totalSellPrice: item.totalSellPrice,
          shopeeDiscount: item.shopeeDiscount,
          netIncome: item.netIncome,

          costPrice: item.costPrice,
          totalCost: item.totalCost,
          profit: item.profit,
          bluePack: item.bluePack,
          cempakaPack: item.cempakaPack,

          timestamp: now,
        });
      }

      toast.success("Transaksi berhasil disimpan!");

      setBuyerUsername("");
      setNotes("");
      setItems([{ ...EMPTY_ITEM }]);
      setDate(new Date().toISOString().slice(0, 10));
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan transaksi.");
    }
  };

  // ============================================================
  // FILTER + SORT RIWAYAT TRANSAKSI
  // ============================================================

  const filteredTransactions = useMemo(() => {
    const all = Array.isArray(transactions) ? transactions : [];
    const term = searchTerm.trim().toLowerCase();

    return all.filter((t) => {
      // filter username
      const username = (t.buyerUsername || "").toLowerCase();
      const matchesSearch = !term || username.includes(term);

      // filter productCode
      const matchesProduct =
        !filterProductCode || filterProductCode === ""
          ? true
          : t.productCode === filterProductCode;

      // filter tanggal
      let matchesDate = true;
      const dateStr =
        t.date ||
        (t.timestamp
          ? new Date(t.timestamp).toISOString().slice(0, 10)
          : null);

      if (filterStartDate && dateStr) {
        matchesDate = matchesDate && dateStr >= filterStartDate;
      }
      if (filterEndDate && dateStr) {
        matchesDate = matchesDate && dateStr <= filterEndDate;
      }

      return matchesSearch && matchesProduct && matchesDate;
    });
  }, [transactions, searchTerm, filterProductCode, filterStartDate, filterEndDate]);

  const sortedTransactions = useMemo(
    () =>
      [...filteredTransactions].sort(
        (a, b) => (b.timestamp || 0) - (a.timestamp || 0)
      ),
    [filteredTransactions]
  );

  const handleDelete = async (id) => {
    if (!id) return;
    const ok = window.confirm(
      "Yakin ingin menghapus item transaksi ini? Aksi tidak bisa dibatalkan."
    );
    if (!ok) return;

    try {
      await deleteTransaction(id);
      toast.success("Item transaksi berhasil dihapus.");
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghapus transaksi.");
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="relative">
        <div className="absolute -top-4 -left-4 w-32 h-32 bg-indigo-200/30 rounded-full blur-3xl" />
        <div className="absolute -top-4 -right-4 w-32 h-32 bg-amber-200/30 rounded-full blur-3xl" />
        <div className="relative">
          <h1 className="text-3xl font-extrabold text-slate-800 mb-2">
            Kelola Transaksi
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl">
            Input transaksi Shopee per item dengan perhitungan otomatis fee,
            modal, dan pembagian laba BluePack x CempakaPack.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 2xl:grid-cols-[1.4fr,1fr] gap-6 items-start">
        {/* FORM INPUT TRANSAKSI */}
        <div className="space-y-6">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl shadow-xl border border-slate-200/70 p-6 space-y-5"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-slate-800">
                  Input Transaksi Baru
                </h2>
                <p className="text-xs text-slate-500 max-w-md">
                  Satu transaksi bisa berisi beberapa item sekaligus.
                </p>
              </div>
              <div className="flex flex-col md:flex-row gap-3 md:items-center">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="border border-slate-300 rounded-2xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Username Pembeli (Shopee)
                </label>
                <input
                  type="text"
                  value={buyerUsername}
                  onChange={(e) => setBuyerUsername(e.target.value)}
                  placeholder="misal: nizaraherbal"
                  className="w-full border border-slate-300 rounded-2xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Catatan (opsional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="misal: pesanan untuk besok"
                  className="w-full border border-slate-300 rounded-2xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>
            </div>

            {/* TABEL ITEM INPUT */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
                <h3 className="text-sm font-semibold text-slate-700">
                  Item dalam Transaksi
                </h3>
                <button
                  type="button"
                  onClick={addEmptyItemRow}
                  className="text-sm px-4 py-2 rounded-2xl bg-indigo-50 text-indigo-700 font-semibold hover:bg-indigo-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                >
                  + Tambah Item
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-slate-200">
                      <th className="text-left py-3 pr-4 text-xs font-bold text-slate-600 uppercase tracking-wide">
                        Produk
                      </th>
                      <th className="text-right py-3 pr-4 text-xs font-bold text-slate-600 uppercase tracking-wide">
                        Qty
                      </th>
                      <th className="text-right py-3 pr-4 text-xs font-bold text-slate-600 uppercase tracking-wide">
                        Total Jual
                      </th>
                      <th className="text-right py-3 pr-4 text-xs font-bold text-slate-600 uppercase tracking-wide">
                        Modal
                      </th>
                      <th className="text-right py-3 pr-2 text-xs font-bold text-slate-600 uppercase tracking-wide">
                        Laba
                      </th>
                      <th className="py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => {
                      const preview = previewItems[index];

                      return (
                        <tr
                          key={index}
                          className="border-b border-slate-100 hover:bg-indigo-50/30 transition-colors"
                        >
                          <td className="py-3 pr-4">
                            <select
                              value={item.productCode}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "productCode",
                                  e.target.value
                                )
                              }
                              className="w-full border-2 border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all bg-white hover:border-slate-300"
                            >
                              <option value="">Pilih produk…</option>
                              {PRODUCTS.map((p) => (
                                <option key={p.code} value={p.code}>
                                  {p.name} ({formatRupiah(p.sellPrice)})
                                </option>
                              ))}
                            </select>
                          </td>

                          <td className="py-3 pr-4 text-right">
                            <input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "quantity",
                                  e.target.value
                                )
                              }
                              onFocus={(e) => e.target.select()}
                              className="w-24 border-2 border-slate-200 rounded-xl px-3 py-2 text-sm text-right focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all bg-white hover:border-slate-300"
                            />
                          </td>

                          <td className="py-3 pr-4 text-right font-semibold text-slate-700">
                            {preview
                              ? formatRupiah(preview.totalSellPrice)
                              : "-"}
                          </td>

                          <td className="py-3 pr-4 text-right font-semibold text-slate-700">
                            {preview ? formatRupiah(preview.totalCost) : "-"}
                          </td>

                          <td className="py-3 pr-2 text-right font-bold text-indigo-600">
                            {preview ? formatRupiah(preview.profit) : "-"}
                          </td>

                          <td className="py-3 pr-2 text-right">
                            {items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeItemRow(index)}
                                className="text-sm text-rose-600 hover:text-rose-700 font-semibold hover:underline transition-colors"
                              >
                                Hapus
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* RINGKASAN PREVIEW */}
              <div className="border-t border-slate-200 bg-slate-50/80 px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="text-xs text-slate-600">
                  <p>
                    Item valid:{" "}
                    <span className="font-semibold">
                      {previewItems.filter(Boolean).length}
                    </span>{" "}
                    | Total Qty:{" "}
                    <span className="font-semibold">
                      {formatNumber(
                        previewItems
                          .filter(Boolean)
                          .reduce(
                            (sum, row) => sum + (row.actualQuantity || 0),
                            0
                          )
                      )}
                    </span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 text-xs">
                  <PreviewBadge
                    label="Total Jual"
                    value={formatRupiah(totalPreview.totalSell)}
                  />
                  <PreviewBadge
                    label="Modal"
                    value={formatRupiah(totalPreview.totalCost)}
                  />
                  <PreviewBadge
                    label="Laba"
                    value={formatRupiah(totalPreview.totalProfit)}
                    highlight
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-2xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 shadow-md shadow-indigo-500/30"
              >
                {loading ? "Menyimpan…" : "Simpan Transaksi"}
              </button>
            </div>
          </form>
        </div>

        {/* SIDEPANEL PREVIEW TOTAL */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-3xl shadow-xl p-6 text-slate-50">
            <h2 className="text-lg font-semibold mb-4">
              Ringkasan Transaksi Ini
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-300">Total omzet</span>
                <span className="font-semibold">
                  {formatRupiah(totalPreview.totalSell)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Total modal</span>
                <span className="font-semibold">
                  {formatRupiah(totalPreview.totalCost)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Perkiraan fee Shopee</span>
                <span className="font-semibold">
                  {formatRupiah(totalPreview.totalFee)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Pendapatan bersih</span>
                <span className="font-semibold text-white">
                  {formatRupiah(totalPreview.totalNet)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Total laba</span>
                <span className="font-semibold text-white">
                  {formatRupiah(totalPreview.totalProfit)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Laba BluePack (40%)</span>
                <span className="font-semibold text-white">
                  {formatRupiah(totalPreview.totalBluePack)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Laba CempakaPack (60%)</span>
                <span className="font-semibold text-white">
                  {formatRupiah(totalPreview.totalCempakaPack)}
                </span>
              </div>
            </div>
            <p className="mt-4 text-[11px] text-slate-400">
              Semua nilai di atas adalah preview sebelum transaksi disimpan ke
              database.
            </p>
          </div>
        </div>
      </div>

      {/* RIWAYAT TRANSAKSI */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200/50 p-8 hover:shadow-2xl transition-all duration-500">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 pb-5 border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-1">
              Riwayat Transaksi
            </h2>
            <p className="text-sm text-slate-600">
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            {/* Search username */}
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari username…"
              className="border-2 border-slate-200 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:ring-offset-1 focus:ring-offset-indigo-50 transition-all w-full md:w-64 bg-white hover:border-slate-300"
            />

            {/* Date range */}
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                className="border-2 border-slate-200 rounded-2xl px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
              <span className="text-[11px] text-slate-500">sampai</span>
              <input
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
                className="border-2 border-slate-200 rounded-2xl px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>

            {/* Filter produk */}
            <select
              value={filterProductCode}
              onChange={(e) => setFilterProductCode(e.target.value)}
              className="border-2 border-slate-200 rounded-2xl px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">Semua produk</option>
              {PRODUCTS.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.code} — {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 mb-4" />
            <p className="text-sm text-slate-600">Memuat data…</p>
          </div>
        ) : sortedTransactions.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-lg font-semibold text-slate-700 mb-2">
              Belum ada transaksi tercatat
            </p>
            <p className="text-sm text-slate-500">
              Tambahkan transaksi menggunakan form di atas.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="text-left py-3 pr-4 text-xs font-bold text-slate-600 uppercase tracking-wide">
                    Tanggal
                  </th>
                  <th className="text-left py-3 pr-4 text-xs font-bold text-slate-600 uppercase tracking-wide">
                    Username
                  </th>
                  <th className="text-left py-3 pr-4 text-xs font-bold text-slate-600 uppercase tracking-wide">
                    Produk
                  </th>
                  <th className="text-right py-3 pr-4 text-xs font-bold text-slate-600 uppercase tracking-wide">
                    Qty
                  </th>
                  <th className="text-right py-3 pr-4 text-xs font-bold text-slate-600 uppercase tracking-wide">
                    Total Jual
                  </th>
                  <th className="text-right py-3 pr-4 text-xs font-bold text-slate-600 uppercase tracking-wide">
                    Modal
                  </th>
                  <th className="text-right py-3 pr-4 text-xs font-bold text-slate-600 uppercase tracking-wide">
                    Laba
                  </th>
                  <th className="py-3 pr-2"></th>
                </tr>
              </thead>
              <tbody>
                {sortedTransactions.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3 pr-4 whitespace-nowrap">
                      {t.date ? formatDate(t.date) : "-"}
                    </td>
                    <td className="py-3 pr-4">
                      <p className="font-semibold text-slate-800">
                        {t.buyerUsername || "-"}
                      </p>
                      {t.groupId && (
                        <p className="text-[11px] text-slate-500">
                          {t.groupId}
                        </p>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <p className="font-semibold text-slate-800">
                        {t.productName || "-"}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {t.productCode}
                      </p>
                    </td>
                    <td className="py-3 pr-4 text-right">
                      {formatNumber(t.actualQuantity || t.quantity || 0)}
                    </td>
                    <td className="py-3 pr-4 text-right">
                      {formatRupiah(t.totalSellPrice || 0)}
                    </td>
                    <td className="py-3 pr-4 text-right">
                      {formatRupiah(t.totalCost || 0)}
                    </td>
                    <td className="py-3 pr-4 text-right font-semibold text-indigo-600">
                      {formatRupiah(t.profit || 0)}
                    </td>
                    <td className="py-3 pr-2 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(t.id)}
                        className="text-sm text-rose-600 hover:text-rose-700 font-semibold hover:underline transition-colors"
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
  );
}

function PreviewBadge({ label, value, highlight = false }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-slate-600 font-medium">{label}:</span>
      <span
        className={`font-bold ${
          highlight ? "text-indigo-600 text-lg" : "text-slate-800"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
