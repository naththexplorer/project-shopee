// src/components/dashboard/TodaySummaryRow.jsx
import { formatRupiah } from "../../utils/formatters.js";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function TodaySummaryRow({
  bluePackToday,
  bluePackYesterday,
  cempakaToday,
  cempakaYesterday,
  canWithdraw = true,
}) {
  const blueChange = bluePackToday - bluePackYesterday;
  const cempakaChange = cempakaToday - cempakaYesterday;

  const bluePercent = bluePackYesterday > 0
    ? ((blueChange / bluePackYesterday) * 100).toFixed(1)
    : 0;
  const cempakaPercent = cempakaYesterday > 0
    ? ((cempakaChange / cempakaYesterday) * 100).toFixed(1)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* BluePack Card */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-card">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-blue-700 mb-1">BluePack (40%)</p>
            <p className="text-3xl font-bold text-blue-900 tabular-nums">
              {formatRupiah(bluePackToday)}
            </p>
          </div>
          {blueChange !== 0 && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold
              ${blueChange > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
              {blueChange > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(bluePercent)}%
            </div>
          )}
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-blue-700">
            <span>Today</span>
            <span className="font-semibold tabular-nums">{formatRupiah(bluePackToday)}</span>
          </div>
          <div className="flex justify-between text-blue-600">
            <span>Yesterday</span>
            <span className="font-semibold tabular-nums">{formatRupiah(bluePackYesterday)}</span>
          </div>
        </div>

        {!canWithdraw && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-800">Withdrawal locked until capital is fully paid</p>
          </div>
        )}
      </div>

      {/* CempakaPack Card */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6 shadow-card">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-purple-700 mb-1">CempakaPack (60%)</p>
            <p className="text-3xl font-bold text-purple-900 tabular-nums">
              {formatRupiah(cempakaToday)}
            </p>
          </div>
          {cempakaChange !== 0 && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold
              ${cempakaChange > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
              {cempakaChange > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(cempakaPercent)}%
            </div>
          )}
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-purple-700">
            <span>Today</span>
            <span className="font-semibold tabular-nums">{formatRupiah(cempakaToday)}</span>
          </div>
          <div className="flex justify-between text-purple-600">
            <span>Yesterday</span>
            <span className="font-semibold tabular-nums">{formatRupiah(cempakaYesterday)}</span>
          </div>
        </div>

        {!canWithdraw && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-800">Withdrawal locked until capital is fully paid</p>
          </div>
        )}
      </div>
    </div>
  );
}
