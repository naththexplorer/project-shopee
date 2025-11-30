// src/context/DataContext.jsx
// Provider global untuk transaksi, withdraw, summary, dan sync dengan Firestore.

import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query
} from "firebase/firestore";

import { db } from "../config/firebase";
import { createContext, useContext, useEffect, useState } from "react";

const DataContext = createContext();
export const useData = () => useContext(DataContext);

export function DataProvider({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  // ===============================
  // LOAD REAL-TIME DATA
  // ===============================

  useEffect(() => {
    const q = query(collection(db, "transactions"), orderBy("timestamp", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setTransactions(arr);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "withdrawals"), orderBy("timestamp", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setWithdrawals(arr);
    });

    return () => unsub();
  }, []);

  // ===============================
  // ADD TRANSACTION
  // ===============================

  async function addTransaction(data) {
    await addDoc(collection(db, "transactions"), {
      ...data,
      timestamp: data.timestamp || Date.now(),
    });
  }

  // ===============================
  // DELETE TRANSACTION
  // ===============================

  async function deleteTransaction(id) {
    await deleteDoc(doc(db, "transactions", id));
  }

  // ===============================
  // ADD WITHDRAWAL
  // ===============================

  async function addWithdrawal(data) {
    await addDoc(collection(db, "withdrawals"), {
      ...data,
      timestamp: Date.now(),
    });
  }

  // ===============================
  // DELETE WITHDRAWAL
  // ===============================

  async function deleteWithdrawal(id) {
    await deleteDoc(doc(db, "withdrawals", id));
  }

  // ===============================
  // SUMMARY (computed dari state)
  // ===============================

  const summary = {
    totalSell: transactions.reduce((acc, t) => acc + (t.totalSellPrice || 0), 0),
    totalFee: transactions.reduce((acc, t) => acc + (t.shopeeDiscount || 0), 0),
    totalNet: transactions.reduce((acc, t) => acc + (t.netIncome || 0), 0),
    totalCost: transactions.reduce((acc, t) => acc + (t.totalCost || 0), 0),
    totalProfit: transactions.reduce((acc, t) => acc + (t.profit || 0), 0),
    bluePack: transactions.reduce((acc, t) => acc + (t.bluePack || 0), 0),
    cempakaPack: transactions.reduce((acc, t) => acc + (t.cempakaPack || 0), 0),

    totalWithdraw: withdrawals.reduce((acc, w) => acc + (w.amount || 0), 0),
  };

  return (
    <DataContext.Provider
      value={{
        transactions,
        withdrawals,
        summary,
        loading,

        addTransaction,
        deleteTransaction,
        addWithdrawal,
        deleteWithdrawal,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}
