// src/components/dashboard/ModalStatusCard.jsx
import { formatRupiah } from "../../utils/formatters.js";
import { CheckCircle, AlertCircle } from "lucide-react";

export default function ModalStatusCard({ modalSummary }) {
  const { totalModalKeluar, totalWithdrawAyah, saldoHutangModal, isLunas } = modalSummary;

  return (
    <div className={`rounded-xl border p-6 shadow-card ${
      isLunas
        ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200'
        : 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200'
    }`}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-lg ${isLunas ? 'bg-emerald-100' : 'bg-amber-100'}`}>
          {isLunas ? (
            <CheckCircle className="w-6 h-6 text-emerald-600" />
          ) : (
            <AlertCircle className="w-6 h-6 text-amber-600" />
          )}
        </div>

        <div className="flex-1">
          <h3 className={`text-lg font-semibold mb-1 ${
            isLunas ? 'text-emerald-900' : 'text-amber-900'
          }`}>
            {isLunas ? 'Capital Fully Paid' : 'Outstanding Capital'}
          </h3>
          <p className={`text-sm mb-4 ${isLunas ? 'text-emerald-700' : 'text-amber-700'}`}>
            {isLunas
              ? 'All capital has been returned. Profit can be withdrawn.'
              : 'Capital must be fully paid before withdrawing profit.'}
          </p>

          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-sm text-slate-600">Total Capital Used</span>
              <span className="font-semibold text-slate-900 tabular-nums">
                {formatRupiah(totalModalKeluar)}
              </span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-sm text-slate-600">Total Returned</span>
              <span className="font-semibold text-slate-900 tabular-nums">
                {formatRupiah(totalWithdrawAyah)}
              </span>
            </div>

            <div className="flex justify-between items-center pt-1">
              <span className="text-sm font-semibold text-slate-700">Outstanding Balance</span>
              <span className={`text-lg font-bold tabular-nums ${
                isLunas ? 'text-emerald-600' : 'text-amber-600'
              }`}>
                {formatRupiah(Math.max(0, saldoHutangModal))}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
