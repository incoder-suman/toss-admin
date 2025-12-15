import React, { useState, useEffect } from "react";
import api from "../api/axios"; // ✅ centralized axios instance

export default function Users() {
  const [showCreate, setShowCreate] = useState(false);
  const [showTokens, setShowTokens] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(""); // ✅ SEARCH STATE

  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "Ftb@321",
  });

  const [selectedUser, setSelectedUser] = useState(null);
  const [tokenAmount, setTokenAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [history, setHistory] = useState([]);

  const [creating, setCreating] = useState(false);
  const [adding, setAdding] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  const token = localStorage.getItem("adminToken");

  /* --------------------------------------------
   * Fetch Users
   * ------------------------------------------ */
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await api.get("/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data.users || []);
      } catch (err) {
        console.error("❌ Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [token]);

  /* --------------------------------------------
   * SEARCH FILTER (name + email)
   * ------------------------------------------ */
  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    );
  });

  /* --------------------------------------------
   * History fetcher
   * ------------------------------------------ */
  const fetchHistory = async (user) => {
    try {
      if (!user?._id) return;
      const res = await api.get(`/users/transactions/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const ADMIN_TYPES = new Set([
        "ADMIN_CREDIT",
        "WITHDRAW",
        "ADMIN_DEBIT",
        "ADMIN_WITHDRAW",
        "DEBIT",
      ]);

      const all = res.data.transactions || [];
      setHistory(all.filter((t) => ADMIN_TYPES.has(String(t.type))));
    } catch {
      alert("Failed to fetch transaction history");
    }
  };

  useEffect(() => {
    if (showHistory && selectedUser?._id) {
      fetchHistory(selectedUser);
    }
  }, [showHistory, selectedUser]);

  /* --------------------------------------------
   * Create user
   * ------------------------------------------ */
  const handleCreateUser = async () => {
    if (!createForm.name.trim()) return alert("⚠️ Name is required!");

    try {
      setCreating(true);
      const res = await api.post(
        "/users",
        {
          name: createForm.name.trim(),
          email:
            createForm.email.trim() ||
            `${createForm.name.trim().toLowerCase()}@dummy.com`,
          password: "Ftb@321",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUsers((prev) => [res.data.user, ...prev]);
      setCreateForm({ name: "", email: "", password: "Ftb@321" });
      setShowCreate(false);
    } catch (err) {
      alert(err.response?.data?.message || "Error creating user");
    } finally {
      setCreating(false);
    }
  };

  /* --------------------------------------------
   * Add Tokens
   * ------------------------------------------ */
  const handleAddTokens = async () => {
    const amt = Number(tokenAmount);
    if (!amt || amt <= 0) return alert("⚠️ Enter valid amount");

    try {
      setAdding(true);
      const res = await api.post(
        "/users/add-tokens",
        { userId: selectedUser._id, amount: amt },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUsers((prev) =>
        prev.map((u) =>
          u._id === selectedUser._id
            ? { ...u, walletBalance: res.data.newBalance }
            : u
        )
      );

      setShowTokens(false);
      setTokenAmount("");
    } finally {
      setAdding(false);
    }
  };

  /* --------------------------------------------
   * Withdraw Tokens
   * ------------------------------------------ */
  const handleWithdrawTokens = async () => {
    const amt = Number(withdrawAmount);
    if (!amt || amt <= 0) return alert("⚠️ Enter valid amount");

    try {
      setWithdrawing(true);
      const res = await api.post(
        "/users/withdraw-tokens",
        { userId: selectedUser._id, amount: amt },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUsers((prev) =>
        prev.map((u) =>
          u._id === selectedUser._id
            ? { ...u, walletBalance: res.data.newBalance }
            : u
        )
      );

      setShowWithdraw(false);
      setWithdrawAmount("");
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) return <p className="p-6 text-gray-500">Loading users...</p>;

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between gap-3 mb-4">
        <h1 className="text-2xl font-bold">Users</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Create User
        </button>
      </div>

      {/* 🔍 SEARCH INPUT */}
      <input
        type="text"
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full sm:w-80 border px-3 py-2 rounded mb-4"
      />

      {/* Table */}
      <div className="bg-white shadow rounded overflow-x-auto">
        <table className="min-w-[720px] w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-right">Balance</th>
              <th className="px-4 py-2">Created</th>
              <th className="px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr key={u._id} className="border-t">
                  <td className="px-4 py-2 font-medium">{u.name}</td>
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2 text-right">
                    ₹{u.walletBalance ?? 0}
                  </td>
                  <td className="px-4 py-2">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>

                  {/* ✅ RESPONSIVE ACTION BUTTONS */}
                  <td className="px-4 py-2">
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <button
                        onClick={() => {
                          setSelectedUser(u);
                          setShowTokens(true);
                        }}
                        className="w-full sm:w-auto px-3 py-2 border rounded text-xs"
                      >
                        Add
                      </button>

                      <button
                        onClick={() => {
                          setSelectedUser(u);
                          setShowWithdraw(true);
                        }}
                        className="w-full sm:w-auto px-3 py-2 border rounded text-xs"
                      >
                        Withdraw
                      </button>

                      <button
                        onClick={() => {
                          setSelectedUser(u);
                          setShowHistory(true);
                        }}
                        className="w-full sm:w-auto px-3 py-2 border rounded text-xs"
                      >
                        History
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

     {/* ✅ Create User Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-5 rounded-lg w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Create User</h2>
            <div className="space-y-2">
              <input
                placeholder="Name"
                value={createForm.name}
                onChange={(e) =>
                  setCreateForm({ ...createForm, name: e.target.value })
                }
                className="w-full border p-2 rounded"
              />
              <input
                placeholder="Email (optional)"
                value={createForm.email}
                onChange={(e) =>
                  setCreateForm({ ...createForm, email: e.target.value })
                }
                className="w-full border p-2 rounded"
              />
              <input
                type="text"
                disabled
                value="Ftb@321"
                className="w-full border p-2 rounded bg-gray-100"
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateUser}
                className="px-4 py-2 bg-blue-600 text-white rounded"
                disabled={creating}
              >
                {creating ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Add Tokens Modal */}
      {showTokens && selectedUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-5 rounded-lg w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4">
              Add Tokens – {selectedUser.name}
            </h2>
            <input
              type="number"
              placeholder="Amount"
              value={tokenAmount}
              onChange={(e) => setTokenAmount(e.target.value)}
              className="w-full border p-2 rounded mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowTokens(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTokens}
                className="px-4 py-2 bg-green-600 text-white rounded"
                disabled={adding}
              >
                {adding ? "Adding..." : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Withdraw Tokens Modal */}
      {showWithdraw && selectedUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-5 rounded-lg w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4">
              Withdraw Tokens – {selectedUser.name}
            </h2>
            <input
              type="number"
              placeholder="Amount"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="w-full border p-2 rounded mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowWithdraw(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdrawTokens}
                className="px-4 py-2 bg-red-600 text-white rounded"
                disabled={withdrawing}
              >
                {withdrawing ? "Withdrawing..." : "Withdraw"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ History Modal */}
      {showHistory && selectedUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-5 rounded-lg w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">
              Transaction History – {selectedUser.name}
            </h2>

            {history.length === 0 ? (
              <p className="text-gray-500 text-center py-6">
                No admin transactions found.
              </p>
            ) : (
              <table className="min-w-[420px] w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left">Type</th>
                    <th className="px-3 py-2 text-right">Amount</th>
                    <th className="px-3 py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h) => {
                    const amt = Number(h.amount || 0);
                    const isCredit = String(h.type) === "ADMIN_CREDIT";
                    const isDebit =
                      String(h.type) === "WITHDRAW" ||
                      String(h.type) === "ADMIN_DEBIT" ||
                      String(h.type) === "ADMIN_WITHDRAW" ||
                      String(h.type) === "DEBIT";

                    const displayAmt = isDebit ? -Math.abs(amt) : Math.abs(amt);

                    return (
                      <tr key={h._id} className="border-t">
                        <td className="px-3 py-2 capitalize">{h.type}</td>
                        <td
                          className={`px-3 py-2 text-right ${
                            isCredit ? "text-green-600" : isDebit ? "text-red-600" : ""
                          }`}
                        >
                          ₹{displayAmt.toFixed(2)}
                        </td>
                        <td className="px-3 py-2">
                          {h.createdAt ? new Date(h.createdAt).toLocaleString() : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowHistory(false)}
                className="px-4 py-2 border rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}      
    </div>
  );
}
