import { useEffect, useMemo, useState } from "react";
import { Check, Swords } from "lucide-react";
import axios from "axios";

export default function Results() {
  const [matches, setMatches] = useState([]);
  const [selection, setSelection] = useState({ matchId: "", outcome: "" });
  const [published, setPublished] = useState(
    JSON.parse(localStorage.getItem("publishedResults") || "[]")
  );
  const token = localStorage.getItem("token");

  // ✅ Fetch matches from backend (LIVE or LOCKED)
  const fetchMatches = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/matches", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const filtered = (res.data.matches || res.data).filter((m) =>
        ["LIVE", "LOCKED"].includes(m.status)
      );
      setMatches(filtered);

      // Auto select first if none selected
      if (filtered.length > 0 && !selection.matchId) {
        setSelection({ matchId: filtered[0]._id, outcome: "" });
      }
    } catch (err) {
      console.error("Error fetching matches:", err);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [token]);

  // ✅ Keep localStorage in sync with published list
  useEffect(() => {
    localStorage.setItem("publishedResults", JSON.stringify(published));
  }, [published]);

  // ✅ Get selected match
  const selectedMatch = useMemo(
    () => matches.find((m) => m._id === selection.matchId),
    [matches, selection.matchId]
  );

  // ✅ Publish result and trigger backend settlement
  const publish = async () => {
    if (!selection.matchId || !selection.outcome)
      return alert("Please select a match and outcome!");

    try {
      console.log("Publishing result for:", selection.matchId);
      const res = await axios.put(
        `http://localhost:5000/api/matches/${selection.matchId}/result`,
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

      // ✅ Remove from live matches
      setMatches((prev) => prev.filter((m) => m._id !== selection.matchId));

      // ✅ Save to state + persist to localStorage
      setPublished((prev) => [payload, ...prev]);
      setSelection({ matchId: "", outcome: "" });

      alert(`✅ ${res.data.message}`);
    } catch (err) {
      console.error("❌ Error publishing result:", err);
      alert(err.response?.data?.message || "Error publishing result");
    }
  };

  return (
    <div className="space-y-6 p-4">
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
                ?.split(" vs ")
                .map((team) => (
                  <button
                    key={team}
                    onClick={() =>
                      setSelection({ ...selection, outcome: team.trim() })
                    }
                    className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${
                      selection.outcome === team.trim()
                        ? "border-cyan-600 bg-cyan-50 text-cyan-700"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <Swords size={16} /> {team}
                  </button>
                ))}
          </div>
        </div>

        {/* Publish Button */}
        <div className="flex items-end">
          <button
            className="bg-cyan-600 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2"
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
              <span className="px-3 py-1 rounded-full bg-cyan-100 text-cyan-700 font-semibold">
                {r.outcome}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
