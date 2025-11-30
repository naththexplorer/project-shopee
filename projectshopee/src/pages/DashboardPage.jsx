// src/pages/DashboardPage.jsx
// Dashboard utama.
// - Atas: TodaySummaryRow (sudah ada, tidak diubah).
// - Tengah: Laba BluePack & CempakaPack HARI INI dan KEMARIN (tanpa range).
// - Bawah: Status modal (all time) + Produk terlaris + Transaksi terbaru.

import { useMemo } from "react";
import { useData } from "../context/DataContext.jsx";
import TodaySummaryRow from "../components/dashboard/TodaySummaryRow.jsx";
import {
  formatRupiah,
  formatNumber,
  formatDate,
} from "../utils/formatters.js";

export default function DashboardPage() {
  const { transactions, withdrawals, loading } = useData();

  const {
    bluePackToday,
    bluePackYesterday,
    cempakaToday,
    cempakaYesterday,
    modalSummary,
    topProducts,
    recentTransactions,
  } = useMemo(() => {
    const txAll = Array.isArray(transactions) ? transactions : [];
    const wd = Array.isArray(withdrawals) ? withdrawals : [];

    // tanggal hari ini & kemarin dalam format YYYY-MM-DD
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    let bluePackToday = 0;
    let bluePackYesterday = 0;
    let cempakaToday = 0;
    let cempakaYesterday = 0;

    let totalModalKeluar = 0;
    let totalWithdrawAyah = 0;

    const byProduct = new Map();

    // urutkan transaksi untuk "transaksi terbaru"
    const sortedTx = [...txAll].sort(
      (a, b) => (b.timestamp || 0) - (a.timestamp || 0)
    );

    for (const t of txAll) {
      // selalu utamakan field date untuk perhitungan harian
      const dateStr =
        t.date ||
        new Date(t.timestamp || Date.now()).toISOString().slice(0, 10);

      const baseProfit =
        t.profit ?? (t.bluePack || 0) + (t.cempakaPack || 0);
      const blue = t.bluePack ?? baseProfit * 0.4;
      const cemp = t.cempakaPack ?? baseProfit * 0.6;

      if (dateStr === todayStr) {
        bluePackToday += blue;
        cempakaToday += cemp;
      } else if (dateStr === yesterdayStr) {
        bluePackYesterday += blue;
        cempakaYesterday += cemp;
      }

      totalModalKeluar += t.totalCost || 0;

      // agregasi produk (all time)
      const key = t.productCode || t.productName || "UNKNOWN";
      const existing =
        byProduct.get(key) || {
          code: t.productCode || "-",
          name: t.productName || "Produk Tidak Dikenal",
          quantity: 0,
          revenue: 0,
        };

      existing.quantity += t.quantity || 0;
      existing.revenue += t.totalSellPrice || 0;
      byProduct.set(key, existing);
    }

    // withdraw all time
    for (const w of wd) {
      totalWithdrawAyah += w.amount || 0;
    }

    const saldoHutangModal = totalModalKeluar - totalWithdrawAyah;
    const modalSummary = {
      totalModalKeluar,
      totalWithdrawAyah,
      saldoHutangModal,
      isLunas: saldoHutangModal <= 0,
    };

    const topProducts = Array.from(byProduct.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    const recentTransactions = sortedTx.slice(0, 5);

    return {
      bluePackToday,
      bluePackYesterday,
      cempakaToday,
      cempakaYesterday,
      modalSummary,
      topProducts,
      recentTransactions,
    };
  }, [transactions, withdrawals]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-slate-800">
          Dashboard
        </h1>
        <p className="text-sm text-slate-500">
          Gambaran singkat penjualan Shopee, laba BluePack x CempakaPack,
          dan status modal.
        </p>
      </div>

      {/* Ringkasan hari ini (sales, transaksi, dll) */}
      <TodaySummaryRow />

      {/* Laba harian BluePack & CempakaPack */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        <h2 className="text-base font-semibold text-slate-800 mb-1">
          Laba Harian BluePack &amp; CempakaPack
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Laba bersih yang sudah dibagi 40% / 60% berdasarkan tanggal transaksi
          hari ini dan kemarin (per item).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <MiniStat
            label="Laba BluePack - Hari Ini"
            value={formatRupiah(bluePackToday)}
            helper="Akumulasi bagian BluePack dari transaksi hari ini"
          />
          <MiniStat
            label="Laba BluePack - Kemarin"
            value={formatRupiah(bluePackYesterday)}
            helper="Akumulasi bagian BluePack dari transaksi kemarin"
          />
          <MiniStat
            label="Laba CempakaPack - Hari Ini"
            value={formatRupiah(cempakaToday)}
            helper="Akumulasi bagian CempakaPack dari transaksi hari ini"
          />
          <MiniStat
            label="Laba CempakaPack - Kemarin"
            value={formatRupiah(cempakaYesterday)}
            helper="Akumulasi bagian CempakaPack dari transaksi kemarin"
          />
        </div>
      </div>

      {/* Status modal + analitik (all time) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Status modal all-time */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 text-sm">
          <h2 className="text-base font-semibold text-slate-800 mb-1">
            Status Modal (All Time)
          </h2>
          <p className="text-xs text-slate-500 mb-3">
            Rule: laba periode hanya boleh dibagi jika modal sudah lunas.
          </p>

          <p
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold mb-3 ${
              modalSummary.isLunas
                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                : "bg-rose-50 text-rose-700 border border-rose-100"
            }`}
          >
            {modalSummary.isLunas
              ? "🟢 MODAL LUNAS — siap bagi laba periode"
              : "🔴 SALDO HUTANG MODAL — belum boleh bagi laba periode"}
          </p>

          <div className="space-y-1">
            <Row
              label="Total Modal Keluar"
              value={formatRupiah(modalSummary.totalModalKeluar)}
            />
            <Row
              label="Total Withdraw Ayah"
              value={formatRupiah(modalSummary.totalWithdrawAyah)}
            />
            <Row
              label="Saldo Hutang Modal"
              value={formatRupiah(
                modalSummary.saldoHutangModal > 0
                  ? modalSummary.saldoHutangModal
                  : 0
              )}
            />
          </div>

          <p className="mt-3 text-[11px] text-slate-400">
            Detail lebih lengkap bisa dilihat di menu{" "}
            <span className="font-semibold text-slate-600">
              Manajemen Modal
            </span>
            .
          </p>
        </div>

        {/* Produk terlaris & transaksi terbaru (all time) */}
        <div className="xl:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Produk terlaris */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 text-sm">
            <h2 className="text-base font-semibold text-slate-800 mb-1">
              Produk Terlaris (Per Item)
            </h2>
            <p className="text-xs text-slate-500 mb-3">
              Top 5 produk berdasarkan quantity terjual dari seluruh data
              transaksi (all time).
            </p>

            {topProducts.length === 0 ? (
              <p className="text-xs text-slate-500">
                Belum ada data produk terlaris. Input beberapa transaksi
                terlebih dahulu.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className="text-left text-[11px] uppercase text-slate-400 border-b border-slate-100">
                      <th className="py-2 pr-4">Produk</th>
                      <th className="py-2 pr-4 text-right">
                        Qty Terjual
                      </th>
                      <th className="py-2 pr-4 text-right">
                        Total Penjualan
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((p) => (
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
                          {formatNumber(p.quantity)}
                        </td>
                        <td className="py-2 pr-4 text-right">
                          {formatRupiah(p.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Transaksi terbaru */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 text-sm">
            <h2 className="text-base font-semibold text-slate-800 mb-1">
              Transaksi Terbaru
            </h2>
            <p className="text-xs text-slate-500 mb-3">
              5 transaksi item terakhir yang kamu input (all time).
            </p>

            {loading ? (
              <p className="text-xs text-slate-500">Memuat data…</p>
            ) : recentTransactions.length === 0 ? (
              <p className="text-xs text-slate-500">
                Belum ada transaksi tercatat.
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
                      <th className="py-2 pr-4 text-right">
                        Total Jual
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.map((t) => (
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

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

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-900">{value}</span>
    </div>
  );
}
