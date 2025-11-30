// src/pages/TransactionsPage.jsx
// Halaman input transaksi (multi-item per transaksi Shopee) + riwayat per item.
// Di bawah ada tabel riwayat dengan fitur:
// - search by username (case-insensitive, substring)
// - delete transaksi per item (memanggil deleteTransaction dari DataContext)

import { useMemo, useState } from "react";
import { useData } from "../context/DataContext.jsx";
import { PRODUCTS } from "../utils/constants.js";
import {
  calculateItemValues,
  calculateShopeeFee,
} from "../utils/calculations.js";
import {
  formatRupiah,
  formatNumber,
  formatDate,
} from "../utils/formatters.js";
import { toast } from "react-hot-toast";

const EMPTY_ITEM = {
  productCode: "",
  quantity: 1,
};

export default function TransactionsPage() {
  const { transactions, addTransaction, deleteTransaction, loading } =
    useData();

  // Form state untuk 1 transaksi Shopee (bisa berisi banyak item)
  const [buyerUsername, setBuyerUsername] = useState("");
  const [date, setDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([ { ...EMPTY_ITEM } ]);

  // Pencarian di riwayat
  const [searchTerm, setSearchTerm] = useState("");

  // ====== HANDLER FORM INPUT TRANSAKSI ======

  const handleItemChange = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]:
                field === "quantity" ? Number(value) || 0 : value,
            }
          : item
      )
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

  // Hitung preview transaksi dari form (tidak disimpan ke state global)
  const previewItems = useMemo(() => {
    const list = [];

    for (const item of items) {
      const product = PRODUCTS.find(
        (p) => p.code === item.productCode
      );
      if (!product || !item.quantity || item.quantity <= 0) continue;

      const calc = calculateItemValues({
        product,
        quantity: item.quantity,
      });

      list.push({
        ...calc,
        productCode: product.code,
        productName: product.name,
      });
    }

    return list;
  }, [items]);

  const totalPreview = useMemo(() => {
    let totalSell = 0;
    let totalFee = 0;
    let totalNet = 0;
    let totalCost = 0;
    let totalProfit = 0;

    for (const it of previewItems) {
      totalSell += it.totalSellPrice;
      totalFee += it.shopeeDiscount;
      totalNet += it.netIncome;
      totalCost += it.totalCost;
      totalProfit += it.profit;
    }

    return {
      totalSell,
      totalFee,
      totalNet,
      totalCost,
      totalProfit,
    };
  }, [previewItems]);

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
    if (previewItems.length === 0) {
      toast.error("Minimal harus ada 1 item dengan produk & quantity valid.");
      return;
    }

    // groupId untuk mengelompokkan beberapa item dalam 1 transaksi Shopee
    const groupId = `TRX_${date}_${Date.now()}`;

    try {
      for (const item of previewItems) {
        const now = Date.now();

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
      // Reset form
      setBuyerUsername("");
      setDate(new Date().toISOString().slice(0, 10));
      setNotes("");
      setItems([{ ...EMPTY_ITEM }]);
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan transaksi.");
    }
  };

  // ====== FILTER RIWAYAT BERDASARKAN SEARCH USERNAME ======

  const filteredTransactions = useMemo(() => {
    const all = Array.isArray(transactions) ? transactions : [];

    if (!searchTerm.trim()) return all;

    const term = searchTerm.trim().toLowerCase();
    return all.filter((t) =>
      (t.buyerUsername || "").toLowerCase().includes(term)
    );
  }, [transactions, searchTerm]);

  // sorted terbaru di atas
  const sortedTransactions = useMemo(
    () =>
      [...filteredTransactions].sort(
        (a, b) => (b.timestamp || 0) - (a.timestamp || 0)
      ),
    [filteredTransactions]
  );

  // Handler hapus per item
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

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-xl font-semibold text-slate-800">
          Transaksi
        </h1>
        <p className="text-sm text-slate-500">
          Input transaksi Shopee (bisa berisi beberapa item produk) dan
          lihat riwayat transaksi per item.
        </p>
      </div>

      {/* FORM INPUT TRANSAKSI */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-4"
      >
        <div className="flex flex-col md:flex-row md:items-center md:gap-6 gap-4">
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Username Pembeli (Shopee)
            </label>
            <input
              type="text"
              value={buyerUsername}
              onChange={(e) => setBuyerUsername(e.target.value)}
              placeholder="contoh: tokomakmur123"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Tanggal Transaksi
            </label>
            <input
              type="date"
              value={date}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setDate(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* TABEL ITEM DALAM 1 TRANSAKSI */}
        <div className="border border-slate-100 rounded-2xl p-3 space-y-2 bg-slate-50/60">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-slate-600">
              Item Dalam Transaksi Ini
            </h2>
            <button
              type="button"
              onClick={addEmptyItemRow}
              className="text-[11px] px-2 py-1 rounded-lg border border-indigo-200 text-indigo-600 hover:bg-indigo-50"
            >
              + Tambah Item
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="text-left text-[11px] uppercase text-slate-400 border-b border-slate-200">
                  <th className="py-2 pr-4">Produk</th>
                  <th className="py-2 pr-4 text-right">Qty</th>
                  <th className="py-2 pr-4 text-right">Total Jual</th>
                  <th className="py-2 pr-4 text-right">Modal</th>
                  <th className="py-2 pr-4 text-right">Laba</th>
                  <th className="py-2 pr-4"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => {
                  const product = PRODUCTS.find(
                    (p) => p.code === item.productCode
                  );
                  const preview = product
                    ? calculateItemValues({
                        product,
                        quantity: item.quantity || 0,
                      })
                    : null;

                  return (
                    <tr
                      key={index}
                      className="border-b border-slate-100"
                    >
                      <td className="py-2 pr-4">
                        <select
                          value={item.productCode}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "productCode",
                              e.target.value
                            )
                          }
                          className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="">Pilih produk…</option>
                          {PRODUCTS.map((p) => (
                            <option key={p.code} value={p.code}>
                              {p.name} ({formatRupiah(p.sellPrice)})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2 pr-4 text-right">
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
                          className="w-20 border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-right focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </td>
                      <td className="py-2 pr-4 text-right">
                        {preview
                          ? formatRupiah(preview.totalSellPrice)
                          : "-"}
                      </td>
                      <td className="py-2 pr-4 text-right">
                        {preview
                          ? formatRupiah(preview.totalCost)
                          : "-"}
                      </td>
                      <td className="py-2 pr-4 text-right">
                        {preview
                          ? formatRupiah(preview.profit)
                          : "-"}
                      </td>
                      <td className="py-2 pr-2 text-right">
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItemRow(index)}
                            className="text-[11px] text-rose-600 hover:text-rose-700"
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

          {/* PREVIEW TOTAL TRANSAKSI */}
          <div className="mt-2 flex flex-wrap gap-4 text-[11px] text-slate-600">
            <span>
              Total Jual:{" "}
              <strong>{formatRupiah(totalPreview.totalSell)}</strong>
            </span>
            <span>
              Potongan Shopee (±17%):{" "}
              <strong>{formatRupiah(totalPreview.totalFee)}</strong>
            </span>
            <span>
              Net Income:{" "}
              <strong>{formatRupiah(totalPreview.totalNet)}</strong>
            </span>
            <span>
              Total Modal:{" "}
              <strong>{formatRupiah(totalPreview.totalCost)}</strong>
            </span>
            <span>
              Laba Bersih:{" "}
              <strong>{formatRupiah(totalPreview.totalProfit)}</strong>
            </span>
          </div>
        </div>

        {/* NOTES + ACTIONS */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-600">
            Catatan (opsional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Misal: pesanan rutin, beli untuk reseller, dsb."
          />
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              setBuyerUsername("");
              setDate(new Date().toISOString().slice(0, 10));
              setNotes("");
              setItems([{ ...EMPTY_ITEM }]);
            }}
            className="px-4 py-2 text-sm rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50"
          >
            Reset
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700"
          >
            Simpan Transaksi
          </button>
        </div>
      </form>

      {/* RIWAYAT TRANSAKSI PER ITEM */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 text-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
          <div>
            <h2 className="text-base font-semibold text-slate-800">
              Riwayat Transaksi (Per Item)
            </h2>
            <p className="text-xs text-slate-500">
              Setiap baris adalah 1 item produk dalam transaksi Shopee.
              Kamu bisa mencari berdasarkan username dan menghapus item
              tertentu jika salah input.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari username…"
              className="border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {loading ? (
          <p className="text-xs text-slate-500">Memuat data…</p>
        ) : sortedTransactions.length === 0 ? (
          <p className="text-xs text-slate-500">
            Belum ada transaksi yang tercatat.
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
                  <th className="py-2 pr-4 text-right">Modal</th>
                  <th className="py-2 pr-4 text-right">Laba</th>
                  <th className="py-2 pr-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {sortedTransactions.map((t) => (
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
                      {formatRupiah(t.totalCost)}
                    </td>
                    <td className="py-2 pr-4 text-right">
                      {formatRupiah(t.profit)}
                    </td>
                    <td className="py-2 pr-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(t.id)}
                        className="text-[11px] text-rose-600 hover:text-rose-700"
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
