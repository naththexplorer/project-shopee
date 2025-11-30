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
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">
            Laporan & Analisis
          </h1>
          <p className="text-sm text-slate-500">
            Ringkasan performa penjualan, laba, dan produk terlaris berdasarkan
            rentang waktu yang kamu pilih.
          </p>
        </div>

        {/* Filter rentang waktu */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-500 whitespace-nowrap">
            Rentang laporan:
          </span>
          <select
            value={rangeDays}
            onChange={(e) => setRangeDays(e.target.value)}
            className="border border-slate-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 text-sm">
        <p className="text-xs text-slate-500">Memuat data laporan…</p>
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
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
      <h2 className="text-base font-semibold text-slate-800 mb-1">
        Ringkasan Periode
      </h2>
      <p className="text-xs text-slate-500 mb-4">
        Semua angka di bawah ini hanya berdasarkan transaksi yang masuk dalam
        rentang waktu yang dipilih.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
        <MiniStat
          label="Total Penjualan"
          value={formatRupiah(totalPenjualan)}
          helper="Σ total harga jual"
        />
        <MiniStat
          label="Total Transaksi (Item)"
          value={formatNumber(totalTransaksi)}
          helper="Setiap baris item = 1 transaksi"
        />
        <MiniStat
          label="Total Potongan Shopee"
          value={formatRupiah(totalShopeeFee)}
          helper="Approx. 17% + komponen lain"
        />
        <MiniStat
          label="Total Net Income"
          value={formatRupiah(totalNetIncome)}
          helper="Penjualan - potongan Shopee"
        />
        <MiniStat
          label="Total Modal Keluar"
          value={formatRupiah(totalModal)}
          helper="Σ totalCost"
        />
        <MiniStat
          label="Total Laba Bersih"
          value={formatRupiah(totalProfit)}
          helper="Net income - modal"
        />
        <MiniStat
          label="Laba BluePack (40%)"
          value={formatRupiah(totalBluePack)}
          helper=""
        />
        <MiniStat
          label="Laba CempakaPack (60%)"
          value={formatRupiah(totalCempaka)}
          helper=""
        />
        <MiniStat
          label="Rata-rata Laba/Transaksi"
          value={formatRupiah(avgProfitPerTx)}
          helper="Laba bersih / item transaksi"
        />
      </div>
    </div>
  );
}

// Tabel analisis per produk
function ProductAnalysisSection({ productStats, totalPenjualan, loading }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 text-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-base font-semibold text-slate-800">
            Analisis Per Produk
          </h2>
          <p className="text-xs text-slate-500">
            Performansi tiap produk dalam periode yang dipilih: quantity,
            penjualan, laba, dan kontribusi terhadap total penjualan.
          </p>
        </div>
      </div>

      {loading ? (
        <p className="text-xs text-slate-500">Memuat data produk…</p>
      ) : productStats.length === 0 ? (
        <p className="text-xs text-slate-500">
          Belum ada transaksi dalam rentang waktu ini.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="text-left text-[11px] uppercase text-slate-400 border-b border-slate-100">
                <th className="py-2 pr-4">Produk</th>
                <th className="py-2 pr-4 text-right">Qty</th>
                <th className="py-2 pr-4 text-right">Penjualan</th>
                <th className="py-2 pr-4 text-right">Laba</th>
                <th className="py-2 pr-4 text-right">BluePack</th>
                <th className="py-2 pr-4 text-right">Cempaka</th>
                <th className="py-2 pr-4 text-right">Laba/Unit</th>
                <th className="py-2 pr-4 text-right">% Penjualan</th>
              </tr>
            </thead>
            <tbody>
              {productStats.map((p) => (
                <tr
                  key={p.code}
                  className="border-b border-slate-50 hover:bg-slate-50/60"
                >
                  <td className="py-2 pr-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-800">
                        {p.name}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {p.code}
                      </span>
                    </div>
                  </td>
                  <td className="py-2 pr-4 text-right">
                    {formatNumber(p.totalQty)}
                  </td>
                  <td className="py-2 pr-4 text-right">
                    {formatRupiah(p.totalPenjualan)}
                  </td>
                  <td className="py-2 pr-4 text-right">
                    {formatRupiah(p.totalProfit)}
                  </td>
                  <td className="py-2 pr-4 text-right">
                    {formatRupiah(p.totalBluePack)}
                  </td>
                  <td className="py-2 pr-4 text-right">
                    {formatRupiah(p.totalCempaka)}
                  </td>
                  <td className="py-2 pr-4 text-right">
                    {formatRupiah(p.avgProfitPerUnit)}
                  </td>
                  <td className="py-2 pr-4 text-right">
                    {totalPenjualan > 0
                      ? (p.shareOfSales * 100).toFixed(1) + "%"
                      : "-"}
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
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 text-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-base font-semibold text-slate-800">
            Ringkasan Harian
          </h2>
          <p className="text-xs text-slate-500">
            Rekap penjualan dan laba per hari dalam periode yang dipilih.
          </p>
        </div>
      </div>

      {loading ? (
        <p className="text-xs text-slate-500">Memuat data harian…</p>
      ) : dailyStats.length === 0 ? (
        <p className="text-xs text-slate-500">
          Belum ada transaksi dalam rentang waktu ini.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="text-left text-[11px] uppercase text-slate-400 border-b border-slate-100">
                <th className="py-2 pr-4">Tanggal</th>
                <th className="py-2 pr-4 text-right">Total Penjualan</th>
                <th className="py-2 pr-4 text-right">Total Laba</th>
                <th className="py-2 pr-4 text-right">Jumlah Transaksi</th>
              </tr>
            </thead>
            <tbody>
              {dailyStats.map((d) => (
                <tr
                  key={d.date}
                  className="border-b border-slate-50 hover:bg-slate-50/60"
                >
                  <td className="py-2 pr-4 whitespace-nowrap">
                    {formatDate(d.date)}
                  </td>
                  <td className="py-2 pr-4 text-right">
                    {formatRupiah(d.totalPenjualan)}
                  </td>
                  <td className="py-2 pr-4 text-right">
                    {formatRupiah(d.totalProfit)}
                  </td>
                  <td className="py-2 pr-4 text-right">
                    {formatNumber(d.transaksiCount)}
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

// Komponen kartu kecil
function MiniStat({ label, value, helper }) {
  return (
    <div className="bg-slate-50 rounded-2xl px-4 py-3">
      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold text-slate-900">
        {value}
      </p>
      {helper && (
        <p className="mt-1 text-[11px] text-slate-400">{helper}</p>
      )}
    </div>
  );
}
