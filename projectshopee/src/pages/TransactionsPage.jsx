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

  // ============================================================
  // HANDLER ITEM FORM
  // ============================================================

  const handleItemChange = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;

        if (field === "quantity") {
          // izinkan user menghapus jadi ""
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
    });

    return { previewItems: list, totalPreview: totals };
  }, [items]);

  // ============================================================
  // SUBMIT TRANSAKSI
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!buyerUsername.trim()) {
      toast.error("Username pembeli wajib diisi.");
      return;
    }
    if (!date) {
      toast.error("Tanggal transaksi wajib diisi.");
      return;
    }

    const validPreviewItems = previewItems.filter(Boolean);
    if (validPreviewItems.length === 0) {
      toast.error("Minimal harus ada 1 item dengan produk & quantity valid.");
      return;
    }

    const groupId = `TRX_${date}_${Date.now()}`;

    try {
      const now = Date.now();

      for (const item of validPreviewItems) {
        await addTransaction({
          groupId,
          buyerUsername: buyerUsername.trim(),
          date,
          timestamp: now,
          productCode: item.productCode,
          productName: item.productName,
          productType: item.productType,
          quantity: item.quantity,
          actualQuantity: item.actualQuantity,
          sellPrice: item.sellPrice,
          totalSellPrice: item.totalSellPrice,
          shopeeFeePercent: item.shopeeFeePercent,
          shopeeDiscount: item.shopeeDiscount,
          netIncome: item.netIncome,
          costPrice: item.costPrice,
          totalCost: item.totalCost,
          profit: item.profit,
          bluePack: item.bluePack,
          cempakaPack: item.cempakaPack,
          notes: notes.trim(),
        });
      }

      toast.success("Transaksi berhasil disimpan (per item).");
      setBuyerUsername("");
      setDate(new Date().toISOString().slice(0, 10));
      setNotes("");
      setItems([{ ...EMPTY_ITEM }]);
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
    if (!searchTerm.trim()) return all;
    const term = searchTerm.trim().toLowerCase();
    return all.filter((t) =>
      (t.buyerUsername || "").toLowerCase().includes(term)
    );
  }, [transactions, searchTerm]);

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
    <div className="space-y-8 animate-fadeIn">
      {/* Header with gradient */}
      <div className="relative">
        <div className="absolute -top-4 -left-4 w-32 h-32 bg-blue-200/30 rounded-full blur-3xl" />
        <div className="absolute -top-4 -right-4 w-32 h-32 bg-indigo-200/30 rounded-full blur-3xl" />
        <div className="relative">
          <h1 className="text-3xl font-extrabold text-slate-800 mb-2">
            Kelola Transaksi
          </h1>
          <p className="text-base text-slate-600">
            Input transaksi Shopee (bisa berisi beberapa item produk) dan lihat
            riwayat transaksi per item.
          </p>
        </div>
      </div>

      {/* FORM INPUT */}
      <form
        onSubmit={handleSubmit}
        className="bg-gradient-to-br from-white to-blue-50/30 rounded-3xl shadow-xl border border-blue-100/50 p-8 space-y-6 hover:shadow-2xl transition-all duration-500"
      >
        {/* Username & Date */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Username Pembeli (Shopee)
            </label>
            <input
              type="text"
              value={buyerUsername}
              onChange={(e) => setBuyerUsername(e.target.value)}
              placeholder="contoh: tokomakmur123"
              className="w-full border-2 border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all bg-white hover:border-slate-300"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Tanggal Transaksi
            </label>
            <input
              type="date"
              value={date}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border-2 border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all bg-white hover:border-slate-300"
            />
          </div>
        </div>

        {/* TABEL ITEM */}
        <div className="border-2 border-indigo-100 rounded-3xl p-6 bg-white/80 backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800">
              Item Dalam Transaksi Ini
            </h3>
            <button
              type="button"
              onClick={addEmptyItemRow}
              className="text-sm px-4 py-2 rounded-2xl bg-indigo-500 text-white font-semibold hover:bg-indigo-600 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
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
                  <th className="text-right py-3 pr-4 text-xs font-bold text-slate-600 uppercase tracking-wide">
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
                            handleItemChange(index, "quantity", e.target.value)
                          }
                          onFocus={(e) => e.target.select()}
                          className="w-24 border-2 border-slate-200 rounded-xl px-3 py-2 text-sm text-right focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all bg-white hover:border-slate-300"
                        />
                      </td>

                      <td className="py-3 pr-4 text-right font-semibold text-slate-700">
                        {preview ? formatRupiah(preview.totalSellPrice) : "-"}
                      </td>

                      <td className="py-3 pr-4 text-right font-semibold text-slate-700">
                        {preview ? formatRupiah(preview.totalCost) : "-"}
                      </td>

                      <td className="py-3 pr-4 text-right font-bold text-indigo-600">
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

          {/* PREVIEW TOTAL */}
          <div className="flex flex-wrap gap-5 text-sm bg-gradient-to-r from-indigo-50 to-violet-50 rounded-2xl p-4 border border-indigo-100">
            <PreviewBadge
              label="Total Jual"
              value={formatRupiah(totalPreview.totalSell)}
            />
            <PreviewBadge
              label="Potongan Shopee"
              value={formatRupiah(totalPreview.totalFee)}
            />
            <PreviewBadge
              label="Net Income"
              value={formatRupiah(totalPreview.totalNet)}
            />
            <PreviewBadge
              label="Total Modal"
              value={formatRupiah(totalPreview.totalCost)}
            />
            <PreviewBadge
              label="Laba Bersih"
              value={formatRupiah(totalPreview.totalProfit)}
              highlight
            />
          </div>
        </div>

        {/* NOTES */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Catatan (opsional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full border-2 border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all resize-y bg-white hover:border-slate-300"
            placeholder="Misal: pesanan rutin, beli untuk reseller, dsb."
          />
        </div>

        {/* BUTTONS */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={() => {
              setBuyerUsername("");
              setDate(new Date().toISOString().slice(0, 10));
              setNotes("");
              setItems([{ ...EMPTY_ITEM }]);
            }}
            className="px-6 py-3 text-sm rounded-xl border-2 border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 hover:border-slate-400 transition-all"
          >
            Reset
          </button>

          <button
            type="submit"
            className="px-8 py-3 text-sm rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold hover:from-indigo-700 hover:to-violet-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
          >
            Simpan Transaksi
          </button>
        </div>
      </form>

      {/* RIWAYAT TRANSAKSI */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200/50 p-8 hover:shadow-2xl transition-all duration-500">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 pb-5 border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-1">
              Riwayat Transaksi
            </h2>
            <p className="text-sm text-slate-600">
              Setiap baris adalah 1 item dalam transaksi Shopee.
            </p>
          </div>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="🔍 Cari username…"
              className="border-2 border-slate-200 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all w-full md:w-64 bg-white hover:border-slate-300"
            />
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
                  <th className="text-left py-4 pr-4 text-xs font-bold text-slate-600 uppercase tracking-wide">
                    Tanggal
                  </th>
                  <th className="text-left py-4 pr-4 text-xs font-bold text-slate-600 uppercase tracking-wide">
                    Username
                  </th>
                  <th className="text-left py-4 pr-4 text-xs font-bold text-slate-600 uppercase tracking-wide">
                    Produk
                  </th>
                  <th className="text-right py-4 pr-4 text-xs font-bold text-slate-600 uppercase tracking-wide">
                    Qty
                  </th>
                  <th className="text-right py-4 pr-4 text-xs font-bold text-slate-600 uppercase tracking-wide">
                    Total Jual
                  </th>
                  <th className="text-right py-4 pr-4 text-xs font-bold text-slate-600 uppercase tracking-wide">
                    Modal
                  </th>
                  <th className="text-right py-4 pr-4 text-xs font-bold text-slate-600 uppercase tracking-wide">
                    Laba
                  </th>
                  <th className="text-right py-4 pr-4 text-xs font-bold text-slate-600 uppercase tracking-wide">
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody>
                {sortedTransactions.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-slate-100 hover:bg-indigo-50/30 transition-colors group"
                  >
                    <td className="py-4 pr-4 whitespace-nowrap font-medium text-slate-700">
                      {formatDate(t.date)}
                    </td>
                    <td className="py-4 pr-4 whitespace-nowrap font-semibold text-slate-800">
                      {t.buyerUsername}
                    </td>
                    <td className="py-4 pr-4 whitespace-nowrap text-slate-700">
                      {t.productName}
                    </td>
                    <td className="py-4 pr-4 text-right font-semibold text-slate-700">
                      {formatNumber(t.quantity)}
                    </td>
                    <td className="py-4 pr-4 text-right font-semibold text-slate-800">
                      {formatRupiah(t.totalSellPrice)}
                    </td>
                    <td className="py-4 pr-4 text-right font-semibold text-slate-700">
                      {formatRupiah(t.totalCost)}
                    </td>
                    <td className="py-4 pr-4 text-right font-bold text-indigo-600">
                      {formatRupiah(t.profit)}
                    </td>
                    <td className="py-4 pr-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(t.id)}
                        className="text-sm text-rose-600 hover:text-rose-700 font-semibold opacity-0 group-hover:opacity-100 transition-all hover:underline"
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
