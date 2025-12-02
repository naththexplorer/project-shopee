// src/utils/constants.js
// Katalog produk + konstanta bisnis (fee, pembagian laba) untuk seluruh app.

export const SHOPEE_FEE_PERCENT = 0.17; // 17% rata-rata
export const BLUEPACK_SHARE = 0.4;
export const CEMPAKAPACK_SHARE = 0.6;

// List produk utama sesuai spesifikasi dokumen.
export const productList = [
  {
    code: "Rp. 145",
    name: "Pot 10cc",
    type: "satuan",
    sellPrice: 280,
    costPrice: 145,
  },
  {
    code: "Rp. 160",
    name: "Pot 15cc",
    type: "satuan",
    sellPrice: 295,
    costPrice: 160,
  },
  {
    code: "Rp. 160",
    name: "Pot 20cc",
    type: "satuan",
    sellPrice: 299,
    costPrice: 160,
  },
  {
    code: "Rp. 325",
    name: "Pot 30cc",
    type: "satuan",
    sellPrice: 750,
    costPrice: 325,
  },
  {
    code: "Rp. 610",
    name: "Pot 50cc",
    type: "satuan",
    sellPrice: 1010,
    costPrice: 610,
  },
  {
    code: "Rp. 570",
    name: "Pot Cream 50g",
    type: "satuan",
    sellPrice: 1100,
    costPrice: 570,
  },

  // Paket 500 pcs
  {
    code: "Rp. 80,000",
    name: "Paket Pot 20cc (500 pcs)",
    type: "paket",
    sellPrice: 135000, // per paket
    costPrice: 80000, // per paket (160 x 500)
    packageSize: 500,
  },
  {
    code: "Rp. 72,500",
    name: "Paket Pot 10cc (500 pcs)",
    type: "paket",
    sellPrice: 130000,
    costPrice: 72500, // 145 x 500
    packageSize: 500,
  },
  {
    code: "Rp. 12.000",
    name: "Paket Hidroponik 100 pcs",
    type: "satuan",
    sellPrice: 24800,
    costPrice: 12000,
  },
  {
    code: "Rp. 57,000",
    name: "Paket Pot 50gr Cream",
    type: "paket",
    sellPrice: 96000,
    costPrice: 57000,
  },
  {
    code: "Rp. 42,000",
    name: "Paket Botol Tetes (100pcs)",
    type: "paket",
    sellPrice: 68000,
    costPrice: 42000,
  },
];

// Alias supaya bisa diimport sebagai PRODUCTS
export const PRODUCTS = productList;

// Lookup cepat berdasarkan kode produk.
export const productMap = productList.reduce((acc, p) => {
  acc[p.code] = p;
  return acc;
}, {});
