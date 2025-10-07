import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./layout/AdminLayout";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Matches from "./pages/Matches";
import Results from "./pages/Results";
import BetsReport from "./pages/BetsReport";
import Login from "./pages/Login";
import ProtectedRoute from "./routes/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🔐 Public login page */}
        <Route path="/login" element={<Login />} />

        {/* 🧭 Protected admin section */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {/* Default dashboard */}
          <Route index element={<Dashboard />} />

          {/* ✅ Nested admin pages */}
          <Route path="users" element={<Users />} />
          <Route path="matches" element={<Matches />} />
          <Route path="results" element={<Results />} />
          <Route path="bets" element={<BetsReport />} />

          {/* 🔄 Fallback inside admin layout */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>

        {/* 🚫 Global fallback (in case nothing matches at all) */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
