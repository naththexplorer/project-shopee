// src/utils/formatters.js
// Utility kecil untuk formatting angka & tanggal supaya konsisten di seluruh app.

export function formatRupiah(value) {
  if (value == null || Number.isNaN(value)) return "-";
  return value.toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  });
}

export function formatNumber(value) {
  if (value == null || Number.isNaN(value)) return "-";
  return value.toLocaleString("id-ID");
}

export function formatDate(dateStr) {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

// dipakai di DashboardPage untuk normalisasi ke YYYY-MM-DD
export function formatDateISO(dateStr) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return d.toISOString().slice(0, 10); // YYYY-MM-DD
  } catch {
    return dateStr;
  }
}
