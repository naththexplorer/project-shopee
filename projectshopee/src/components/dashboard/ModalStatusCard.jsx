// src/components/dashboard/ModalStatusCard.jsx
// Card status modal: total modal keluar, total withdraw, saldo hutang + label LUNAS/BELUM.

import SectionCard from "../common/SectionCard.jsx";
import { useData } from "../../context/DataContext.jsx";
import { formatRupiah } from "../../utils/formatters.js";

export default function ModalStatusCard() {
  const { modalSummary } = useData();
  const { totalModalKeluar, totalWithdrawAyah, saldoHutangModal, modalLunas } =
    modalSummary;

  return (
    <SectionCard
      title="Status Modal"
      subtitle="Total modal keluar vs withdraw ayah"
    >
      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Total Modal Keluar</span>
          <span className="font-medium">
            {formatRupiah(totalModalKeluar)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Total Withdraw Ayah</span>
          <span className="font-medium">
            {formatRupiah(totalWithdrawAyah)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Saldo Hutang Modal</span>
          <span
            className={`font-semibold ${
              modalLunas ? "text-emerald-500" : "text-rose-500"
            }`}
          >
            {formatRupiah(Math.max(saldoHutangModal, 0))}
          </span>
        </div>

        <div
          className={`mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs ${
            modalLunas
              ? "bg-emerald-50 text-emerald-600"
              : "bg-rose-50 text-rose-600"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              modalLunas ? "bg-emerald-500" : "bg-rose-500"
            }`}
          />
          {modalLunas
            ? "MODAL LUNAS — laba periode boleh dibagi"
            : "SALDO HUTANG MODAL — laba belum boleh diambil"}
        </div>
      </div>
    </SectionCard>
  );
}
