// src/pages/DashboardPage.jsx

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
    const sortedTx = [...txAll].sort(
      (a, b) => (b.timestamp || 0) - (a.timestamp || 0)
    );

    for (const t of txAll) {
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
    <div className="space-y-8 animate-fadeIn">
      {/* Header with premium styling */}
      <div className="relative">
        <div className="absolute -top-4 -left-4 w-32 h-32 bg-indigo-200/30 rounded-full blur-3xl" />
        <div className="absolute -top-4 -right-4 w-32 h-32 bg-violet-200/30 rounded-full blur-3xl" />
        <div className="relative">
          <h1 className="text-3xl font-extrabold text-slate-800 mb-2">
            Ringkasan Penjualan
          </h1>
          <p className="text-base text-slate-600">
            Gambaran singkat tentang penjualan Shopee, laba, dan
            modal.
          </p>
        </div>
      </div>

      {/* Ringkasan hari ini */}
      <TodaySummaryRow />

      {/* Laba harian BluePack & CempakaPack */}
           {/* Laba harian Toko */}
      <div className="bg-gradient-to-br from-white to-indigo-50/30 rounded-3xl shadow-lg shadow-indigo-100/50 border border-indigo-100/50 p-7 hover:shadow-xl hover:shadow-indigo-200/50 transition-all duration-500">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              Laba Harian Toko
            </h2>
            <p className="text-sm text-slate-600">
              Laba bersih yang sudah dibagi 40% / 60% berdasarkan tanggal
              transaksi hari ini dan kemarin (per item).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <MiniStat
            label="Laba BluePack - Hari Ini"
            value={formatRupiah(bluePackToday)}
            helper="Akumulasi bagian BluePack dari transaksi hari ini"
            color="blue"
          />
          <MiniStat
            label="Laba BluePack - Kemarin"
            value={formatRupiah(bluePackYesterday)}
            helper="Akumulasi bagian BluePack dari transaksi kemarin"
            color="blue"
            subdued
          />
          <MiniStat
            label="Laba CempakaPack - Hari Ini"
            value={formatRupiah(cempakaToday)}
            helper="Akumulasi bagian CempakaPack dari transaksi hari ini"
            color="purple"
          />
          <MiniStat
            label="Laba CempakaPack - Kemarin"
            value={formatRupiah(cempakaYesterday)}
            helper="Akumulasi bagian CempakaPack dari transaksi kemarin"
            color="purple"
            subdued
          />
        </div>
      </div>

      {/* Status modal + analitik */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Status modal */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200/50 p-7 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-100/50 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />

          <div className="relative">
            <h2 className="text-lg font-bold text-slate-800 mb-1 flex items-center">
              Status Modal (All Time)
            </h2>
            <p className="text-xs text-slate-600 mb-4">
              Rule: laba periode hanya boleh dibagi jika modal sudah lunas.
            </p>

            <div
              className={`inline-flex items-center px-4 py-2 rounded-2xl text-xs font-bold mb-5 shadow-md ${
                modalSummary.isLunas
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
                  : "bg-gradient-to-r from-rose-500 to-pink-500 text-white"
              }`}
            >
              {modalSummary.isLunas
                ? "🟢 MODAL LUNAS — siap bagi laba periode"
                : "🔴 SALDO HUTANG MODAL — belum boleh bagi laba periode"}
            </div>

            <div className="space-y-3">
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
                highlight={!modalSummary.isLunas}
              />
            </div>

            <p className="mt-5 text-xs text-slate-500 bg-slate-50 rounded-xl p-3 border border-slate-100">
              💡 Detail lebih lengkap bisa dilihat di menu{" "}
              <span className="font-bold text-indigo-600">
                Manajemen Modal
              </span>
              .
            </p>
          </div>
        </div>

        {/* Produk terlaris & transaksi terbaru */}
        <div className="xl:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Produk terlaris */}
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200/50 p-7 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <h2 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
              Produk Terlaris
            </h2>
            <p className="text-xs text-slate-600 mb-4">
              Top 5 produk berdasarkan quantity terjual dari seluruh data
              transaksi (all time).
            </p>

            {topProducts.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📦</div>
                <p className="text-sm text-slate-500">
                  Belum ada data produk terlaris.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {topProducts.map((p, idx) => (
                  <div
                    key={p.code}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-indigo-50/30 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white font-bold text-sm shadow-md">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">
                          {p.name}
                        </div>
                        <div className="text-xs text-slate-500">{p.code}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-indigo-600 text-sm">
                        {formatNumber(p.quantity)}
                      </div>
                      <div className="text-xs text-slate-500">
                        {formatRupiah(p.revenue)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Transaksi terbaru */}
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200/50 p-7 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <h2 className="text-lg font-bold text-slate-800 mb-2">
              Transaksi Terbaru
            </h2>
            <p className="text-xs text-slate-600 mb-4">
              5 transaksi item terakhir yang kamu input (all time).
            </p>

            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-200 border-t-indigo-600" />
                <p className="text-sm text-slate-500 mt-3">Memuat data…</p>
              </div>
            ) : recentTransactions.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📝</div>
                <p className="text-sm text-slate-500">
                  Belum ada transaksi tercatat.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 hover:shadow-sm transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-semibold text-slate-800 text-sm">
                          {t.buyerUsername}
                        </div>
                        <div className="text-xs text-slate-500">
                          {formatDate(t.date)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-indigo-600 text-sm">
                          {formatRupiah(t.totalSellPrice)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">{t.productName}</span>
                      <span className="font-semibold text-slate-700">
                        {formatNumber(t.quantity)} pcs
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Premium MiniStat component
function MiniStat({ label, value, helper }) {
  return (
    <div className="bg-white rounded-2xl px-5 py-4 border border-slate-200">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
        {label}
      </p>
      <p className="text-2xl font-bold text-slate-900 mb-1">
        {value}
      </p>
      {helper && (
        <p className="text-xs text-slate-400">{helper}</p>
      )}
    </div>
  );
}

// Premium Row component
function Row({ label, value, highlight = false }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <span className={`text-sm font-medium ${highlight ? "text-rose-500" : "text-slate-900"}`}>
        {value}
      </span>
    </div>
  );
}
