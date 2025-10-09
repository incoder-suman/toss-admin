import React, { useState, useEffect } from "react";
import api from "../api/axios";

export default function Users() {
  const [showCreate, setShowCreate] = useState(false);
  const [showTokens, setShowTokens] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false); // ✅ new
  const [showHistory, setShowHistory] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [createForm, setCreateForm] = useState({ name: "", email: "", password: "" });
  const [selectedUser, setSelectedUser] = useState(null);
  const [tokenAmount, setTokenAmount] = useState("");
  const [history, setHistory] = useState([]);

  const token = localStorage.getItem("adminToken");

  // ✅ Fetch all users
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

  // ✅ Random password generator
  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%";
    let pass = "";
    for (let i = 0; i < 10; i++) pass += chars[Math.floor(Math.random() * chars.length)];
    setCreateForm((p) => ({ ...p, password: pass }));
  };

  // ✅ Create new user (email optional)
  const handleCreateUser = async () => {
    try {
      if (!createForm.name || !createForm.password)
        return alert("⚠️ Name and Password are required");

      const body = {
        name: createForm.name,
        email: createForm.email || `${Date.now()}@example.com`, // ✅ default if blank
        password: createForm.password,
      };

      const res = await api.post("/users", body, {
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
      alert(`✅ ₹${tokenAmount} tokens added to ${selectedUser.name}`);
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

  // ✅ Withdraw Tokens (deduct from wallet)
  const handleWithdrawTokens = async () => {
    try {
      const res = await api.post(
        "/users/withdraw-tokens",
        { userId: selectedUser._id || selectedUser.id, amount: Number(tokenAmount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`✅ ₹${tokenAmount} withdrawn from ${selectedUser.name}`);
      setUsers((prev) =>
        prev.map((u) =>
          u._id === selectedUser._id ? { ...u, walletBalance: res.data.newBalance } : u
        )
      );
      setShowWithdraw(false);
      setTokenAmount("");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error withdrawing tokens");
    }
  };

  // ✅ Dummy Transaction History (for future)
  const fetchHistory = async (user) => {
    try {
      setHistory([
        { id: 1, type: "credit", amount: 50, date: "2025-09-25" },
        { id: 2, type: "debit", amount: 30, date: "2025-09-28" },
      ]);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p className="p-6 text-gray-500">Loading users...</p>;

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md w-full sm:w-auto"
        >
          Create User
        </button>
      </div>

      {/* Desktop Table */}
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
                      className="px-3 py-1 border rounded text-xs hover:bg-green-50"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setSelectedUser(u);
                        setShowWithdraw(true);
                      }}
                      className="px-3 py-1 border rounded text-xs hover:bg-red-50"
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
        <Modal title="Create User" onClose={() => setShowCreate(false)}>
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
        </Modal>
      )}

      {/* ✅ Add Tokens Modal */}
      {showTokens && selectedUser && (
        <TokenModal
          title={`Add Tokens – ${selectedUser.name}`}
          onClose={() => setShowTokens(false)}
          onSubmit={handleAddTokens}
          amount={tokenAmount}
          setAmount={setTokenAmount}
          color="green"
          action="Add"
        />
      )}

      {/* ✅ Withdraw Tokens Modal */}
      {showWithdraw && selectedUser && (
        <TokenModal
          title={`Withdraw Tokens – ${selectedUser.name}`}
          onClose={() => setShowWithdraw(false)}
          onSubmit={handleWithdrawTokens}
          amount={tokenAmount}
          setAmount={setTokenAmount}
          color="red"
          action="Withdraw"
        />
      )}
    </div>
  );
}

/* ✅ Reusable Components */
function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-5 rounded-lg w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        {children}
        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function TokenModal({ title, onClose, onSubmit, amount, setAmount, color, action }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-5 rounded-lg w-full max-w-sm">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border p-2 rounded mb-4"
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className={`px-4 py-2 bg-${color}-600 text-white rounded hover:bg-${color}-700`}
          >
            {action}
          </button>
        </div>
      </div>
    </div>
  );
}
