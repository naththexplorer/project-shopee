import { Search } from "lucide-react";

const TITLE_MAP = {
  "/dashboard": "Dashboard",
  "/transactions": "Transaksi",
  "/modal": "Manajemen Modal",
  "/reports": "Laporan & Analisis",
};

export default function Topbar({ currentPath }) {
  const title = TITLE_MAP[currentPath] || "Panel";

  return (
    <header className="h-20 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl flex items-center justify-between px-6 md:px-8 sticky top-0 z-40 shadow-sm">
      {/* Title with gradient */}
      <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
        {title}
      </h1>

      <div className="flex items-center gap-4">
        {/* Search with glass effect */}
        <div className="hidden sm:flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-100/80 backdrop-blur-sm border border-slate-200/50 hover:border-indigo-300 hover:bg-white/90 focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-100 transition-all duration-300 shadow-sm hover:shadow-md">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari transaksi / buyer / produk..."
            className="bg-transparent text-sm outline-none w-40 md:w-72 text-slate-700 placeholder:text-slate-400"
          />
        </div>

        {/* Mini profile with premium styling */}
        <div className="flex items-center gap-3 px-3 py-2 rounded-2xl bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 hover:border-indigo-300 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group">
          <div className="flex items-center gap-2">
            <img
              src="/bluepacklogo.jpg"
              alt="Logo BluePack"
              className="h-8 w-8 rounded-full object-cover border-2 border-white shadow-sm"
            />
            <div>
              <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                Admin
              </p>
              <p className="text-xs text-slate-500">BluePack</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
