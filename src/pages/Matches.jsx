// src/pages/Matches.jsx
import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import api from "../api/axios"; // ✅ central axios instance

export default function Matches() {
  const [form, setForm] = useState({
    firstTeam: "",
    secondTeam: "",
    date: "",
    time: "",
    minBet: 10,
    maxBet: 1000,
  });
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("adminToken"); // ✅ same key as login

  // ✅ Fetch all matches
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await api.get("/matches", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMatches(res.data.matches || res.data);
      } catch (err) {
        console.error("❌ Error fetching matches:", err);
      }
    };
    fetchMatches();
  }, [token]);

  // ✅ Create a new match
  const handleCreate = async (e) => {
    e.preventDefault();
    const { firstTeam, secondTeam, date, time } = form;
    if (!firstTeam || !secondTeam || !date || !time) {
      alert("⚠️ Please fill all fields");
      return;
    }

    const startAt = new Date(`${date}T${time}:00`);
    const body = {
      title: `${firstTeam} vs ${secondTeam}`,
      startAt,
      status: "UPCOMING",
      odds: { HEADS: 1.9, TAILS: 1.9 },
      minBet: form.minBet,
      maxBet: form.maxBet,
    };

    try {
      setLoading(true);
      const res = await api.post("/matches", body, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMatches((prev) => [res.data.match, ...prev]);
      setForm({
        firstTeam: "",
        secondTeam: "",
        date: "",
        time: "",
        minBet: 10,
        maxBet: 1000,
      });
      alert("✅ Match created successfully!");
    } catch (err) {
      console.error("❌ Error creating match:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Error creating match");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Update match status
  const updateStatus = async (id, status) => {
    try {
      const res = await api.put(
        `/matches/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updated = res.data.match;
      setMatches((prev) =>
        prev.map((m) => (m._id === id ? { ...m, status: updated.status } : m))
      );
      alert(`✅ Match status updated to ${status}`);
    } catch (err) {
      console.error("❌ Error updating status:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Error updating status");
    }
  };

  // ✅ Status Badge Styling
  const statusBadge = (s) =>
    s === "UPCOMING"
      ? "bg-gray-100 text-gray-700"
      : s === "LIVE"
      ? "bg-green-100 text-green-700"
      : s === "LOCKED"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-cyan-100 text-cyan-700";

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <h1 className="text-2xl font-bold">Matches</h1>

      {/* ✅ Create Match Form */}
      <form
        onSubmit={handleCreate}
        className="bg-white rounded-2xl shadow p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        <div>
          <label className="text-sm text-gray-600">First Team*</label>
          <input
            type="text"
            className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-cyan-500"
            value={form.firstTeam}
            onChange={(e) => setForm({ ...form, firstTeam: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm text-gray-600">Second Team*</label>
          <input
            type="text"
            className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-cyan-500"
            value={form.secondTeam}
            onChange={(e) => setForm({ ...form, secondTeam: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm text-gray-600">Date*</label>
          <input
            type="date"
            className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-cyan-500"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm text-gray-600">Time*</label>
          <input
            type="time"
            className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-cyan-500"
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
          />
        </div>

        <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg w-full sm:w-auto"
          >
            <Plus size={18} /> {loading ? "Creating..." : "Create Toss"}
          </button>
        </div>
      </form>

      {/* ✅ Matches Table */}
      <div className="bg-white rounded-2xl shadow overflow-x-auto">
        <table className="min-w-[800px] w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">Match</th>
              <th className="px-4 py-3 text-left">Start Time</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {matches.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center text-gray-500" colSpan={4}>
                  No matches yet.
                </td>
              </tr>
            ) : (
              matches.map((m) => (
                <tr key={m._id} className="border-t">
                  <td className="px-4 py-3 font-medium">{m.title}</td>
                  <td className="px-4 py-3">
                    {new Date(m.startAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full font-semibold ${statusBadge(
                        m.status
                      )}`}
                    >
                      {m.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 space-x-2">
                    <button
                      onClick={() => updateStatus(m._id, "LIVE")}
                      className="bg-green-600 text-white px-3 py-1 rounded text-xs"
                    >
                      Live
                    </button>
                    <button
                      onClick={() => updateStatus(m._id, "COMPLETED")}
                      className="bg-cyan-600 text-white px-3 py-1 rounded text-xs"
                    >
                      Complete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
