// src/routes/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  // ✅ Token check karo (auth === true nahi, actual token)
  const token = localStorage.getItem("token");

  if (!token) {
    // Agar token nahi hai to redirect karega login page pe
    return <Navigate to="/login" replace />;
  }

  // Agar token hai to route render hoga
  return children;
}
