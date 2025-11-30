// src/components/dashboard/TopProductsTable.jsx
// Tabel produk terlaris berdasarkan quantity; sementara dihitung simpel dari transactions.

import SectionCard from "../common/SectionCard.jsx";
import { useData } from "../../context/DataContext.jsx";

export default function TopProductsTable() {
  const { transactions } = useData();

  // Agregasi sederhana: sum quantity per productName
  const productMap = new Map();
  for (const t of transactions) {
    const key = t.productName || t.productCode;
    const qty = t.actualQuantity || t.quantity || 0;
    const prev = productMap.get(key) || 0;
    productMap.set(key, prev + qty);
  }

  const list = Array.from(productMap.entries())
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  return (
    <SectionCard
      title="Produk Terlaris"
      subtitle="Top 5 berdasarkan quantity"
    >
      <div className="mt-2 space-y-2 text-xs">
        {list.length === 0 && (
          <p className="text-slate-400 text-center py-4">
            Belum ada data transaksi.
          </p>
        )}
        {list.map((p, i) => (
          <div key={p.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 w-4">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="font-medium text-slate-700">
                {p.name}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-16 text-right text-slate-500">
                {p.qty} pcs
              </span>
              <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-gradient-to-r from-indigo-500 to-violet-500" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
