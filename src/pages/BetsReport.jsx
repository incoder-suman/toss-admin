// src/pages/BetsReport.jsx
import { useEffect, useMemo, useState } from "react";
import { Calendar, Download, Search } from "lucide-react";
import api from "../api/axios"; // ✅ central axios instance

export default function BetsReport() {
  const [filters, setFilters] = useState({ from: "", to: "", userId: "" });
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("adminToken"); // ✅ use admin token

  // ✅ Fetch Bets from backend
  useEffect(() => {
    const fetchBets = async () => {
      try {
        setLoading(true);
        const res = await api.get("/bets", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBets(res.data.bets || res.data || []); // backend structure safe parse
      } catch (err) {
        console.error("❌ Error fetching bets:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBets();
  }, [token]);

  // ✅ Apply Filters
  const rows = useMemo(() => {
    return bets.filter((b) => {
      const t = new Date(b.createdAt).getTime();
      const fromOk = filters.from ? t >= new Date(filters.from).getTime() : true;
      const toOk = filters.to ? t <= new Date(filters.to).getTime() : true;
      const userOk = filters.userId
        ? b.userId?.toString().toLowerCase().includes(filters.userId.toLowerCase())
        : true;
      return fromOk && toOk && userOk;
    });
  }, [filters, bets]);

  // ✅ Totals
  const totals = useMemo(() => {
    const stake = rows.reduce((s, r) => s + (r.stake || 0), 0);
    const win = rows.reduce((s, r) => s + (r.win || 0), 0);
    return { stake, win, net: win - stake };
  }, [rows]);

  // ✅ Export CSV
  const exportCSV = () => {
    const header = ["Bet ID", "User ID", "Match", "Side", "Stake", "Win", "Time"];
    const lines = rows.map((r) => [
      r._id || r.id,
      r.userId?.email || r.userId || "—",
      r.match?.title || r.match || "—",
      r.side,
      r.stake,
      r.win,
      new Date(r.createdAt).toLocaleString(),
    ]);
    const csv = [header, ...lines].map((arr) => arr.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bets-report-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <p className="p-6 text-gray-500">Loading bets...</p>;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <h1 className="text-2xl font-bold">Bets Report</h1>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow p-5 grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="md:col-span-2">
          <label className="text-sm text-gray-600 flex items-center gap-2">
            <Calendar size={16} /> From
          </label>
          <input
            type="datetime-local"
            className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-cyan-500"
            value={filters.from}
            onChange={(e) => setFilters({ ...filters, from: e.target.value })}
          />
        </div>
        <div className="md:col-span-2">
          <label className="text-sm text-gray-600 flex items-center gap-2">
            <Calendar size={16} /> To
          </label>
          <input
            type="datetime-local"
            className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-cyan-500"
            value={filters.to}
            onChange={(e) => setFilters({ ...filters, to: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm text-gray-600 flex items-center gap-2">
            <Search size={16} /> User ID
          </label>
          <input
            type="text"
            placeholder="e.g. U1001"
            className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-cyan-500"
            value={filters.userId}
            onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
          />
        </div>
        <div className="md:col-span-5 flex justify-end">
          <button
            onClick={exportCSV}
            className="bg-cyan-600 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2"
          >
            <Download size={18} /> Export CSV
          </button>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block bg-white rounded-2xl shadow overflow-x-auto">
        <table className="min-w-[900px] w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">Bet ID</th>
              <th className="px-4 py-3 text-left">User</th>
              <th className="px-4 py-3 text-left">Match</th>
              <th className="px-4 py-3 text-left">Side</th>
              <th className="px-4 py-3 text-left">Stake</th>
              <th className="px-4 py-3 text-left">Win</th>
              <th className="px-4 py-3 text-left">Time</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                  No bets found.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r._id || r.id} className="border-t">
                  <td className="px-4 py-3">{r._id || r.id}</td>
                  <td className="px-4 py-3 font-medium">
                    {r.userId?.email || r.userId || "—"}
                  </td>
                  <td className="px-4 py-3">{r.match?.title || r.match || "—"}</td>
                  <td className="px-4 py-3">{r.side}</td>
                  <td className="px-4 py-3">₹{r.stake}</td>
                  <td className={`px-4 py-3 ${r.win > 0 ? "text-green-600 font-semibold" : ""}`}>
                    ₹{r.win}
                  </td>
                  <td className="px-4 py-3">
                    {new Date(r.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="p-4 border-t bg-gray-50 flex flex-col sm:flex-row sm:justify-end gap-2 text-sm rounded-b-2xl">
        <span>Total Stake: <b>₹{totals.stake}</b></span>
        <span>Total Win: <b>₹{totals.win}</b></span>
        <span className={totals.net >= 0 ? "text-green-700 font-semibold" : "text-red-700 font-semibold"}>
          Net: ₹{totals.net}
        </span>
      </div>
    </div>
  );
}
