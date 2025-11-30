// src/components/dashboard/TodaySummaryRow.jsx
// Row kartu ringkasan di Dashboard (penjualan hari ini, transaksi hari ini,
// laba BluePack & CempakaPack bulan berjalan).

import { useMemo } from "react";
import { useData } from "../../context/DataContext.jsx";
import { formatRupiah, formatNumber } from "../../utils/formatters.js";

export default function TodaySummaryRow() {
  const { transactions, loading } = useData();

  // Hitung metrik berbasis transaksi
  const stats = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return {
        totalSalesToday: 0,
        totalTransactionsToday: 0,
        bluePackProfitThisMonth: 0,
        cempakaPackProfitThisMonth: 0,
      };
    }

    const now = new Date();
    const todayISO = now.toISOString().slice(0, 10); // YYYY-MM-DD
    const year = now.getFullYear();
    const month = now.getMonth();

    let totalSalesToday = 0;
    let totalTransactionsToday = 0;
    let bluePackProfitThisMonth = 0;
    let cempakaPackProfitThisMonth = 0;

    for (const t of transactions) {
      // tanggal disimpan sebagai string "YYYY-MM-DD" dari input <input type="date">
      if (t.date === todayISO) {
        totalSalesToday += t.totalSellPrice || 0;
        totalTransactionsToday += 1;
      }

      // transaksi bulan berjalan (untuk laba Blue/Cempaka)
      try {
        const d = new Date(t.date);
        if (d.getFullYear() === year && d.getMonth() === month) {
          bluePackProfitThisMonth += t.bluePack || 0;
          cempakaPackProfitThisMonth += t.cempakaPack || 0;
        }
      } catch {
        // kalau parsing gagal, abaikan saja
      }
    }

    return {
      totalSalesToday,
      totalTransactionsToday,
      bluePackProfitThisMonth,
      cempakaPackProfitThisMonth,
    };
  }, [transactions]);

  const {
    totalSalesToday,
    totalTransactionsToday,
    bluePackProfitThisMonth,
    cempakaPackProfitThisMonth,
  } = stats;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <StatCard
        label="Total Penjualan Hari Ini"
        value={formatRupiah(totalSalesToday)}
        subtitle={loading ? "Memuat…" : "Dihitung dari transaksi hari ini"}
      />
      <StatCard
        label="Total Transaksi Hari Ini"
        value={formatNumber(totalTransactionsToday)}
        subtitle={loading ? "Memuat…" : "Jumlah order yang masuk hari ini"}
      />
      <StatCard
        label="Laba BluePack (40%) - Bulan Ini"
        value={formatRupiah(bluePackProfitThisMonth)}
        subtitle="Akumulasi laba bagian BluePack bulan berjalan"
      />
      <StatCard
        label="Laba CempakaPack (60%) - Bulan Ini"
        value={formatRupiah(cempakaPackProfitThisMonth)}
        subtitle="Akumulasi laba bagian CempakaPack bulan berjalan"
      />
    </div>
  );
}

// Versi minimal kartu statistik, biar nggak tergantung komponen lain dulu.
function StatCard({ label, value, subtitle }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-3">
      <p className="text-[11px] font-medium tracking-wide text-slate-500 uppercase">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold text-slate-900">{value}</p>
      {subtitle && (
        <p className="mt-1 text-[11px] text-slate-400">{subtitle}</p>
      )}
    </div>
  );
}
