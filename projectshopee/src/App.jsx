// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import TransactionsPage from "./pages/TransactionsPage.jsx";
import ModalPage from "./pages/ModalPage.jsx"; // ← Tetap pakai nama ini
import ReportsPage from "./pages/ReportsPage.jsx";
import BluePackPage from "./pages/BluePackPage.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/cempaka" element={<ModalPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/bluepack" element={<BluePackPage />} />
        <Route path="/modal" element={<Navigate to="/cempaka" replace />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
