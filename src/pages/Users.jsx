// src/pages/Users.jsx
import React, { useState, useEffect } from "react";
import api from "../api/axios"; // ✅ centralized axios instance

export default function Users() {
  const [showCreate, setShowCreate] = useState(false);
  const [showTokens, setShowTokens] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [createForm, setCreateForm] = useState({ name: "", email: "", password: "" });
  const [selectedUser, setSelectedUser] = useState(null);
  const [tokenAmount, setTokenAmount] = useState("");
  const [history, setHistory] = useState([]);

  const token = localStorage.getItem("adminToken"); // ✅ same key as login

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

  // ✅ Generate random password
  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%";
    let pass = "";
    for (let i = 0; i < 10; i++) pass += chars[Math.floor(Math.random() * chars.length)];
    setCreateForm((p) => ({ ...p, password: pass }));
  };

  // ✅ Create new user
  const handleCreateUser = async () => {
    try {
      const res = await api.post("/users", createForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ User created successfully!");
      setUsers((prev) => [res.data.user, ...prev]);
      setCreateForm({ name: "", email: "", password: "" });
      setShowCreate(false);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error creating user");
    }
  };

  // ✅ Add Tokens
  const handleAddTokens = async () => {
    try {
      const res = await api.post(
        "/users/add-tokens",
        { userId: selectedUser._id || selectedUser.id, amount: Number(tokenAmount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`✅ ${tokenAmount} tokens added to ${selectedUser.name}`);
      setUsers((prev) =>
        prev.map((u) =>
          u._id === selectedUser._id
            ? { ...u, walletBalance: res.data.newBalance }
            : u
        )
      );
      setShowTokens(false);
      setTokenAmount("");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error adding tokens");
    }
  };

  // ✅ Fetch History placeholder (when backend ready)
  const fetchHistory = async (user) => {
    try {
      setHistory([
        { id: 1, type: "credit", amount: 50, date: "2025-09-25" },
        { id: 2, type: "credit", amount: 100, date: "2025-09-28" },
      ]);
    } catch (err) {
      console.error(err);
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

      {/* Mobile view */}
      <div className="grid gap-3 sm:hidden">
        {users.map((u) => (
          <div key={u._id || u.id} className="bg-white rounded-lg shadow p-3">
            <div className="flex items-center justify-between">
              <p className="font-semibold">{u.name}</p>
              <span className="text-xs text-gray-500">
                {new Date(u.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{u.email}</p>
            <div className="flex items-center justify-between mt-3">
              <p className="text-sm">
                Balance:{" "}
                <span className="font-semibold">
                  ₹{u.walletBalance ?? u.balance ?? 0}
                </span>
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedUser(u);
                    setShowTokens(true);
                  }}
                  className="px-3 py-1 border rounded text-xs"
                >
                  Add Tokens
                </button>
                <button
                  onClick={() => {
                    setSelectedUser(u);
                    fetchHistory(u);
                    setShowHistory(true);
                  }}
                  className="px-3 py-1 border rounded text-xs"
                >
                  History
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block bg-white shadow rounded overflow-x-auto">
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
              <tr key={u._id || u.id} className="border-t">
                <td className="px-4 py-2 font-medium">{u.name}</td>
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2 text-right">
                  ₹{u.walletBalance ?? u.balance ?? 0}
                </td>
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
                      Add Tokens
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
                placeholder="Email"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                className="w-full border p-2 rounded"
              />
              <div className="flex gap-2">
                <input
                  placeholder="Password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  className="flex-1 border p-2 rounded"
                />
                <button onClick={generatePassword} className="px-3 py-2 bg-gray-200 rounded">
                  Generate
                </button>
              </div>
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

      {/* ✅ History Modal */}
      {showHistory && selectedUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-5 rounded-lg w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">
              Transaction History – {selectedUser.name}
            </h2>
            <div className="overflow-x-auto">
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
                    <tr key={h.id} className="border-t">
                      <td className="px-3 py-2">{h.type}</td>
                      <td className="px-3 py-2 text-right">₹{h.amount}</td>
                      <td className="px-3 py-2">{h.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
