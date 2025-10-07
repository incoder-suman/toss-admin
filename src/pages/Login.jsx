// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, User } from "lucide-react";
import api from "../api/axios"; // ✅ central axios instance (reads .env automatically)

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // ✅ use central api instance
      const res = await api.post("/auth/login", {
        email: form.email,
        password: form.password,
      });

      const { token, user } = res.data;
      localStorage.setItem("adminToken", token);
      localStorage.setItem("adminUser", JSON.stringify(user));

      navigate("/"); // redirect to dashboard
    } catch (err) {
      console.error("❌ Login error:", err);
      setError(err.response?.data?.message || "Invalid credentials, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-600 to-cyan-800 px-4 py-6 sm:px-6 lg:px-8">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 hover:scale-[1.01]">
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-cyan-700 mb-6">
          Admin Login
        </h1>

        {error && (
          <p className="text-red-600 bg-red-100 px-3 py-2 rounded mb-4 text-sm text-center">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label className="text-sm text-gray-700 flex items-center gap-2 mb-1">
              <User size={18} /> Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="admin@example.com"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="text-sm text-gray-700 flex items-center gap-2 mb-1">
              <Lock size={18} /> Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 rounded-lg font-semibold text-white transition duration-200 ${
              loading
                ? "bg-cyan-400 cursor-not-allowed"
                : "bg-cyan-600 hover:bg-cyan-700"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Footer / Responsive Message */}
        <p className="text-center text-gray-500 text-xs mt-6">
          &copy; {new Date().getFullYear()} TOSS Admin Panel. All rights reserved.
        </p>
      </div>
    </div>
  );
}
