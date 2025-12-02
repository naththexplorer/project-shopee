// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import MainLayout from "./layouts/MainLayout.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import TransactionsPage from "./pages/TransactionsPage.jsx";
import ModalPage from "./pages/ModalPage.jsx";
import ReportsPage from "./pages/ReportsPage.jsx";
import BluePackPage from "./pages/BluePackPage.jsx";
import NotFound from "./pages/NotFound.jsx";
import ProtectedRoute from "./components/common/ProtectedRoute.jsx";

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Login Route */}
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LoginPage />
          )
        }
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="modal" element={<ModalPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="bluepack" element={<BluePackPage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
