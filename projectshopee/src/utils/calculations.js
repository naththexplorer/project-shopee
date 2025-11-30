// src/utils/calculations.js
// Semua rumus untuk transaksi Shopee (fee, cost, profit).
import {
  SHOPEE_FEE_PERCENT,
  BLUEPACK_SHARE,
  CEMPAKAPACK_SHARE,
} from "./constants.js";

/**
 * Hitung biaya potongan Shopee.
 * @param {number} totalSellPrice
 */
export function calculateShopeeFee(totalSellPrice) {
  return Math.round(totalSellPrice * SHOPEE_FEE_PERCENT);
}

/**
 * Hitung semua nilai transaksi untuk 1 item.
 *
 * @param {object} param0
 * product = { sellPrice, costPrice, type, packageSize }
 * quantity = jumlah unit yang dibeli
 */
export function calculateItemValues({ product, quantity }) {
  if (!product || !quantity || quantity <= 0) {
    return {
      quantity: 0,
      totalSellPrice: 0,
      shopeeDiscount: 0,
      netIncome: 0,
      totalCost: 0,
      profit: 0,
      bluePack: 0,
      cempakaPack: 0,
      actualQuantity: 0,
      sellPrice: 0,
    };
  }

  // ====== HITUNG DETAIL PRODUK ======

  const {
    sellPrice,
    costPrice,
    type,
    packageSize = 1, // default jika bukan paket
  } = product;

  // Paket → actualQuantity = quantity * packageSize
  const actualQuantity = type === "paket" ? quantity * packageSize : quantity;

  // Harga total jual
  const totalSellPrice = sellPrice * quantity;

  // Potongan Shopee
  const shopeeDiscount = calculateShopeeFee(totalSellPrice);

  // Pendapatan bersih
  const netIncome = totalSellPrice - shopeeDiscount;

  // Modal total: dihitung berdasarkan jumlah unit fisik yg keluar
  const totalCost = costPrice * quantity;

  // Laba
  const profit = netIncome - totalCost;

  // Pembagian laba
  const bluePack = profit * BLUEPACK_SHARE;
  const cempakaPack = profit * CEMPAKAPACK_SHARE;

  return {
    quantity,
    actualQuantity,
    sellPrice,
    shopeeFeePercent: SHOPEE_FEE_PERCENT,
    totalSellPrice,
    shopeeDiscount,
    netIncome,
    costPrice,
    totalCost,
    profit,
    bluePack,
    cempakaPack,
    productType: type,
  };
}
