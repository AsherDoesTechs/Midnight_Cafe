/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

interface AdminAuthContextType {
  isAuthenticated: boolean;
  logout: () => void;
  setIsAuthenticated: (value: boolean) => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(
  undefined
);

export const AdminAuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // FIX: Initialize state directly from storage to avoid cascading renders
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window === "undefined") return false;
    const adminToken = import.meta.env.VITE_ADMIN_TOKEN;
    const token = localStorage.getItem("adminToken") || adminToken;
    return !!token;
  });

  const logout = () => {
    localStorage.removeItem("adminToken");
    setIsAuthenticated(false);
    window.location.href = "/";
  };

  return (
    <AdminAuthContext.Provider
      value={{ isAuthenticated, logout, setIsAuthenticated }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

// Helper hook
export const useAdminAuth = (): AdminAuthContextType => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
};
