import { useEffect, useState } from "react";
import { Users, Trophy, Coins, Wallet } from "lucide-react";
import api from "../api/axios";

export default function Dashboard() {
  const [stats, setStats] = useState({
    users: 0,
    matches: 0,
    activeBets: 0,
    revenue: 0,
  });
  const token = localStorage.getItem("adminToken");

  // ✅ Fetch live dashboard stats
  const fetchStats = async () => {
    try {
      const res = await api.get("/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data);
    } catch (err) {
      console.error("❌ Error fetching dashboard stats:", err);
    }
  };

  // Auto refresh every 15s
  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 👥 Total Users */}
        <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-start transition-all hover:scale-[1.02]">
          <Users className="text-cyan-600 mb-2" size={28} />
          <p className="text-gray-600">Total Users</p>
          <h2 className="text-2xl font-bold">{stats.users}</h2>
        </div>

        {/* 🏆 Matches */}
        <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-start transition-all hover:scale-[1.02]">
          <Trophy className="text-cyan-600 mb-2" size={28} />
          <p className="text-gray-600">Matches</p>
          <h2 className="text-2xl font-bold">{stats.matches}</h2>
        </div>

        {/* 🎯 Active Bets */}
        <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-start transition-all hover:scale-[1.02]">
          <Coins className="text-cyan-600 mb-2" size={28} />
          <p className="text-gray-600">Active Bets</p>
          <h2 className="text-2xl font-bold">{stats.activeBets}</h2>
        </div>

        {/* 💰 Revenue */}
        <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-start transition-all hover:scale-[1.02]">
          <Wallet className="text-cyan-600 mb-2" size={28} />
          <p className="text-gray-600">Revenue</p>
          <h2 className="text-2xl font-bold">₹{stats.revenue.toLocaleString()}</h2>
        </div>
      </div>
    </div>
  );
}
