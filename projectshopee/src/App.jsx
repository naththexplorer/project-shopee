// src/App.jsx
// Definisi routing utama: semua halaman dibungkus MainLayout, kecuali 404.

import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import TransactionsPage from "./pages/TransactionsPage.jsx";
import ModalPage from "./pages/ModalPage.jsx";
import ReportsPage from "./pages/ReportsPage.jsx";
import BluePackPage from "./pages/BluePackPage.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  return (
    <Routes>
      {/* Semua halaman utama pakai MainLayout (sidebar + topbar) */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/modal" element={<ModalPage />} />
        <Route path="/bluepack" element={<BluePackPage />} />
        <Route path="/reports" element={<ReportsPage />} />
      </Route>

      {/* Fallback 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
