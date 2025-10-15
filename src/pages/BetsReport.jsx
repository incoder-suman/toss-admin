import { useEffect, useState, useMemo } from "react";
import { Search } from "lucide-react";
import api from "../api/axios";

export default function BetsReport() {
  const [userId, setUserId] = useState("");
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("adminToken");

  // 🧠 Fetch bets (all users OR specific user)
  useEffect(() => {
    const fetchBets = async () => {
      try {
        setLoading(true);

        // ✅ Use admin list endpoint, keep userId filter
        const qs = userId.trim() ? `?userId=${encodeURIComponent(userId.trim())}` : "";
        const endpoint = `/bets/admin/list${qs}`;

        const res = await api.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // API could return {success, bets} or {bets} or plain array; handle all
        const rows = res.data?.bets || res.data || [];
        setBets(Array.isArray(rows) ? rows : []);
      } catch (err) {
        console.error("❌ Error fetching bets:", err);
        setBets([]);
      } finally {
        setLoading(false);
      }
    };

    // ⏳ debounce 600ms
    const timer = setTimeout(fetchBets, 600);
    return () => clearTimeout(timer);
  }, [userId, token]);

  // 💰 Totals (handle winAmount or legacy win)
  const totals = useMemo(() => {
    const stake = bets.reduce((s, r) => s + Number(r.stake || 0), 0);
    const win = bets.reduce(
      (s, r) => s + Number(r.winAmount ?? r.win ?? 0),
      0
    );
    return { stake, win, net: win - stake };
  }, [bets]);

  // 🧩 Small helpers
  const renderUser = (r) => {
    // Backends we handle:
    // - populated: r.user?.name / r.user?.email
    // - mapped: r.userName / r.userEmail / r.userId
    return (
      r.user?.name ||
      r.userName ||
      r.user?.email ||
      r.userEmail ||
      (r.userId ? String(r.userId).slice(-6) : "—")
    );
  };

  const renderMatch = (r) => r.match?.title || r.matchTitle || "—";
  const renderWin = (r) => Number(r.winAmount ?? r.win ?? 0);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <h1 className="text-2xl font-bold">Bets Report</h1>

      {/* 🔍 Search box */}
      <div className="bg-white rounded-2xl shadow p-4 flex gap-3 items-end flex-col sm:flex-row">
        <div className="flex-1 w-full">
          <label className="text-sm text-gray-600 flex items-center gap-2">
            <Search size={16} /> Enter User ID, Name or Email
          </label>
          <input
            type="text"
            placeholder="e.g. 68ef… or user email or name"
            className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-cyan-500"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
        </div>
      </div>

      {/* 🕓 Loading */}
      {loading && <p className="text-gray-500 p-4">Loading bets...</p>}

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
                    No bets found.
                  </td>
                </tr>
              ) : (
                bets.map((r) => {
                  const id = r._id || r.id;
                  const win = renderWin(r);
                  return (
                    <tr key={id} className="border-t">
                      <td className="px-4 py-3">{id}</td>
                      <td className="px-4 py-3 font-medium">{renderUser(r)}</td>
                      <td className="px-4 py-3">{renderMatch(r)}</td>
                      <td className="px-4 py-3">{r.team || r.side || "—"}</td>
                      <td className="px-4 py-3">₹{Number(r.stake || 0)}</td>
                      <td className={`px-4 py-3 ${win > 0 ? "text-green-600 font-semibold" : ""}`}>
                        ₹{win}
                      </td>
                      <td className="px-4 py-3">
                        {r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 📱 Mobile layout */}
      {!loading && bets.length > 0 && (
        <div className="sm:hidden flex flex-col gap-3">
          {bets.map((r) => {
            const win = renderWin(r);
            return (
              <div key={r._id || r.id} className="bg-white rounded-xl shadow p-3 border">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}</span>
                  <span className="font-semibold text-gray-700">
                    {renderMatch(r)}
                  </span>
                </div>
                <div className="mt-2 text-sm">
                  <p><b>User:</b> {renderUser(r)}</p>
                  <p><b>Team:</b> {r.team || r.side || "—"}</p>
                  <p>
                    <b>Stake:</b> ₹{Number(r.stake || 0)} &nbsp; | &nbsp;
                    <b className={win > 0 ? "text-green-600" : "text-gray-600"}>
                      Win: ₹{win}
                    </b>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 💰 Totals */}
      {bets.length > 0 && (
        <div className="p-4 border-t bg-gray-50 flex flex-col sm:flex-row sm:justify-end gap-2 text-sm rounded-b-2xl">
          <span> Total Stake: <b>₹{totals.stake}</b> </span>
          <span> Total Win: <b>₹{totals.win}</b> </span>
          <span className={totals.net >= 0 ? "text-green-700 font-semibold" : "text-red-700 font-semibold"}>
            Net: ₹{totals.net}
          </span>
        </div>
      )}
    </div>
  );
}
