import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import api from "../api/axios";

export default function Matches() {
  const [form, setForm] = useState({
    firstTeam: "",
    secondTeam: "",
    lastDate: "",
    lastTime: "",
    minBet: 50,
    maxBet: 1000000,
  });

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("adminToken");

  /* -------------------------------------------------------
     Fetch Matches
  ------------------------------------------------------- */
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await api.get("/matches", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMatches(res.data.matches || res.data || []);
      } catch (err) {
        console.error("❌ Error fetching matches:", err);
      }
    };
    fetchMatches();
  }, [token]);

  /* -------------------------------------------------------
     Create Match
  ------------------------------------------------------- */
  const handleCreate = async (e) => {
    e.preventDefault();
    const { firstTeam, secondTeam, lastDate, lastTime } = form;

    if (!firstTeam || !secondTeam || !lastDate || !lastTime) {
      return alert("⚠️ Please fill all fields");
    }

    const lastBetTime = new Date(`${lastDate}T${lastTime}:00`);

    const body = {
      title: `${firstTeam} vs ${secondTeam}`,
      startAt: new Date(),
      lastBetTime,
      status: "UPCOMING",
      odds: {
        [firstTeam.slice(0, 3).toUpperCase()]: 1.98,
        [secondTeam.slice(0, 3).toUpperCase()]: 1.98,
      },
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
        lastDate: "",
        lastTime: "",
        minBet: 50,
        maxBet: 1000000,
      });

      alert("✅ Match created successfully!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error creating match");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------------------------------
     Update Match Status
  ------------------------------------------------------- */
  const updateStatus = async (id, status) => {
    try {
      const res = await api.put(
        `/matches/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updated = res.data.match;

      setMatches((prev) =>
        prev.map((m) =>
          m._id === id ? { ...m, status: updated.status } : m
        )
      );
    } catch (err) {
      alert(err.response?.data?.message || "Error updating status");
    }
  };

  /* -------------------------------------------------------
     Status Badge
  ------------------------------------------------------- */
  const statusBadge = (s) =>
    s === "UPCOMING"
      ? "bg-gray-100 text-gray-700"
      : s === "LIVE"
      ? "bg-green-100 text-green-700"
      : s === "LOCKED"
      ? "bg-yellow-100 text-yellow-700"
      : s === "RESULT_DECLARED"
      ? "bg-blue-100 text-blue-700"
      : s === "COMPLETED"
      ? "bg-cyan-100 text-cyan-700"
      : s === "CANCELLED"
      ? "bg-red-100 text-red-700"
      : "bg-gray-100 text-gray-700";

  /* -------------------------------------------------------
     OPTIONAL: Hide Cancelled only
  ------------------------------------------------------- */
  const visibleMatches = matches.filter(
    (m) => m.status !== "CANCELLED"
  );

  /* -------------------------------------------------------
     UI
  ------------------------------------------------------- */
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <h1 className="text-2xl font-bold">Matches</h1>

      {/* Create Match */}
      <form
        onSubmit={handleCreate}
        className="bg-white rounded-2xl shadow p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        <input
          placeholder="First Team"
          className="input"
          value={form.firstTeam}
          onChange={(e) =>
            setForm({ ...form, firstTeam: e.target.value })
          }
        />
        <input
          placeholder="Second Team"
          className="input"
          value={form.secondTeam}
          onChange={(e) =>
            setForm({ ...form, secondTeam: e.target.value })
          }
        />
        <input
          type="date"
          className="input"
          value={form.lastDate}
          onChange={(e) =>
            setForm({ ...form, lastDate: e.target.value })
          }
        />
        <input
          type="time"
          className="input"
          value={form.lastTime}
          onChange={(e) =>
            setForm({ ...form, lastTime: e.target.value })
          }
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg w-full sm:w-auto flex items-center gap-2"
        >
          <Plus size={18} />
          {loading ? "Creating..." : "Create Match"}
        </button>
      </form>

      {/* Matches Table */}
      <div className="bg-white rounded-2xl shadow overflow-x-auto">
        <table className="min-w-[900px] w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">Match</th>
              <th className="px-4 py-3 text-left">Last Bet Time</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleMatches.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-gray-500">
                  No matches found
                </td>
              </tr>
            ) : (
              visibleMatches.map((m) => (
                <tr key={m._id} className="border-t">
                  <td className="px-4 py-3 font-medium">{m.title}</td>
                  <td className="px-4 py-3">
                    {m.lastBetTime
                      ? new Date(m.lastBetTime).toLocaleString()
                      : "—"}
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
                  <td className="px-4 py-3 flex flex-col sm:flex-row gap-2">
                    {m.status === "UPCOMING" && (
                      <button
                        onClick={() => updateStatus(m._id, "LIVE")}
                        className="bg-green-600 text-white px-3 py-1 rounded text-xs"
                      >
                        Live
                      </button>
                    )}

                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            "Are you sure you want to cancel this match?"
                          )
                        ) {
                          updateStatus(m._id, "CANCELLED");
                        }
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs"
                    >
                      Cancel
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
