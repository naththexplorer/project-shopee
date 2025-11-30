// src/context/DataContext.jsx
// Versi lokal: simpan transaksi & withdraw di state React dulu (tanpa Firebase).

import {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";
import { summarizeModal, calculateTransaction } from "../utils/calculations.js";
import { productMap } from "../utils/constants.js";

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading] = useState(false);

  // Tambah transaksi ke state lokal
  function addTransactionLocal(data) {
    const { buyerUsername, productCode, quantity, date, notes } = data;
    const trimmedBuyer = buyerUsername?.trim();
    const qty = Number(quantity);

    if (!trimmedBuyer || !productCode || !qty || !date) {
      throw new Error("Field wajib belum lengkap.");
    }

    const product = productMap[productCode];
    if (!product) throw new Error("Produk tidak ditemukan.");

    const calc = calculateTransaction(product, qty);
    if (!calc) throw new Error("Data transaksi tidak valid.");

    const now = Date.now();
    const id = `LOCAL_${now}_${Math.random().toString(36).slice(2, 7)}`;

    const docData = {
      id,
      buyerUsername: trimmedBuyer.toLowerCase(),
      date,
      timestamp: now,
      ...calc,
      notes: notes || "",
      createdAt: now,
      updatedAt: now,
    };

    setTransactions((prev) => [docData, ...prev]);
  }

  // Tambah withdraw ke state lokal
  function addWithdrawalLocal(data) {
    const { amount, date, notes } = data;
    const nominal = Number(amount);
    if (!nominal || nominal <= 0 || !date) {
      throw new Error("Tanggal & nominal withdraw harus diisi.");
    }

    const now = Date.now();
    const id = `WD_${now}_${Math.random().toString(36).slice(2, 7)}`;

    const docData = {
      id,
      date,
      timestamp: now,
      amount: nominal,
      notes: notes || "",
      createdAt: now,
      updatedAt: now,
    };

    setWithdrawals((prev) => [docData, ...prev]);
  }

  const modalSummary = useMemo(
    () => summarizeModal(transactions, withdrawals),
    [transactions, withdrawals]
  );

  const value = {
    loading,
    transactions,
    withdrawals,
    modalSummary,
    addTransaction: addTransactionLocal,
    addWithdrawal: addWithdrawalLocal,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error("useData harus dipakai di dalam <DataProvider>.");
  }
  return ctx;
}
