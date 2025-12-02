// src/pages/TransactionsPage.jsx
import { useMemo, useState } from "react";
import { useData } from "../context/DataContext.jsx";
import { PRODUCTS } from "../utils/constants.js";
import { calculateItemValues } from "../utils/calculations.js";
import { formatRupiah, formatNumber, formatDate } from "../utils/formatters.js";
import { toast } from "react-hot-toast";
import { Plus, Trash2, Save, Search, Filter, Receipt, Loader2 } from "lucide-react";

const EMPTY_ITEM = { productCode: "", quantity: "" };

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
          if (value === "") return { ...item, quantity: "" };
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
    setItems((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));
  };

  // ============================================================
  // PERHITUNGAN PREVIEW
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

      const calc = calculateItemValues({ product, quantity: item.quantity });
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

    return { previewItems: list, totalPreview: totals };
  }, [items]);

  // ============================================================
  // SUBMIT TRANSAKSI
  // ============================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!buyerUsername.trim()) {
      toast.error("Username pembeli harus diisi");
      return;
    }
    if (!date) {
      toast.error("Tanggal transaksi harus diisi");
      return;
    }

    const groupId = `TRX_${date}_${Date.now()}`;
    const validItems = previewItems.filter(Boolean);

    if (validItems.length === 0) {
      toast.error("Minimal harus ada 1 item yang valid");
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
      toast.error("Gagal menyimpan transaksi");
    }
  };

  // ============================================================
  // FILTER & SORT HISTORY
  // ============================================================
  const filteredTransactions = useMemo(() => {
    const all = Array.isArray(transactions) ? transactions : [];
    const term = searchTerm.trim().toLowerCase();

    return all.filter((t) => {
      const username = (t.buyerUsername || "").toLowerCase();
      const matchesSearch = !term || username.includes(term);
      const matchesProduct = !filterProductCode || filterProductCode === "" ? true : t.productCode === filterProductCode;

      let matchesDate = true;
      const dateStr = t.date || (t.timestamp ? new Date(t.timestamp).toISOString().slice(0, 10) : null);
      if (filterStartDate && dateStr) matchesDate = matchesDate && dateStr >= filterStartDate;
      if (filterEndDate && dateStr) matchesDate = matchesDate && dateStr <= filterEndDate;

      return matchesSearch && matchesProduct && matchesDate;
    });
  }, [transactions, searchTerm, filterProductCode, filterStartDate, filterEndDate]);

  const sortedTransactions = useMemo(
    () => [...filteredTransactions].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)),
    [filteredTransactions]
  );

  const handleDelete = async (id) => {
    if (!id) return;
    const ok = window.confirm("Yakin hapus data transaksi ini?");
    if (!ok) return;
    try {
      await deleteTransaction(id);
      toast.success("Transaksi berhasil dihapus");
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghapus transaksi");
    }
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-4 md:p-6 lg:p-8 animate-fadeIn">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Page Header */}
        <div className="px-1">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Input Transaksi</h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Tambah transaksi penjualan baru dengan kalkulasi otomatis
          </p>
        </div>

        {/* FORM INPUT */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900">Transaksi Baru</h2>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Transaction Info - Mobile: 1 col, Desktop: 3 cols */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                  Username Pembeli <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={buyerUsername}
                  onChange={(e) => setBuyerUsername(e.target.value)}
                  placeholder="contoh: budi_shop123"
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                  Tanggal Transaksi <span className="text-red-500">*</span>
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
                  placeholder="Catatan tambahan..."
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm font-medium text-slate-700">
                  Daftar Produk <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={addEmptyItemRow}
                  className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Tambah Item</span>
                  <span className="sm:hidden">Tambah</span>
                </button>
              </div>

              {items.map((item, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-start p-3 sm:p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    <select
                      value={item.productCode}
                      onChange={(e) => handleItemChange(index, "productCode", e.target.value)}
                      className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Pilih Produk</option>
                      {PRODUCTS.map((p) => (
                        <option key={p.code} value={p.code}>
                          {p.code} - {p.name}
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                      placeholder="Jumlah"
                      min="1"
                      className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItemRow(index)}
                    disabled={items.length === 1}
                    className="w-full sm:w-auto p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-sm"
                  >
                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 mx-auto" />
                  </button>
                </div>
              ))}
            </div>

            {/* Preview Summary - Mobile: 2 cols, Desktop: 4 cols */}
            {previewItems.some(Boolean) && (
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4 sm:p-6">
                <h3 className="text-sm sm:text-base font-semibold text-slate-900 mb-3 sm:mb-4">Preview Ringkasan</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                  <div>
                    <p className="text-slate-600 text-xs sm:text-sm">Total Pendapatan</p>
                    <p className="text-base sm:text-lg font-bold text-slate-900 tabular-nums mt-0.5">{formatRupiah(totalPreview.totalSell)}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 text-xs sm:text-sm">Biaya Shopee</p>
                    <p className="text-base sm:text-lg font-bold text-red-600 tabular-nums mt-0.5">{formatRupiah(totalPreview.totalFee)}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 text-xs sm:text-sm">Modal</p>
                    <p className="text-base sm:text-lg font-bold text-amber-600 tabular-nums mt-0.5">{formatRupiah(totalPreview.totalCost)}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 text-xs sm:text-sm">Laba Bersih</p>
                    <p className="text-base sm:text-lg font-bold text-emerald-600 tabular-nums mt-0.5">{formatRupiah(totalPreview.totalProfit)}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-3 sm:mt-4">
                  Ini adalah preview. Data akan disimpan ke database setelah klik tombol Simpan.
                </p>
              </div>
            )}

            {/* Submit Button - Full width on mobile */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                Simpan Transaksi
              </button>
            </div>
          </form>
        </div>
        {/* TRANSACTION HISTORY */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900">Riwayat Transaksi</h2>
          </div>

          {/* Filters - Mobile: 1 col, Desktop: 4 cols */}
          <div className="p-4 sm:p-6 border-b border-slate-200 space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="relative sm:col-span-2 lg:col-span-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari username pembeli..."
                  className="w-full pl-9 pr-3 py-2 sm:py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <select
                value={filterProductCode}
                onChange={(e) => setFilterProductCode(e.target.value)}
                className="px-3 py-2 sm:py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Semua Produk</option>
                {PRODUCTS.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.code} - {p.name}
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                placeholder="Tanggal Mulai"
                className="px-3 py-2 sm:py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />

              <input
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
                placeholder="Tanggal Akhir"
                className="px-3 py-2 sm:py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Table - Horizontal scroll on mobile */}
          <div className="p-4 sm:p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                <span className="ml-3 text-sm text-slate-600">Memuat data...</span>
              </div>
            ) : sortedTransactions.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">Tidak ada transaksi ditemukan</p>
                <p className="text-xs text-slate-400 mt-1">Input transaksi menggunakan form di atas</p>
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
                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-slate-600 uppercase whitespace-nowrap">
                          Username
                        </th>
                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-slate-600 uppercase whitespace-nowrap">
                          Produk
                        </th>
                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-right text-xs font-semibold text-slate-600 uppercase">
                          Qty
                        </th>
                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-right text-xs font-semibold text-slate-600 uppercase whitespace-nowrap">
                          Pendapatan
                        </th>
                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-right text-xs font-semibold text-slate-600 uppercase">
                          Modal
                        </th>
                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-right text-xs font-semibold text-slate-600 uppercase">
                          Laba
                        </th>
                        <th className="sticky right-0 z-10 bg-slate-50 px-3 sm:px-4 py-2 sm:py-3 text-center text-xs font-semibold text-slate-600 uppercase">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {sortedTransactions.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                          <td className="sticky left-0 z-10 bg-white hover:bg-slate-50 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-slate-600 whitespace-nowrap">
                            {t.date ? formatDate(t.date) : "-"}
                          </td>
                          <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                            <p className="text-xs sm:text-sm font-medium text-slate-900">{t.buyerUsername || "-"}</p>
                            {t.notes && <p className="text-xs text-slate-500 truncate max-w-[150px]">{t.notes}</p>}
                          </td>
                          <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                            <p className="text-xs sm:text-sm font-medium text-slate-900">{t.productName || "-"}</p>
                            <p className="text-xs text-slate-500">{t.productCode}</p>
                          </td>
                          <td className="px-3 sm:px-4 py-2 sm:py-3 text-right tabular-nums text-xs sm:text-sm font-semibold text-slate-900">
                            {formatNumber(t.actualQuantity || t.quantity || 0)}
                          </td>
                          <td className="px-3 sm:px-4 py-2 sm:py-3 text-right tabular-nums text-xs sm:text-sm font-semibold text-slate-900 whitespace-nowrap">
                            {formatRupiah(t.totalSellPrice || 0)}
                          </td>
                          <td className="px-3 sm:px-4 py-2 sm:py-3 text-right tabular-nums text-xs sm:text-sm font-semibold text-slate-900 whitespace-nowrap">
                            {formatRupiah(t.totalCost || 0)}
                          </td>
                          <td className="px-3 sm:px-4 py-2 sm:py-3 text-right tabular-nums text-xs sm:text-sm font-semibold text-emerald-600 whitespace-nowrap">
                            {formatRupiah(t.profit || 0)}
                          </td>
                          <td className="sticky right-0 z-10 bg-white hover:bg-slate-50 px-3 sm:px-4 py-2 sm:py-3 text-center">
                            <button
                              onClick={() => handleDelete(t.id)}
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
      </div>
    </div>
  );
}
