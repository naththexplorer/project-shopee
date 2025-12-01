// src/pages/ReportsPage.jsx
// Halaman laporan & analitik penjualan (per item).

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

  const {
    summary,
    productStats,
    dailyStats,
    metrics,
  } = useMemo(() => {
    const txAll = Array.isArray(transactions) ? transactions : [];
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;

    // Helper: ambil "tanggal harian" dalam ms (jam diset 00:00)
    const getTxDayMs = (t) => {
      // 1) Prioritas: field date ("YYYY-MM-DD")
      if (t.date) {
        const d = new Date(t.date + "T00:00:00");
        if (!Number.isNaN(d.getTime())) {
          return d.getTime();
        }
      }

      // 2) Fallback: timestamp number
      const ts = t.timestamp;
      if (typeof ts === "number") {
        const d = new Date(ts);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      }

      // 3) Fallback: Firestore Timestamp (punya toDate)
      if (ts && typeof ts.toDate === "function") {
        const d = ts.toDate();
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      }

      // 4) Kalau sama sekali nggak ada info
      return null;
    };

    // Pasangkan transaksi dengan dayMs supaya tidak hitung ulang terus
    const txWithDay = txAll.map((t) => ({
      tx: t,
      dayMs: getTxDayMs(t),
    }));

    // === 1) Filter transaksi berdasarkan range hari ===
    let filteredPairs = txWithDay;

    if (rangeDays !== "all") {
      const days = Number(rangeDays) || 30;

      // Ambil hanya yang punya tanggal valid
      const withValidDate = txWithDay.filter((x) => x.dayMs !== null);

      if (withValidDate.length > 0) {
        // Anchor: tanggal TERBARU di data
        const latestDayMs = Math.max(...withValidDate.map((x) => x.dayMs));
        const cutoffDayMs = latestDayMs - (days - 1) * ONE_DAY_MS;

        filteredPairs = txWithDay.filter(
          (x) => x.dayMs !== null && x.dayMs >= cutoffDayMs
        );
      }
      // Kalau tidak ada yang punya tanggal valid => biarin All time (filteredPairs = txWithDay)
    }

    const filteredTx = filteredPairs.map((p) => p.tx);

    // === 2) Summary angka besar untuk periode ===
    let totalPenjualan = 0;
    let totalShopeeFee = 0;
    let totalNetIncome = 0;
    let totalModal = 0;
    let totalProfit = 0;
    let totalBluePack = 0;
    let totalCempaka = 0;
    let totalQty = 0;

    const productMap = new Map();
    const buyerMap = new Map();
    const dailyMap = new Map();

    for (const t of filteredTx) {
      const sell = t.totalSellPrice || 0;
      const cost = t.totalCost || 0;
      const qty = t.actualQuantity || t.quantity || 0;

      const profitRaw =
        t.profit ??
        ((t.bluePack || 0) + (t.cempakaPack || 0)) ??
        sell - cost;

      const blue = t.bluePack ?? profitRaw * 0.4;
      const cemp = t.cempakaPack ?? profitRaw * 0.6;

      const feePercent =
        typeof t.shopeeFeePercent === "number" ? t.shopeeFeePercent : 0.17;
      const fee = t.shopeeDiscount ?? sell * feePercent;
      const netIncome =
        t.netIncome ?? sell - (t.shopeeDiscount ?? sell * feePercent);

      totalPenjualan += sell;
      totalShopeeFee += fee;
      totalNetIncome += netIncome;
      totalModal += cost;
      totalProfit += profitRaw;
      totalBluePack += blue;
      totalCempaka += cemp;
      totalQty += qty;

      // ===== Analisis per produk =====
      const productKey = t.productCode || t.productName || "UNKNOWN";
      const existingProduct =
        productMap.get(productKey) || {
          code: t.productCode || "-",
          name: t.productName || "Produk Tidak Dikenal",
          totalQty: 0,
          totalPenjualan: 0,
          totalProfit: 0,
          totalBluePack: 0,
          totalCempakaPack: 0,
          transaksiCount: 0,
        };

      existingProduct.totalQty += qty;
      existingProduct.totalPenjualan += sell;
      existingProduct.totalProfit += profitRaw;
      existingProduct.totalBluePack += blue;
      existingProduct.totalCempakaPack += cemp;
      existingProduct.transaksiCount += 1;

      productMap.set(productKey, existingProduct);

      // ===== Analisis per buyer (untuk metrik performa saja) =====
      const buyerKey = t.buyerUsername || "Tanpa Username";
      const existingBuyer =
        buyerMap.get(buyerKey) || {
          username: buyerKey,
          transaksiCount: 0,
          totalOmzet: 0,
          totalProfit: 0,
        };

      existingBuyer.transaksiCount += 1;
      existingBuyer.totalOmzet += sell;
      existingBuyer.totalProfit += profitRaw;

      buyerMap.set(buyerKey, existingBuyer);

      // ===== Analisis harian =====
      const pair = txWithDay.find((p) => p.tx === t);
      const dayMs = pair?.dayMs ?? null;

      const dateKey =
        t.date ||
        (dayMs !== null
          ? new Date(dayMs).toISOString().slice(0, 10)
          : "Tanpa Tanggal");

      const existingDay =
        dailyMap.get(dateKey) || {
          date: dateKey,
          transaksiCount: 0,
          totalOmzet: 0,
          totalProfit: 0,
          totalBluePack: 0,
          totalCempakaPack: 0,
          totalQty: 0,
        };

      existingDay.transaksiCount += 1;
      existingDay.totalOmzet += sell;
      existingDay.totalProfit += profitRaw;
      existingDay.totalBluePack += blue;
      existingDay.totalCempakaPack += cemp;
      existingDay.totalQty += qty;

      dailyMap.set(dateKey, existingDay);
    }

    const productStats = Array.from(productMap.values()).sort(
      (a, b) => b.totalPenjualan - a.totalPenjualan
    );

    const buyerStats = Array.from(buyerMap.values()).sort(
      (a, b) => b.totalOmzet - a.totalOmzet
    );

    const dailyStats = Array.from(dailyMap.values()).sort((a, b) => {
      const pa = Date.parse(a.date);
      const pb = Date.parse(b.date);
      if (!Number.isNaN(pa) && !Number.isNaN(pb)) return pa - pb;
      return String(a.date).localeCompare(String(b.date));
    });

    const totalItems = filteredTx.length;
    const totalBuyer = buyerMap.size;
    const totalHariAktif = dailyMap.size || 1;

    const avgOmzetPerTrans =
      totalItems > 0 ? totalPenjualan / totalItems : 0;
    const avgProfitPerTrans = totalItems > 0 ? totalProfit / totalItems : 0;
    const avgProfitPerItem = totalQty > 0 ? totalProfit / totalQty : 0;
    const avgTransPerDay = totalItems > 0 ? totalItems / totalHariAktif : 0;

    const biggestBuyer = buyerStats[0] || null;

    const metrics = {
      avgOmzetPerTrans,
      avgProfitPerTrans,
      avgProfitPerItem,
      avgTransPerDay,
      biggestBuyer,
      totalShopeeFee,
      totalNetIncome,
    };

    const summary = {
      totalPenjualan,
      totalProfit,
      totalBluePack,
      totalCempaka,
      totalQty,
      totalItems,
      totalBuyer,
    };

    return { summary, productStats, dailyStats, metrics };
  }, [transactions, rangeDays]);

  return (
    <div className="space-y-6">
      {/* HEADER + FILTER RANGE */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 mb-1">
            Laporan Penjualan
          </h1>
          <p className="text-sm text-slate-600 max-w-xl">
            Rekap omzet, laba, BluePack / CempakaPack, analisis produk, dan
            metrik performa berdasarkan periode yang kamu pilih.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">
            Range waktu:
          </span>
          <select
            value={rangeDays}
            onChange={(e) => setRangeDays(e.target.value)}
            className="border border-slate-300 rounded-2xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {RANGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* RINGKASAN ANGKA BESAR */}
      <SummarySection summary={summary} loading={loading} />

      {/* PRODUK + METRIK PERFORMA */}
      <div className="grid grid-cols-1 xl:grid-cols-[2fr,1.2fr] gap-6 items-start">
        <ProductAnalysisSection
          productStats={productStats}
          totalPenjualan={summary.totalPenjualan}
          loading={loading}
        />
        <MetricsSection metrics={metrics} loading={loading} />
      </div>

      {/* RINGKASAN HARIAN */}
      <DailySummarySection dailyStats={dailyStats} loading={loading} />
    </div>
  );
}

// ====================== SUB-KOMPONEN ======================

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
    totalProfit,
    totalBluePack,
    totalCempaka,
    totalQty,
    totalItems,
  } = summary;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-6 gap-4">
      <SummaryCard
        label="Total Penjualan"
        value={formatRupiah(totalPenjualan)}
        helper="Omzet kotor dari transaksi"
      />
      <SummaryCard
        label="Total Laba"
        value={formatRupiah(totalProfit)}
        helper="Laba bersih semua transaksi"
      />
      <SummaryCard
        label="BluePack"
        value={formatRupiah(totalBluePack)}
        helper="Porsi laba untuk BluePack (40%)"
      />
      <SummaryCard
        label="CempakaPack"
        value={formatRupiah(totalCempaka)}
        helper="Porsi laba untuk CempakaPack (60%)"
      />
      <SummaryCard
        label="Qty Terjual"
        value={formatNumber(totalQty)}
        helper="Total unit barang terjual"
      />
      <SummaryCard
        label="Transaksi"
        value={formatNumber(totalItems)}
        helper="Jumlah baris item (transaksi per item)"
      />
    </div>
  );
}

function ProductAnalysisSection({ productStats, totalPenjualan, loading }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-800">
          Analisis Per Produk
        </h2>
        <p className="text-xs text-slate-500">
          Diurutkan berdasarkan omzet tertinggi.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-slate-300 border-t-indigo-600" />
        </div>
      ) : productStats.length === 0 ? (
        <p className="text-sm text-slate-500">
          Tidak ada transaksi pada periode ini.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="text-left py-2 pr-3">Produk</th>
                <th className="text-right py-2 pr-3">Qty</th>
                <th className="text-right py-2 pr-3">Penjualan</th>
                <th className="text-right py-2 pr-3">Laba</th>
                <th className="text-right py-2 pr-3">% Omzet</th>
              </tr>
            </thead>
            <tbody>
              {productStats.map((p) => {
                const persen =
                  totalPenjualan > 0
                    ? (p.totalPenjualan / totalPenjualan) * 100
                    : 0;

                return (
                  <tr
                    key={p.code + p.name}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="py-2 pr-3">
                      <p className="font-semibold text-slate-800">
                        {p.name}
                      </p>
                      <p className="text-[11px] text-slate-500">{p.code}</p>
                    </td>
                    <td className="py-2 pr-3 text-right">
                      {formatNumber(p.totalQty)}
                    </td>
                    <td className="py-2 pr-3 text-right">
                      {formatRupiah(p.totalPenjualan)}
                    </td>
                    <td className="py-2 pr-3 text-right">
                      {formatRupiah(p.totalProfit)}
                    </td>
                    <td className="py-2 pr-3 text-right">
                      {persen.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function MetricsSection({ metrics, loading }) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-center">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-slate-300 border-t-indigo-600" />
      </div>
    );
  }

  const {
    avgOmzetPerTrans,
    avgProfitPerTrans,
    avgProfitPerItem,
    avgTransPerDay,
    biggestBuyer,
  } = metrics;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
      <h2 className="text-lg font-semibold text-slate-800">
        Metrik Performa
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="border border-slate-200 rounded-xl p-3">
          <p className="text-[11px] text-slate-500">
            Rata-rata omzet per transaksi
          </p>
          <p className="text-sm font-semibold text-slate-800 mt-1">
            {formatRupiah(avgOmzetPerTrans)}
          </p>
        </div>

        <div className="border border-slate-200 rounded-xl p-3">
          <p className="text-[11px] text-slate-500">
            Rata-rata laba per transaksi
          </p>
          <p className="text-sm font-semibold text-slate-800 mt-1">
            {formatRupiah(avgProfitPerTrans)}
          </p>
        </div>

        <div className="border border-slate-200 rounded-xl p-3">
          <p className="text-[11px] text-slate-500">
            Rata-rata laba per item
          </p>
          <p className="text-sm font-semibold text-slate-800 mt-1">
            {formatRupiah(avgProfitPerItem)}
          </p>
        </div>

        <div className="border border-slate-200 rounded-xl p-3">
          <p className="text-[11px] text-slate-500">
            Rata-rata transaksi per hari
          </p>
          <p className="text-sm font-semibold text-slate-800 mt-1">
            {avgTransPerDay.toFixed(1)} transaksi/hari
          </p>
        </div>
      </div>

      <div className="border border-slate-200 rounded-xl p-3 text-xs">
        <p className="text-[11px] text-slate-500 mb-1">
          Buyer dengan omzet terbesar (di periode ini)
        </p>
        {biggestBuyer ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-800">
                {biggestBuyer.username}
              </p>
              <p className="text-[11px] text-slate-500">
                {biggestBuyer.transaksiCount} transaksi
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-slate-500">Total omzet</p>
              <p className="font-semibold text-slate-800">
                {formatRupiah(biggestBuyer.totalOmzet)}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-[11px] text-slate-500">
            Belum ada data buyer untuk periode ini.
          </p>
        )}
      </div>
    </div>
  );
}

function DailySummarySection({ dailyStats, loading }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-800">
          Ringkasan Harian
        </h2>
        <p className="text-xs text-slate-500">
          Omzet, laba, dan qty per tanggal.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-slate-300 border-t-indigo-600" />
        </div>
      ) : dailyStats.length === 0 ? (
        <p className="text-sm text-slate-500">
          Tidak ada transaksi pada periode ini.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="text-left py-2 pr-3">Tanggal</th>
                <th className="text-right py-2 pr-3">Transaksi</th>
                <th className="text-right py-2 pr-3">Qty</th>
                <th className="text-right py-2 pr-3">Omzet</th>
                <th className="text-right py-2 pr-3">Laba</th>
              </tr>
            </thead>
            <tbody>
              {dailyStats.map((d) => (
                <tr
                  key={d.date}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="py-2 pr-3">
                    {d.date ? formatDate(d.date) : "-"}
                  </td>
                  <td className="py-2 pr-3 text-right">
                    {formatNumber(d.transaksiCount)}
                  </td>
                  <td className="py-2 pr-3 text-right">
                    {formatNumber(d.totalQty)}
                  </td>
                  <td className="py-2 pr-3 text-right">
                    {formatRupiah(d.totalOmzet)}
                  </td>
                  <td className="py-2 pr-3 text-right">
                    {formatRupiah(d.totalProfit)}
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

function SummaryCard({ label, value, helper }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className="text-lg font-bold text-slate-900">{value}</p>
      {helper && <p className="text-xs text-slate-500 mt-1">{helper}</p>}
    </div>
  );
}
