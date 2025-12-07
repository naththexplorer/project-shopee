// src/pages/LoginPage.jsx
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Package, Briefcase } from "lucide-react";
import { useState } from "react";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = (role) => {
    setIsLoggingIn(true);

    // Fade out animation
    document.body.style.opacity = "0";
    document.body.style.transition = "opacity 150ms ease-out";

    setTimeout(() => {
      login(role);

      // Redirect berdasarkan role
      if (role === "cempakapack") {
        navigate("/transactions");
      } else {
        navigate("/dashboard");
      }

      document.body.style.opacity = "1";
    }, 150);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            Shopee Dashboard
          </h1>
          <p className="text-gray-600">Pilih mode akses Anda</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <button
            onClick={() => handleLogin("bluepack")}
            disabled={isLoggingIn}
            className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border-2 border-transparent hover:border-blue-500 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-500 transition-all duration-300">
                <Briefcase className="w-10 h-10 text-blue-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Bluepack</h2>
              <p className="text-gray-600 text-sm">
                Akses penuh ke semua fitur dashboard, laporan, dan manajemen
              </p>
              <div className="pt-4">
                <span className="inline-block bg-blue-500 text-white px-6 py-2 rounded-lg font-medium group-hover:bg-blue-600 transition-colors duration-300">
                  {isLoggingIn ? "Loading..." : "Masuk sebagai Bluepack"}
                </span>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleLogin("cempakapack")}
            disabled={isLoggingIn}
            className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border-2 border-transparent hover:border-purple-500 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-500 transition-all duration-300">
                <Package className="w-10 h-10 text-purple-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Cempakapack</h2>
              <p className="text-gray-600 text-sm">
                Mode simple untuk input transaksi dan laporan harian
              </p>
              <div className="pt-4">
                <span className="inline-block bg-purple-500 text-white px-6 py-2 rounded-lg font-medium group-hover:bg-purple-600 transition-colors duration-300">
                  {isLoggingIn ? "Loading..." : "Masuk sebagai Cempakapack"}
                </span>
              </div>
            </div>
          </button>
        </div>

        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Pilih mode yang sesuai dengan kebutuhan Anda</p>
        </div>
      </div>
    </div>
  );
}
