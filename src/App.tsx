// App.tsx
import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Header from "./pages/components/Header";
import HomePage from "./pages/HomePage";
import MenuPage from "./pages/components/MenuPage";
import ContactPage from "./pages/components/ContactPage";
import BookingPage from "./pages/components/BookingPage";
import BookingSummary from "./pages/components/BookingSummary";
import LoginPage from "./pages/components/LoginPage";
import ProtectedRoute from "./pages/components/ProtectedRoute";
import CartModal from "./pages/components/CartModal";

import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { AdminAuthProvider } from "./context/AdminAuthContext";

import UserDash from "./user/UserDash";
import AdminDash from "./admin/AdminDashboard";
import AdminLogin from "./admin/AdminLogin";

function AppContent() {
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const location = useLocation();

  // Pages where header should NOT appear
  const hideHeaderRoutes = ["/user", "/admin"];
  const shouldHideHeader = hideHeaderRoutes.includes(location.pathname);

  return (
    <div className="App min-h-screen flex flex-col bg-gradient-to-b from-soft-night via-deep-gray to-soft-night text-[#D0C8B3] relative">
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-10 opacity-[0.05] bg-[url('/path/to/noise.png')] animate-subtle-scroll"
      ></div>

      {/* Conditionally render header */}
      {!shouldHideHeader && <Header setIsCartOpen={setIsCartOpen} />}

      <main className="flex-grow z-20 relative">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes */}
          <Route
            path="/booking"
            element={
              <ProtectedRoute allowedRoles={["customer", "guest"]}>
                <BookingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/booking-summary"
            element={
              <ProtectedRoute allowedRoles={["customer", "guest"]}>
                <BookingSummary />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <UserDash />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <AdminAuthProvider>
                <AdminDash />
              </AdminAuthProvider>
            }
          />
        </Routes>
      </main>

      {/* Cart Modal */}
      {isCartOpen && <CartModal setIsCartOpen={setIsCartOpen} />}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <ToastContainer
            position="top-center"
            autoClose={4000}
            hideProgressBar={false}
            newestOnTop={true}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss={false}
            pauseOnHover={false}
            theme="dark"
            className="z-[1000]"
          />
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}
