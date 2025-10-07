// src/routes/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  // ✅ Use the same key as used in Login.jsx
  const token = localStorage.getItem("adminToken");

  if (!token) {
    // Agar token nahi hai to redirect kare login page pe
    return <Navigate to="/login" replace />;
  }

  // Agar token hai to route render hoga
  return children;
}
