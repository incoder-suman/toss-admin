import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* 🧭 Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* 🧩 Main Section */}
      <div className="flex-1 flex flex-col">
        {/* 🔝 Navbar */}
        <Navbar setSidebarOpen={setSidebarOpen} />

        {/* 🧠 Page Content (renders nested routes like Dashboard, Users, Matches etc.) */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <Outlet /> {/* 👈 This is where nested pages render */}
        </main>

        {/* 🔻 Optional footer (safe remove if not needed) */}
        <footer className="text-center py-3 text-xs text-gray-500 border-t bg-white">
          © {new Date().getFullYear()} TossBook Admin Panel
        </footer>
      </div>
    </div>
  );
}
