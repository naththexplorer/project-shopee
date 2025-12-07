// src/context/DataContext.jsx
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "../config/firebase.js";
import { createContext, useContext, useEffect, useState } from "react";

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export function DataProvider({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [bluePackWithdrawals, setBluePackWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================================
  // REAL-TIME LISTENER TRANSAKSI
  // Filter 90 hari terakhir untuk performa
  // =========================================
  useEffect(() => {
    const today = new Date();
    const ninetyDaysAgo = new Date(today);
    ninetyDaysAgo.setDate(today.getDate() - 90);
    const timestampFilter = ninetyDaysAgo.getTime();

    const q = query(
      collection(db, "transactions"),
      where("timestamp", ">=", timestampFilter),
      orderBy("timestamp", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setTransactions(arr);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // =========================================
  // REAL-TIME LISTENER WITHDRAWAL CEMPAKAPACK
  // Filter 90 hari terakhir
  // =========================================
  useEffect(() => {
    const today = new Date();
    const ninetyDaysAgo = new Date(today);
    ninetyDaysAgo.setDate(today.getDate() - 90);
    const timestampFilter = ninetyDaysAgo.getTime();

    const q = query(
      collection(db, "withdrawals"),
      where("timestamp", ">=", timestampFilter),
      orderBy("timestamp", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setWithdrawals(arr);
    });
    return () => unsub();
  }, []);

  // =========================================
  // REAL-TIME LISTENER WITHDRAWAL BLUEPACK
  // Filter 90 hari terakhir
  // =========================================
  useEffect(() => {
    const today = new Date();
    const ninetyDaysAgo = new Date(today);
    ninetyDaysAgo.setDate(today.getDate() - 90);
    const timestampFilter = ninetyDaysAgo.getTime();

    const q = query(
      collection(db, "bluePackWithdrawals"),
      where("timestamp", ">=", timestampFilter),
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
      type: data.type || "modal",
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

  // CempakaPack withdrawals (pisah modal vs laba)
  const totalWithdrawModal = withdrawals
    .filter(w => w.type === "modal")
    .reduce((acc, w) => acc + (w.amount || 0), 0);

  const totalWithdrawLaba = withdrawals
    .filter(w => w.type === "laba")
    .reduce((acc, w) => acc + (w.amount || 0), 0);

  const sisaModal = totalCost - totalWithdrawModal;
  const sisaLabaCempaka = cempakaPack - totalWithdrawLaba;

  // BluePack withdrawals
  const totalBluePackWithdraw = bluePackWithdrawals.reduce(
    (acc, w) => acc + (w.amount || 0),
    0
  );

  const sisaBluePack = bluePack - totalBluePackWithdraw;

  const summary = {
    totalSell,
    totalFee,
    totalNet,
    totalCost,
    totalProfit,
    bluePack,
    cempakaPack,
    totalWithdrawModal,
    totalWithdrawLaba,
    sisaModal,
    sisaLabaCempaka,
    totalBluePackWithdraw,
    sisaBluePack,
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
