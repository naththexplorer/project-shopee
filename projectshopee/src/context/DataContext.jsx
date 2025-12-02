// src/context/DataContext.jsx
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../config/firebase.js";
import { createContext, useContext, useEffect, useState } from "react";

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export function DataProvider({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]); // CempakaPack
  const [bluePackWithdrawals, setBluePackWithdrawals] = useState([]); // BluePack
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
      collection(db, "bluePackWithdrawals"),
      orderBy("timestamp", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setBluePackWithdrawals(arr);
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
      timestamp: data.timestamp || Date.now(),
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
  async function addBluePackWithdrawal(data) {
    await addDoc(collection(db, "bluePackWithdrawals"), {
      ...data,
      timestamp: data.timestamp || Date.now(),
    });
  }

  // =========================================
  // DELETE WITHDRAWAL BLUEPACK
  // =========================================
  async function deleteBluePackWithdrawal(id) {
    await deleteDoc(doc(db, "bluePackWithdrawals", id));
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

  const totalBluePackWithdraw = bluePackWithdrawals.reduce(
    (acc, w) => acc + (w.amount || 0),
    0
  );

  const saldoBluepack = bluePack - totalBluePackWithdraw;

  const summary = {
    totalSell,
    totalFee,
    totalNet,
    totalCost,
    totalProfit,
    bluePack,
    cempakaPack,
    totalWithdraw, // CempakaPack
    totalBluePackWithdraw,
    saldoBluepack,
  };

  return (
    <DataContext.Provider
      value={{
        // Data states
        transactions,
        withdrawals,
        bluePackWithdrawals,
        loading,
        summary,

        // Transaction functions
        addTransaction,
        deleteTransaction,

        // CempakaPack withdrawal functions
        addWithdrawal,
        deleteWithdrawal,

        // BluePack withdrawal functions
        addBluePackWithdrawal,
        deleteBluePackWithdrawal,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}
