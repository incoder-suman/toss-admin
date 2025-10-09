import { useEffect, useMemo, useState } from "react";
import { Check, Swords, MinusCircle } from "lucide-react";
import api from "../api/axios";

export default function Results() {
  const [matches, setMatches] = useState([]);
  const [selection, setSelection] = useState({ matchId: "", outcome: "" });
  const [published, setPublished] = useState(
    JSON.parse(localStorage.getItem("publishedResults") || "[]")
  );

  const token = localStorage.getItem("adminToken");

  // ✅ Fetch LIVE/LOCKED matches
  const fetchMatches = async () => {
    try {
      const res = await api.get("/matches", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const filtered = (res.data.matches || res.data).filter((m) =>
        ["LIVE", "LOCKED"].includes(m.status)
      );
      setMatches(filtered);

      // Auto-select first
      if (filtered.length > 0 && !selection.matchId) {
        setSelection({ matchId: filtered[0]._id, outcome: "" });
      }
    } catch (err) {
      console.error("❌ Error fetching matches:", err);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [token]);

  // ✅ Sync published results to localStorage
  useEffect(() => {
    localStorage.setItem("publishedResults", JSON.stringify(published));
  }, [published]);

  const selectedMatch = useMemo(
    () => matches.find((m) => m._id === selection.matchId),
    [matches, selection.matchId]
  );

  // ✅ Publish match result
  const publish = async () => {
    if (!selection.matchId || !selection.outcome)
      return alert("⚠️ Please select a match and outcome!");

    try {
      console.log("Publishing result for:", selection.matchId, selection.outcome);

      const res = await api.put(
        `/matches/${selection.matchId}/result`,
        { result: selection.outcome },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const payload = {
        id: crypto.randomUUID(),
        matchId: selection.matchId,
        title: selectedMatch?.title,
        outcome: selection.outcome,
        publishedAt: new Date().toISOString(),
      };

      setMatches((prev) => prev.filter((m) => m._id !== selection.matchId));
      setPublished((prev) => [payload, ...prev]);
      setSelection({ matchId: "", outcome: "" });

      alert(`✅ ${res.data.message || "Result published successfully!"}`);
    } catch (err) {
      console.error("❌ Error publishing result:", err);
      alert(err.response?.data?.message || "Error publishing result");
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <h1 className="text-2xl font-bold">Results</h1>

      {/* Selection Box */}
      <div className="bg-white rounded-2xl shadow p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Match select */}
        <div>
          <label className="text-sm text-gray-600">Select Match</label>
          <select
            className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-cyan-500"
            value={selection.matchId}
            onChange={(e) =>
              setSelection({ matchId: e.target.value, outcome: "" })
            }
          >
            {matches.length === 0 ? (
              <option>No LIVE/LOCKED matches</option>
            ) : (
              matches.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.title} ({m.status})
                </option>
              ))
            )}
          </select>
        </div>

        {/* Outcome buttons */}
        <div>
          <label className="text-sm text-gray-600">Toss Winner</label>
          <div className="mt-2 flex gap-3 flex-wrap">
            {selectedMatch &&
              selectedMatch.title
                ?.split(/vs/i)
                .map((team) => {
                  const full = team.trim();
                  const short = full.slice(0, 3).toUpperCase();
                  return (
                    <button
                      key={full}
                      onClick={() =>
                        setSelection({ ...selection, outcome: full })
                      }
                      className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${
                        selection.outcome === full
                          ? "border-cyan-600 bg-cyan-50 text-cyan-700"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <Swords size={16} /> {full} ({short})
                    </button>
                  );
                })}

            {/* ➕ Draw option */}
            <button
              onClick={() => setSelection({ ...selection, outcome: "DRAW" })}
              className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${
                selection.outcome === "DRAW"
                  ? "border-red-600 bg-red-50 text-red-700"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <MinusCircle size={16} /> Match Draw
            </button>
          </div>
        </div>

        {/* Publish Button */}
        <div className="flex items-end">
          <button
            className="bg-cyan-600 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 disabled:opacity-60"
            onClick={publish}
            disabled={!selection.matchId || !selection.outcome}
          >
            <Check size={18} /> Publish Result
          </button>
        </div>
      </div>

      {/* Published Results */}
      <div className="bg-white rounded-2xl shadow divide-y">
        {published.length === 0 ? (
          <div className="p-6 text-gray-500">No results published yet.</div>
        ) : (
          published.map((r) => (
            <div key={r.id} className="p-4 flex justify-between items-center">
              <div>
                <p className="font-medium">{r.title}</p>
                <p className="text-xs text-gray-500">
                  {new Date(r.publishedAt).toLocaleString()}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full font-semibold ${
                  r.outcome === "DRAW"
                    ? "bg-red-100 text-red-700"
                    : "bg-cyan-100 text-cyan-700"
                }`}
              >
                {r.outcome}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
