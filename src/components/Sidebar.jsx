import { NavLink } from "react-router-dom";
import { Home, Users, Trophy, FileBarChart, List, X } from "lucide-react";

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const menuItems = [
    { name: "Dashboard", path: "/", icon: <Home size={20} /> },
    { name: "Users", path: "/users", icon: <Users size={20} /> },
    { name: "Matches", path: "/matches", icon: <Trophy size={20} /> },
    { name: "Results", path: "/results", icon: <List size={20} /> },
    { name: "Bets Report", path: "/bets", icon: <FileBarChart size={20} /> },
  ];

  return (
    <>
      {/* Overlay (mobile only) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 z-50 h-screen w-64 bg-cyan-600 text-white p-5 flex flex-col transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        {/* Menu */}
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md transition ${
                  isActive ? "bg-cyan-700" : "hover:bg-cyan-500"
                }`
              }
              onClick={() => setSidebarOpen(false)} // mobile pe sidebar band ho
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
}
