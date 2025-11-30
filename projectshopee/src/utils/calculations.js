// src/utils/calculations.js
// Single source of truth untuk semua rumus keuangan transaksi & modal.

import {
  SHOPEE_FEE_PERCENT,
  BLUEPACK_SHARE,
  CEMPAKAPACK_SHARE,
} from "./constants.js";

// Hitung hasil lengkap satu transaksi berdasarkan definisi di dokumen.
export function calculateTransaction(product, quantity) {
  const q = Number(quantity);
  if (!product || !q || q <= 0) return null;

  // Untuk paket, quantity = jumlah paket; actualQuantity dipakai untuk analitik.
  const actualQuantity =
    product.type === "paket" && product.packageSize
      ? q * product.packageSize
      : q;

  const totalSellPrice = product.sellPrice * q;
  const shopeeDiscount = totalSellPrice * SHOPEE_FEE_PERCENT;
  const netIncome = totalSellPrice - shopeeDiscount;
  const totalCost = product.costPrice * q;
  const profit = netIncome - totalCost;

  const bluePack = profit * BLUEPACK_SHARE;
  const cempakaPack = profit * CEMPAKAPACK_SHARE;

  return {
    productCode: product.code,
    productName: product.name,
    productType: product.type,
    quantity: q,
    actualQuantity,
    sellPrice: product.sellPrice,
    totalSellPrice,
    shopeeFeePercent: SHOPEE_FEE_PERCENT,
    shopeeDiscount,
    netIncome,
    costPrice: product.costPrice,
    totalCost,
    profit,
    bluePack,
    cempakaPack,
  };
}

// Hitung ringkasan modal berdasarkan semua transaksi & withdraw.
export function summarizeModal(transactions = [], withdrawals = []) {
  const totalModalKeluar = transactions.reduce(
    (sum, t) => sum + (t.totalCost || 0),
    0
  );
  const totalWithdrawAyah = withdrawals.reduce(
    (sum, w) => sum + (w.amount || 0),
    0
  );
  const saldoHutangModal = totalModalKeluar - totalWithdrawAyah;

  return {
    totalModalKeluar,
    totalWithdrawAyah,
    saldoHutangModal,
    status:
      saldoHutangModal > 0
        ? "BELUM LUNAS"
        : saldoHutangModal === 0
        ? "LUNAS"
        : "LEBIH BAYAR",
  };
}
