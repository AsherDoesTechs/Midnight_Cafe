import React, { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

interface AdminAuthContextType {
  isAuthenticated: boolean;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(
  undefined
);

export const AdminAuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const adminToken = import.meta.env.VITE_ADMIN_TOKEN;
    const token = localStorage.getItem("adminToken") || adminToken;

    if (token) {
      setIsAuthenticated(true);
    }
    // Note: Do not redirect to /admin-login here.
    // Handle redirection in your ProtectedRoute or App router logic instead.
  }, []);

  const logout = () => {
    localStorage.removeItem("adminToken");
    setIsAuthenticated(false);
    window.location.href = "/";
  };

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = (): AdminAuthContextType => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
};
