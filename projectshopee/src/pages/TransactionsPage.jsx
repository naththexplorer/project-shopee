// src/pages/ReportsPage.jsx
import { useMemo, useState } from "react";
import { useData } from "../context/DataContext.jsx";
import {
  formatRupiah,
  formatNumber,
  formatDate,
} from "../utils/formatters.js";

// Opsi range hari untuk filter laporan
const RANGE_OPTIONS = [
  { value: "1", label: "1 hari" },
  { value: "2", label: "2 hari" },
  { value: "3", label: "3 hari" },
  { value: "7", label: "7 hari" },
  { value: "30", label: "30 hari" },
  { value: "60", label: "60 hari" },
  { value: "180", label: "180 hari" },
  { value: "360", label: "360 hari" },
  { value: "all", label: "All time" },
];

// Optimized table row components
const ProductRow = ({ product, totalPenjualan }) => (
  <tr className="border-b border-slate-100">
    <td className="py-3 px-4">
      <div>
        <div className="font-medium text-slate-800">{product.name}</div>
        <div className="text-xs text-slate-500">{product.code}</div>
      </div>
    </td>
    <td className="py-3 px-4 text-right font-medium text-slate-900">
      {formatNumber(product.totalQty)}
    </td>
    <td className="py-3 px-4 text-right font-medium text-slate-900">
      {formatRupiah(product.totalPenjualan)}
    </td>
    <td className="py-3 px-4 text-right font-medium text-slate-900">
      {formatRupiah(product.totalProfit)}
    </td>
    <td className="py-3 px-4 text-right font-medium text-slate-900">
      {formatRupiah(product.totalBluePack)}
    </td>
    <td className="py-3 px-4 text-right font-medium text-slate-900">
      {formatRupiah(product.totalCempaka)}
    </td>
    <td className="py-3 px-4 text-right font-medium text-slate-900">
      {formatRupiah(product.avgProfitPerUnit)}
    </td>
    <td className="py-3 px-4 text-right">
      <span className="text-xs font-medium text-slate-600">
        {totalPenjualan > 0
          ? (product.shareOfSales * 100).toFixed(1) + "%"
          : "-"}
      </span>
    </td>
  </tr>
);

const DailyRow = ({ daily }) => (
  <tr className="border-b border-slate-100">
    <td className="py-3 px-4 font-medium text-slate-800">
      {formatDate(daily.date)}
    </td>
    <td className="py-3 px-4 text-right font-medium text-slate-900">
      {formatRupiah(daily.totalPenjualan)}
    </td>
    <td className="py-3 px-4 text-right font-medium text-slate-900">
      {formatRupiah(daily.totalProfit)}
    </td>
    <td className="py-3 px-4 text-right">
      <span className="text-sm font-medium text-slate-700">
        {formatNumber(daily.transaksiCount)}
      </span>
    </td>
  </tr>
);

// Simple Stat component
const SimpleStat = ({ label, value, helper }) => (
  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
      {label}
    </p>
    <p className="text-lg font-bold text-slate-900">
      {value}
    </p>
    {helper && (
      <p className="text-xs text-slate-500 mt-1">{helper}</p>
    )}
  </div>
);

// Section components
const SummarySection = ({ summary, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-slate-300 border-t-indigo-600" />
        <p className="text-sm text-slate-500 mt-3">Memuat data laporan…</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">
        Ringkasan Periode
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <SimpleStat
          label="Total Penjualan"
          value={formatRupiah(summary.totalPenjualan)}
          helper="Σ total harga jual"
        />
        <SimpleStat
          label="Total Transaksi"
          value={formatNumber(summary.totalTransaksi)}
          helper="Jumlah item transaksi"
        />
        <SimpleStat
          label="Potongan Shopee"
          value={formatRupiah(summary.totalShopeeFee)}
          helper="Approx. 17% + komponen lain"
        />
        <SimpleStat
          label="Net Income"
          value={formatRupiah(summary.totalNetIncome)}
          helper="Penjualan - potongan"
        />
        <SimpleStat
          label="Modal Keluar"
          value={formatRupiah(summary.totalModal)}
          helper="Σ totalCost"
        />
        <SimpleStat
          label="Laba Bersih"
          value={formatRupiah(summary.totalProfit)}
          helper="Net income - modal"
        />
        <SimpleStat
          label="Laba BluePack"
          value={formatRupiah(summary.totalBluePack)}
          helper="40% dari laba"
        />
        <SimpleStat
          label="Laba CempakaPack"
          value={formatRupiah(summary.totalCempaka)}
          helper="60% dari laba"
        />
        <div className="sm:col-span-2 lg:col-span-1">
          <SimpleStat
            label="Rata-rata Laba/Transaksi"
            value={formatRupiah(summary.avgProfitPerTx)}
            helper="Laba per item transaksi"
          />
        </div>
      </div>
    </div>
  );
};

const ProductAnalysisSection = ({ productStats, totalPenjualan, loading }) => (
  <div className="bg-white rounded-xl border border-slate-200 p-6">
    <h2 className="text-lg font-semibold text-slate-800 mb-4">
      Analisis Per Produk
    </h2>

    {loading ? (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-slate-300 border-t-indigo-600" />
        <p className="text-sm text-slate-500 mt-3">Memuat data produk…</p>
      </div>
    ) : productStats.length === 0 ? (
      <div className="text-center py-8 text-slate-500">
        Belum ada transaksi dalam rentang waktu ini.
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-600 border-b border-slate-200">
              <th className="py-3 px-4 font-semibold">Produk</th>
              <th className="py-3 px-4 font-semibold text-right">Qty</th>
              <th className="py-3 px-4 font-semibold text-right">Penjualan</th>
              <th className="py-3 px-4 font-semibold text-right">Laba</th>
              <th className="py-3 px-4 font-semibold text-right">BluePack</th>
              <th className="py-3 px-4 font-semibold text-right">Cempaka</th>
              <th className="py-3 px-4 font-semibold text-right">Laba/Unit</th>
              <th className="py-3 px-4 font-semibold text-right">%</th>
            </tr>
          </thead>
          <tbody>
            {productStats.map((product) => (
              <ProductRow
                key={product.code}
                product={product}
                totalPenjualan={totalPenjualan}
              />
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

const DailySummarySection = ({ dailyStats, loading }) => (
  <div className="bg-white rounded-xl border border-slate-200 p-6">
    <h2 className="text-lg font-semibold text-slate-800 mb-4">
      Ringkasan Harian
    </h2>

    {loading ? (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-slate-300 border-t-indigo-600" />
        <p className="text-sm text-slate-500 mt-3">Memuat data harian…</p>
      </div>
    ) : dailyStats.length === 0 ? (
      <div className="text-center py-8 text-slate-500">
        Belum ada transaksi dalam rentang waktu ini.
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-600 border-b border-slate-200">
              <th className="py-3 px-4 font-semibold">Tanggal</th>
              <th className="py-3 px-4 font-semibold text-right">Total Penjualan</th>
              <th className="py-3 px-4 font-semibold text-right">Total Laba</th>
              <th className="py-3 px-4 font-semibold text-right">Transaksi</th>
            </tr>
          </thead>
          <tbody>
            {dailyStats.map((daily) => (
              <DailyRow key={daily.date} daily={daily} />
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

export default function ReportsPage() {
  const { transactions, loading } = useData();
  const [rangeDays, setRangeDays] = useState("30");

  const reportData = useMemo(() => {
    const txAll = Array.isArray(transactions) ? transactions : [];

    let filteredTx = txAll;
    if (rangeDays !== "all") {
      const days = Number(rangeDays);
      const cutoffDate = new Date();
      cutoffDate.setHours(0, 0, 0, 0);
      cutoffDate.setDate(cutoffDate.getDate() - (days - 1));
      const cutoffMs = cutoffDate.getTime();

      filteredTx = txAll.filter((t) => {
        if (!t.date) return true;
        const txDate = new Date(t.date + "T00:00:00");
        return txDate.getTime() >= cutoffMs;
      });
    }

    let totalPenjualan = 0;
    let totalTransaksi = 0;
    let totalShopeeFee = 0;
    let totalNetIncome = 0;
    let totalModal = 0;
    let totalProfit = 0;
    let totalBluePack = 0;
    let totalCempaka = 0;

    for (const t of filteredTx) {
      const sell = t.totalSellPrice || 0;
      const cost = t.totalCost || 0;
      const profit = t.profit ?? (t.bluePack || 0) + (t.cempakaPack || 0);
      const feePercent = typeof t.shopeeFeePercent === "number" ? t.shopeeFeePercent : 0.17;
      const fee = t.shopeeDiscount ?? sell * feePercent;
      const netIncome = t.netIncome ?? sell - (t.shopeeDiscount ?? sell * feePercent);

      totalPenjualan += sell;
      totalTransaksi += 1;
      totalShopeeFee += fee;
      totalNetIncome += netIncome;
      totalModal += cost;
      totalProfit += profit;
      totalBluePack += t.bluePack ?? profit * 0.4;
      totalCempaka += t.cempakaPack ?? profit * 0.6;
    }

    const avgProfitPerTx = totalTransaksi > 0 ? totalProfit / totalTransaksi : 0;

    const productMap = new Map();
    for (const t of filteredTx) {
      const key = t.productCode || t.productName || "UNKNOWN";
      const sell = t.totalSellPrice || 0;
      const qty = t.quantity || 0;
      const profit = t.profit ?? (t.bluePack || 0) + (t.cempakaPack || 0);
      const blue = t.bluePack ?? profit * 0.4;
      const cemp = t.cempakaPack ?? profit * 0.6;

      const existing = productMap.get(key) || {
        code: t.productCode || "-",
        name: t.productName || "Produk Tidak Dikenal",
        totalQty: 0,
        totalPenjualan: 0,
        totalProfit: 0,
        totalBluePack: 0,
        totalCempaka: 0,
        transaksiCount: 0,
      };

      existing.totalQty += qty;
      existing.totalPenjualan += sell;
      existing.totalProfit += profit;
      existing.totalBluePack += blue;
      existing.totalCempaka += cemp;
      existing.transaksiCount += 1;
      productMap.set(key, existing);
    }

    const productStats = Array.from(productMap.values()).map((p) => ({
      ...p,
      avgProfitPerUnit: p.totalQty > 0 ? p.totalProfit / p.totalQty : 0,
      shareOfSales: totalPenjualan > 0 ? p.totalPenjualan / totalPenjualan : 0,
    }));

    productStats.sort((a, b) => b.totalPenjualan - a.totalPenjualan);

    const dailyMap = new Map();
    for (const t of filteredTx) {
      const dateKey = t.date || new Date(t.timestamp).toISOString().slice(0, 10);
      const sell = t.totalSellPrice || 0;
      const profit = t.profit ?? (t.bluePack || 0) + (t.cempakaPack || 0);

      const existing = dailyMap.get(dateKey) || {
        date: dateKey,
        totalPenjualan: 0,
        totalProfit: 0,
        transaksiCount: 0,
      };

      existing.totalPenjualan += sell;
      existing.totalProfit += profit;
      existing.transaksiCount += 1;
      dailyMap.set(dateKey, existing);
    }

    const dailyStats = Array.from(dailyMap.values()).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    return {
      summary: {
        totalPenjualan,
        totalTransaksi,
        totalShopeeFee,
        totalNetIncome,
        totalModal,
        totalProfit,
        totalBluePack,
        totalCempaka,
        avgProfitPerTx,
      },
      productStats,
      dailyStats,
    };
  }, [transactions, rangeDays]);

  const { summary, productStats, dailyStats } = reportData;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            Laporan & Analisis
          </h1>
          <p className="text-sm text-slate-600">
            Ringkasan performa penjualan, laba, dan produk terlaris berdasarkan rentang waktu.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-700 whitespace-nowrap">
            Rentang Laporan:
          </span>
          <select
            value={rangeDays}
            onChange={(e) => setRangeDays(e.target.value)}
            className="border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-colors"
          >
            {RANGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <SummarySection summary={summary} loading={loading} />
      <ProductAnalysisSection
        productStats={productStats}
        totalPenjualan={summary.totalPenjualan}
        loading={loading}
      />
      <DailySummarySection dailyStats={dailyStats} loading={loading} />
    </div>
  );
}
