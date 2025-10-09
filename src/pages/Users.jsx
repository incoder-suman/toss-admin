import React, { useState, useEffect } from "react";
import api from "../api/axios"; // ✅ centralized axios instance

export default function Users() {
  const [showCreate, setShowCreate] = useState(false);
  const [showTokens, setShowTokens] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [createForm, setCreateForm] = useState({ name: "", email: "", password: "Ftb@321" });
  const [selectedUser, setSelectedUser] = useState(null);
  const [tokenAmount, setTokenAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [history, setHistory] = useState([]);

  const token = localStorage.getItem("adminToken");

  // ✅ Fetch Users
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

  // ✅ Create new user (email optional, password fixed)
  const handleCreateUser = async () => {
    try {
      const body = {
        name: createForm.name.trim(),
        email: createForm.email?.trim() || `${createForm.name.toLowerCase()}@dummy.com`,
        password: "Ftb@321",
      };
      if (!body.name) return alert("⚠️ Name is required!");

      const res = await api.post("/users", body, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("✅ User created successfully!");
      setUsers((prev) => [res.data.user, ...prev]);
      setCreateForm({ name: "", email: "", password: "Ftb@321" });
      setShowCreate(false);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error creating user");
    }
  };

  // ✅ Add Tokens
  const handleAddTokens = async () => {
    if (!selectedUser?._id) return alert("⚠️ No user selected");
    if (!tokenAmount || isNaN(tokenAmount) || Number(tokenAmount) <= 0)
      return alert("⚠️ Enter valid amount");

    try {
      const res = await api.post(
        "/users/add-tokens",
        { userId: selectedUser._id, amount: Number(tokenAmount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`✅ ${tokenAmount} tokens added to ${selectedUser.name}`);
      setUsers((prev) =>
        prev.map((u) =>
          u._id === selectedUser._id ? { ...u, walletBalance: res.data.newBalance } : u
        )
      );
      setShowTokens(false);
      setTokenAmount("");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error adding tokens");
    }
  };

  // ✅ Withdraw Tokens
  const handleWithdrawTokens = async () => {
    if (!selectedUser?._id) return alert("⚠️ No user selected");
    if (!withdrawAmount || isNaN(withdrawAmount) || Number(withdrawAmount) <= 0)
      return alert("⚠️ Enter valid amount");

    try {
      const res = await api.post(
        "/users/withdraw-tokens",
        { userId: selectedUser._id, amount: Number(withdrawAmount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`💸 ${withdrawAmount} tokens withdrawn from ${selectedUser.name}`);
      setUsers((prev) =>
        prev.map((u) =>
          u._id === selectedUser._id ? { ...u, walletBalance: res.data.newBalance } : u
        )
      );
      setShowWithdraw(false);
      setWithdrawAmount("");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error withdrawing tokens");
    }
  };

  // ✅ Fetch real transaction history from backend
  const fetchHistory = async (user) => {
    try {
      const res = await api.get(`/users/transactions/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory(res.data.transactions || []);
    } catch (err) {
      console.error("❌ Error fetching history:", err);
      alert("Failed to fetch transaction history");
    }
  };

  if (loading) return <p className="p-6 text-gray-500">Loading users...</p>;

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md w-full sm:w-auto"
        >
          Create User
        </button>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded overflow-x-auto">
        <table className="min-w-[720px] w-full text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-right">Balance</th>
              <th className="px-4 py-2 text-left">Created</th>
              <th className="px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-t">
                <td className="px-4 py-2 font-medium">{u.name}</td>
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2 text-right">₹{u.walletBalance ?? 0}</td>
                <td className="px-4 py-2">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-2 text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedUser(u);
                        setShowTokens(true);
                      }}
                      className="px-3 py-1 border rounded text-xs hover:bg-gray-50"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setSelectedUser(u);
                        setShowWithdraw(true);
                      }}
                      className="px-3 py-1 border rounded text-xs hover:bg-gray-50"
                    >
                      Withdraw
                    </button>
                    <button
                      onClick={() => {
                        setSelectedUser(u);
                        fetchHistory(u);
                        setShowHistory(true);
                      }}
                      className="px-3 py-1 border rounded text-xs hover:bg-gray-50"
                    >
                      History
                    </button>
                  </div>
                </td>
              </tr>
            ))}
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
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                className="w-full border p-2 rounded"
              />
              <input
                placeholder="Email (optional)"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
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
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 border rounded">
                Cancel
              </button>
              <button onClick={handleCreateUser} className="px-4 py-2 bg-blue-600 text-white rounded">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Add Tokens Modal */}
      {showTokens && selectedUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-5 rounded-lg w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4">Add Tokens – {selectedUser.name}</h2>
            <input
              type="number"
              placeholder="Amount"
              value={tokenAmount}
              onChange={(e) => setTokenAmount(e.target.value)}
              className="w-full border p-2 rounded mb-4"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowTokens(false)} className="px-4 py-2 border rounded">
                Cancel
              </button>
              <button onClick={handleAddTokens} className="px-4 py-2 bg-green-600 text-white rounded">
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Withdraw Tokens Modal */}
      {showWithdraw && selectedUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-5 rounded-lg w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4">Withdraw Tokens – {selectedUser.name}</h2>
            <input
              type="number"
              placeholder="Amount"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="w-full border p-2 rounded mb-4"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowWithdraw(false)} className="px-4 py-2 border rounded">
                Cancel
              </button>
              <button onClick={handleWithdrawTokens} className="px-4 py-2 bg-red-600 text-white rounded">
                Withdraw
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
            <table className="min-w-[420px] w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left">Type</th>
                  <th className="px-3 py-2 text-right">Amount</th>
                  <th className="px-3 py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h._id} className="border-t">
                    <td className="px-3 py-2 capitalize">{h.type}</td>
                    <td className="px-3 py-2 text-right">₹{h.amount}</td>
                    <td className="px-3 py-2">
                      {new Date(h.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end mt-4">
              <button onClick={() => setShowHistory(false)} className="px-4 py-2 border rounded">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
