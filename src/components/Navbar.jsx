import { Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Navbar({ setSidebarOpen }) {
  const navigate = useNavigate();

  // ✅ Logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="bg-white shadow-md h-14 flex items-center justify-between px-6">
      {/* Left Section: Hamburger + Title */}
      <div className="flex items-center gap-4">
        {/* Hamburger (mobile only) */}
        <button
          className="lg:hidden text-gray-600"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu size={24} />
        </button>

        <h2 className="font-semibold text-gray-700">Admin Dashboard</h2>
      </div>

      {/* Right Section: Logout */}
      <button
        onClick={handleLogout}
        className="bg-cyan-600 text-white px-4 py-2 rounded-md hover:bg-cyan-700"
      >
        Logout
      </button>
    </div>
  );
}
