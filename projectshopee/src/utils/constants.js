// src/utils/constants.js
// Katalog produk + konstanta bisnis (fee, pembagian laba) untuk seluruh app.

export const SHOPEE_FEE_PERCENT = 0.17; // 17% rata-rata
export const BLUEPACK_SHARE = 0.4;
export const CEMPAKAPACK_SHARE = 0.6;

// List produk utama sesuai spesifikasi dokumen.
export const productList = [
  {
    code: "POT-10",
    name: "Pot 10cc",
    type: "satuan",
    sellPrice: 280,
    costPrice: 145,
  },
  {
    code: "POT-15",
    name: "Pot 15cc",
    type: "satuan",
    sellPrice: 295,
    costPrice: 160,
  },
  {
    code: "POT-20",
    name: "Pot 20cc",
    type: "satuan",
    sellPrice: 299,
    costPrice: 160,
  },
  {
    code: "POT-30",
    name: "Pot 30cc",
    type: "satuan",
    sellPrice: 750,
    costPrice: 325,
  },
  {
    code: "POT-50",
    name: "Pot 50cc",
    type: "satuan",
    sellPrice: 1010,
    costPrice: 610,
  },
  {
    code: "POT-KRIM",
    name: "Pot Krim 50g",
    type: "satuan",
    sellPrice: 1100,
    costPrice: 560,
  },
  {
    code: "HIDRO-100",
    name: "Hidroponik 100 pcs",
    type: "satuan",
    sellPrice: 24800,
    costPrice: 12000,
  },
  // Paket 500 pcs
  {
    code: "PAKET-20",
    name: "Paket Pot 20cc (500 pcs)",
    type: "paket",
    sellPrice: 135000, // per paket
    costPrice: 80000, // per paket (160 x 500)
    packageSize: 500,
  },
  {
    code: "PAKET-10",
    name: "Paket Pot 10cc (500 pcs)",
    type: "paket",
    sellPrice: 130000,
    costPrice: 72500, // 145 x 500
    packageSize: 500,
  },
];

// Alias supaya bisa diimport sebagai PRODUCTS
export const PRODUCTS = productList;

// Lookup cepat berdasarkan kode produk.
export const productMap = productList.reduce((acc, p) => {
  acc[p.code] = p;
  return acc;
}, {});
