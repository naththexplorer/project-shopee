// src/pages/ReportsPage.jsx
// Halaman laporan & analitik penjualan.
// - Menggunakan range waktu (1–360 hari & All time) mirip Dashboard
// - Semua perhitungan berbasis transaksi per-item dari DataContext
// - Tidak tergantung Firebase (bisa disambungkan nanti di DataContext)

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

export default function ReportsPage() {
  const { transactions, loading } = useData();
  const [rangeDays, setRangeDays] = useState("30"); // default 30 hari terakhir

  // Semua perhitungan laporan dilakukan di useMemo supaya efisien
  const {
    filteredTx,
    summary,
    productStats,
    dailyStats,
  } = useMemo(() => {
    const txAll = Array.isArray(transactions) ? transactions : [];
    const now = Date.now();

    // === 1) Filter transaksi berdasarkan range ===
    let filteredTx = txAll;
    if (rangeDays !== "all") {
      const days = Number(rangeDays);

      // cutoff: N hari ke belakang dari hari ini (berdasarkan tanggal, bukan jam)
      const cutoffDate = new Date();
      cutoffDate.setHours(0, 0, 0, 0);
      cutoffDate.setDate(cutoffDate.getDate() - (days - 1));
      const cutoffMs = cutoffDate.getTime();

      filteredTx = txAll.filter((t) => {
        if (!t.date) return true; // kalau tidak ada tanggal, anggap selalu masuk
        const txDate = new Date(t.date + "T00:00:00");
        return txDate.getTime() >= cutoffMs;
      });
    }

    // === 2) Summary angka besar untuk periode ===
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

      // fee Shopee: pakai field jika ada, kalau tidak asumsi 17%
      const feePercent =
        typeof t.shopeeFeePercent === "number" ? t.shopeeFeePercent : 0.17;
      const fee = t.shopeeDiscount ?? sell * feePercent;
      const netIncome =
        t.netIncome ?? sell - (t.shopeeDiscount ?? sell * feePercent);

      totalPenjualan += sell;
      totalTransaksi += 1;
      totalShopeeFee += fee;
      totalNetIncome += netIncome;
      totalModal += cost;
      totalProfit += profit;
      totalBluePack += t.bluePack ?? profit * 0.4;
      totalCempaka += t.cempakaPack ?? profit * 0.6;
    }

    const avgProfitPerTx =
      totalTransaksi > 0 ? totalProfit / totalTransaksi : 0;

    const summary = {
      totalPenjualan,
      totalTransaksi,
      totalShopeeFee,
      totalNetIncome,
      totalModal,
      totalProfit,
      totalBluePack,
      totalCempaka,
      avgProfitPerTx,
    };

    // === 3) Analisis per produk dalam periode ===
    const productMap = new Map();

    for (const t of filteredTx) {
      const key = t.productCode || t.productName || "UNKNOWN";
      const sell = t.totalSellPrice || 0;
      const qty = t.quantity || 0;
      const profit = t.profit ?? (t.bluePack || 0) + (t.cempakaPack || 0);
      const blue = t.bluePack ?? profit * 0.4;
      const cemp = t.cempakaPack ?? profit * 0.6;

      const existing =
        productMap.get(key) || {
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
      avgProfitPerUnit:
        p.totalQty > 0 ? p.totalProfit / p.totalQty : 0,
      shareOfSales:
        totalPenjualan > 0 ? p.totalPenjualan / totalPenjualan : 0,
    }));

    // urutkan produk menurut total penjualan desc
    productStats.sort((a, b) => b.totalPenjualan - a.totalPenjualan);

    // === 4) Statistik per hari ===
    const dailyMap = new Map();

    for (const t of filteredTx) {
      const dateKey = t.date || new Date(t.timestamp).toISOString().slice(0, 10);
      const sell = t.totalSellPrice || 0;
      const profit = t.profit ?? (t.bluePack || 0) + (t.cempakaPack || 0);

      const existing =
        dailyMap.get(dateKey) || {
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
      filteredTx,
      summary,
      productStats,
      dailyStats,
    };
  }, [transactions, rangeDays]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            Laporan & Analisis
          </h1>
          <p className="text-sm text-slate-600">
            Ringkasan performa penjualan, laba, dan produk terlaris berdasarkan rentang waktu.
          </p>
        </div>

        {/* Filter rentang waktu */}
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

      {/* SUMMARY CARDS */}
      <SummarySection summary={summary} loading={loading} />

      {/* ANALISIS PER PRODUK */}
      <ProductAnalysisSection
        productStats={productStats}
        totalPenjualan={summary.totalPenjualan}
        loading={loading}
      />

      {/* RINGKASAN HARIAN */}
      <DailySummarySection dailyStats={dailyStats} loading={loading} />
    </div>
  );
}

// ====================== SUB-KOMPONEN ======================

// Bagian ringkasan angka besar untuk periode terpilih
function SummarySection({ summary, loading }) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-center">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-slate-300 border-t-indigo-600" />
        <p className="text-sm text-slate-500 mt-3">Memuat data laporan…</p>
      </div>
    );
  }

  const {
    totalPenjualan,
    totalTransaksi,
    totalShopeeFee,
    totalNetIncome,
    totalModal,
    totalProfit,
    totalBluePack,
    totalCempaka,
    avgProfitPerTx,
  } = summary;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">
        Ringkasan Periode
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <SimpleStat
          label="Total Penjualan"
          value={formatRupiah(totalPenjualan)}
          helper="Σ total harga jual"
        />
        <SimpleStat
          label="Total Transaksi"
          value={formatNumber(totalTransaksi)}
          helper="Jumlah item transaksi"
        />
        <SimpleStat
          label="Potongan Shopee"
          value={formatRupiah(totalShopeeFee)}
          helper="Approx. 17% + komponen lain"
        />
        <SimpleStat
          label="Net Income"
          value={formatRupiah(totalNetIncome)}
          helper="Penjualan - potongan"
        />
        <SimpleStat
          label="Modal Keluar"
          value={formatRupiah(totalModal)}
          helper="Σ totalCost"
        />
        <SimpleStat
          label="Laba Bersih"
          value={formatRupiah(totalProfit)}
          helper="Net income - modal"
        />
        <SimpleStat
          label="Laba BluePack"
          value={formatRupiah(totalBluePack)}
          helper="40% dari laba"
        />
        <SimpleStat
          label="Laba CempakaPack"
          value={formatRupiah(totalCempaka)}
          helper="60% dari laba"
        />
        <div className="sm:col-span-2 lg:col-span-1">
          <SimpleStat
            label="Rata-rata Laba/Transaksi"
            value={formatRupiah(avgProfitPerTx)}
            helper="Laba per item transaksi"
          />
        </div>
      </div>
    </div>
  );
}

// Tabel analisis per produk
function ProductAnalysisSection({ productStats, totalPenjualan, loading }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
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
              {productStats.map((p) => (
                <tr
                  key={p.code}
                  className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium text-slate-800">{p.name}</div>
                      <div className="text-xs text-slate-500">{p.code}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-slate-900">
                    {formatNumber(p.totalQty)}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-slate-900">
                    {formatRupiah(p.totalPenjualan)}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-slate-900">
                    {formatRupiah(p.totalProfit)}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-slate-900">
                    {formatRupiah(p.totalBluePack)}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-slate-900">
                    {formatRupiah(p.totalCempaka)}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-slate-900">
                    {formatRupiah(p.avgProfitPerUnit)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-xs font-medium text-slate-600">
                      {totalPenjualan > 0
                        ? (p.shareOfSales * 100).toFixed(1) + "%"
                        : "-"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Tabel ringkasan harian
function DailySummarySection({ dailyStats, loading }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
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
              {dailyStats.map((d) => (
                <tr
                  key={d.date}
                  className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <td className="py-3 px-4 font-medium text-slate-800">
                    {formatDate(d.date)}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-slate-900">
                    {formatRupiah(d.totalPenjualan)}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-slate-900">
                    {formatRupiah(d.totalProfit)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-sm font-medium text-slate-700">
                      {formatNumber(d.transaksiCount)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Simple Stat component
function SimpleStat({ label, value, helper }) {
  return (
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
}
