// src/pages/NotFound.jsx
// Halaman 404 sederhana kalau user masuk ke route yang tidak dikenal.

import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-8 py-6 text-center space-y-3">
        <p className="text-4xl font-bold text-indigo-500">404</p>
        <p className="text-sm font-semibold">Halaman tidak ditemukan</p>
        <p className="text-xs text-slate-500">
          Sepertinya kamu nyasar. Kembali ke dashboard untuk melanjutkan
          monitoring penjualan.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center justify-center mt-2 px-4 py-2 rounded-full text-xs font-medium bg-indigo-500 text-white hover:bg-indigo-600"
        >
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}

