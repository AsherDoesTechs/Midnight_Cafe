// src/pages/components/ProtectedRoute.tsx
import React, { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = [],
  fallbackPath = "/login",
}) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // 🔄 Still checking session
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#121212] text-[#D0C8B3]">
        <p>Checking authentication status...</p>
      </div>
    );
  }

  // 🚫 Not logged in → redirect to login
  if (!user) {
    return (
      <Navigate to={fallbackPath} replace state={{ from: location.pathname }} />
    );
  }

  // 🔐 Role-based access control
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <Navigate to={fallbackPath} replace state={{ from: location.pathname }} />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
