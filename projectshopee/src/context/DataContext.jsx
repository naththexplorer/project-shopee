// src/context/DataContext.jsx
// Provider global untuk transaksi, withdraw CempakaPack, withdraw BluePack, summary, dan sync dengan Firestore.

import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";

import { db } from "../config/firebase";
import { createContext, useContext, useEffect, useState } from "react";

const DataContext = createContext();
export const useData = () => useContext(DataContext);

export function DataProvider({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]); // CempakaPack
  const [bluepackWithdrawals, setBluepackWithdrawals] = useState([]); // BluePack
  const [loading, setLoading] = useState(true);

  // =========================================
  // REAL-TIME LISTENER TRANSAKSI
  // =========================================
  useEffect(() => {
    const q = query(collection(db, "transactions"), orderBy("timestamp", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setTransactions(arr);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // =========================================
  // REAL-TIME LISTENER WITHDRAWAL CEMPAKAPACK
  // =========================================
  useEffect(() => {
    const q = query(collection(db, "withdrawals"), orderBy("timestamp", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setWithdrawals(arr);
    });

    return () => unsub();
  }, []);

  // =========================================
  // REAL-TIME LISTENER WITHDRAWAL BLUEPACK
  // =========================================
  useEffect(() => {
    const q = query(
      collection(db, "bluepack_withdrawals"),
      orderBy("timestamp", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setBluepackWithdrawals(arr);
    });

    return () => unsub();
  }, []);

  // =========================================
  // ADD TRANSACTION
  // =========================================
  async function addTransaction(data) {
    await addDoc(collection(db, "transactions"), {
      ...data,
      timestamp: data.timestamp || Date.now(),
    });
  }

  // =========================================
  // DELETE TRANSACTION
  // =========================================
  async function deleteTransaction(id) {
    await deleteDoc(doc(db, "transactions", id));
  }

  // =========================================
  // ADD WITHDRAWAL CEMPAKAPACK
  // =========================================
  async function addWithdrawal(data) {
    await addDoc(collection(db, "withdrawals"), {
      ...data,
      timestamp: Date.now(),
    });
  }

  // =========================================
  // DELETE WITHDRAWAL CEMPAKAPACK
  // =========================================
  async function deleteWithdrawal(id) {
    await deleteDoc(doc(db, "withdrawals", id));
  }

  // =========================================
  // ADD WITHDRAWAL BLUEPACK
  // =========================================
  async function addBluepackWithdrawal(data) {
    await addDoc(collection(db, "bluepack_withdrawals"), {
      ...data,
      timestamp: Date.now(),
    });
  }

  // =========================================
  // DELETE WITHDRAWAL BLUEPACK
  // =========================================
  async function deleteBluepackWithdrawal(id) {
    await deleteDoc(doc(db, "bluepack_withdrawals", id));
  }

  // =========================================
  // SUMMARY TERHITUNG OTOMATIS
  // =========================================
  const totalSell = transactions.reduce(
    (acc, t) => acc + (t.totalSellPrice || 0),
    0
  );
  const totalFee = transactions.reduce(
    (acc, t) => acc + (t.shopeeDiscount || 0),
    0
  );
  const totalNet = transactions.reduce(
    (acc, t) => acc + (t.netIncome || 0),
    0
  );
  const totalCost = transactions.reduce(
    (acc, t) => acc + (t.totalCost || 0),
    0
  );
  const totalProfit = transactions.reduce(
    (acc, t) => acc + (t.profit || 0),
    0
  );
  const bluePack = transactions.reduce(
    (acc, t) => acc + (t.bluePack || 0),
    0
  );
  const cempakaPack = transactions.reduce(
    (acc, t) => acc + (t.cempakaPack || 0),
    0
  );

  const totalWithdraw = withdrawals.reduce(
    (acc, w) => acc + (w.amount || 0),
    0
  );

  const totalBluepackWithdraw = bluepackWithdrawals.reduce(
    (acc, w) => acc + (w.amount || 0),
    0
  );

  const saldoBluepack = bluePack - totalBluepackWithdraw;

  const summary = {
    totalSell,
    totalFee,
    totalNet,
    totalCost,
    totalProfit,
    bluePack,
    cempakaPack,

    totalWithdraw, // CempakaPack
    totalBluepackWithdraw,
    saldoBluepack,
  };

  return (
    <DataContext.Provider
      value={{
        transactions,
        withdrawals,
        bluepackWithdrawals,
        summary,
        loading,

        addTransaction,
        deleteTransaction,

        addWithdrawal,
        deleteWithdrawal,

        addBluepackWithdrawal,
        deleteBluepackWithdrawal,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}
  