// src/components/dashboard/TodaySummaryRow.jsx

import { useMemo } from "react";
import { useData } from "../../context/DataContext.jsx";
import { formatRupiah } from "../../utils/formatters.js";

export default function TodaySummaryRow() {
  const { transactions, summary, loading } = useData();

  const todayStats = useMemo(() => {
    const txAll = Array.isArray(transactions) ? transactions : [];
    const todayStr = new Date().toISOString().slice(0, 10);

    const todayTx = txAll.filter((t) => {
      const dateStr =
        t.date ||
        new Date(t.timestamp || Date.now()).toISOString().slice(0, 10);
      return dateStr === todayStr;
    });

    const totalToday = todayTx.reduce(
      (acc, t) => acc + (t.totalSellPrice || 0),
      0
    );

    const profitToday = todayTx.reduce(
      (acc, t) => acc + (t.profit || 0),
      0
    );

    return {
      totalToday,
      profitToday,
      countToday: todayTx.length,
    };
  }, [transactions]);

  if (loading) {
    return (
      <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-sm text-slate-500">
        Memuat ringkasan hari ini…
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Total penjualan hari ini */}
      <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all duration-300">
        <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
          Total Penjualan Hari Ini
        </p>
        <p className="text-2xl font-bold text-indigo-600">
          {formatRupiah(todayStats.totalToday)}
        </p>
        <p className="text-[11px] text-slate-500 mt-1">
          Omzet kotor dari semua transaksi yang bertanggal hari ini.
        </p>
      </div>

      {/* Laba hari ini */}
      <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all duration-300">
        <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
          Laba Bersih Hari Ini
        </p>
        <p className="text-2xl font-bold text-emerald-600">
          {formatRupiah(todayStats.profitToday)}
        </p>
        <p className="text-[11px] text-slate-500 mt-1">
          Sudah dikurangi modal & fee Shopee (sesuai input transaksi).
        </p>
      </div>

      {/* Laba all time */}
      <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all duration-300">
        <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
          Laba Bersih (All Time)
        </p>
        <p className="text-2xl font-bold text-slate-800">
          {formatRupiah(summary.totalProfit || 0)}
        </p>
        <p className="text-[11px] text-slate-500 mt-1">
          Akumulasi dari seluruh data transaksi yang sudah tercatat.
        </p>
      </div>
    </div>
  );
}
