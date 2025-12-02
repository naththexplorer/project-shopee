// src/components/dashboard/TopProductsTable.jsx
import { formatRupiah, formatNumber } from "../../utils/formatters.js";
import { Package } from "lucide-react";

export default function TopProductsTable({ products = [] }) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-sm text-slate-500">Belum ada data produk terlaris</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Peringkat
            </th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Produk
            </th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Qty Terjual
            </th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Total Penjualan
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {products.map((product, index) => (
            <tr key={product.code} className="hover:bg-slate-50 transition-colors">
              <td className="py-3 px-4">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">
                  {index + 1}
                </span>
              </td>
              <td className="py-3 px-4">
                <div>
                  <p className="font-medium text-slate-900">{product.name}</p>
                  <p className="text-xs text-slate-500">{product.code}</p>
                </div>
              </td>
              <td className="py-3 px-4 text-right tabular-nums font-semibold text-slate-900">
                {formatNumber(product.quantity)}
              </td>
              <td className="py-3 px-4 text-right tabular-nums font-semibold text-slate-900">
                {formatRupiah(product.revenue)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
