import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import React from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("USER" | "TEACHER" | "ADMIN")[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    // Giriş yapmamışsa login sayfasına yönlendir, geldiği sayfayı state olarak taşı
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !(allowedRoles as string[]).includes(user.role)) {
    // Yetkisi yoksa ana sayfaya (veya hata sayfasına) gönder
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
