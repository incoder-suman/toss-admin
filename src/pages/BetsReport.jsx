import { useEffect, useState, useMemo } from "react";
import { Search } from "lucide-react";
import api from "../api/axios"; // central axios instance

export default function BetsReport() {
  const [userId, setUserId] = useState("");
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("adminToken");

  // 🔁 Fetch bets for entered User ID
  useEffect(() => {
    if (!userId.trim()) {
      setBets([]);
      return;
    }

    const fetchUserBets = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/bets?userId=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBets(res.data.bets || res.data || []);
      } catch (err) {
        console.error("❌ Error fetching bets:", err);
        setBets([]);
      } finally {
        setLoading(false);
      }
    };

    // debounce (wait 600 ms after typing)
    const timer = setTimeout(fetchUserBets, 600);
    return () => clearTimeout(timer);
  }, [userId, token]);

  // 💰 Totals
  const totals = useMemo(() => {
    const stake = bets.reduce((s, r) => s + (r.stake || 0), 0);
    const win = bets.reduce((s, r) => s + (r.win || 0), 0);
    return { stake, win, net: win - stake };
  }, [bets]);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <h1 className="text-2xl font-bold">Bets Report</h1>

      {/* 🔍 Search box */}
      <div className="bg-white rounded-2xl shadow p-4 flex gap-3 items-end flex-col sm:flex-row">
        <div className="flex-1 w-full">
          <label className="text-sm text-gray-600 flex items-center gap-2">
            <Search size={16} /> Enter User ID or Email
          </label>
          <input
            type="text"
            placeholder="e.g. U1001 or user email"
            className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-cyan-500"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
        </div>
      </div>

      {/* 🕓 Loading */}
      {loading && <p className="text-gray-500 p-4">Loading user bets...</p>}

      {/* 🧾 Bets table (desktop) */}
      {!loading && (
        <div className="bg-white rounded-2xl shadow overflow-x-auto hidden sm:block">
          <table className="min-w-[900px] w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left">Bet ID</th>
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">Match</th>
                <th className="px-4 py-3 text-left">Team</th>
                <th className="px-4 py-3 text-left">Stake</th>
                <th className="px-4 py-3 text-left">Win</th>
                <th className="px-4 py-3 text-left">Time</th>
              </tr>
            </thead>
            <tbody>
              {bets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                    No bets found for this user.
                  </td>
                </tr>
              ) : (
                bets.map((r) => (
                  <tr key={r._id || r.id} className="border-t">
                    <td className="px-4 py-3">{r._id || r.id}</td>
                    <td className="px-4 py-3 font-medium">
                      {r.userId?.email || r.userId || "—"}
                    </td>
                    <td className="px-4 py-3">{r.match?.title || r.match || "—"}</td>
                    <td className="px-4 py-3">{r.team || r.selectedTeam || "—"}</td>
                    <td className="px-4 py-3">₹{r.stake}</td>
                    <td
                      className={`px-4 py-3 ${
                        r.win > 0 ? "text-green-600 font-semibold" : ""
                      }`}
                    >
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
      )}

      {/* 📱 Mobile card layout */}
      {!loading && bets.length > 0 && (
        <div className="sm:hidden flex flex-col gap-3">
          {bets.map((r) => (
            <div
              key={r._id || r.id}
              className="bg-white rounded-xl shadow p-3 border"
            >
              <div className="flex justify-between text-sm text-gray-500">
                <span>{new Date(r.createdAt).toLocaleString()}</span>
                <span className="font-semibold text-gray-700">
                  {r.match?.title || "—"}
                </span>
              </div>
              <div className="mt-2 text-sm">
                <p>
                  <b>User:</b> {r.userId?.email || r.userId || "—"}
                </p>
                <p>
                  <b>Team:</b> {r.team || r.selectedTeam || "—"}
                </p>
                <p>
                  <b>Stake:</b> ₹{r.stake} &nbsp; | &nbsp;
                  <b className={r.win > 0 ? "text-green-600" : "text-gray-600"}>
                    Win: ₹{r.win}
                  </b>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 💰 Totals */}
      {bets.length > 0 && (
        <div className="p-4 border-t bg-gray-50 flex flex-col sm:flex-row sm:justify-end gap-2 text-sm rounded-b-2xl">
          <span>
            Total Stake: <b>₹{totals.stake}</b>
          </span>
          <span>
            Total Win: <b>₹{totals.win}</b>
          </span>
          <span
            className={
              totals.net >= 0
                ? "text-green-700 font-semibold"
                : "text-red-700 font-semibold"
            }
          >
            Net: ₹{totals.net}
          </span>
        </div>
      )}
    </div>
  );
}
