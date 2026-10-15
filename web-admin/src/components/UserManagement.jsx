import React, { useState, useEffect } from "react";
import { usersApi } from "../api/api";

export default function UserManagement({ currentAdmin }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal & Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [formLoading, setFormLoading] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await usersApi.getAll();
      setUsers(res.data?.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load users. Administrator credentials required."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleOpenAddModal = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "user",
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.name || !formData.email || !formData.password) {
      setError("All fields are required.");
      return;
    }

    try {
      setFormLoading(true);
      await usersApi.create(formData);
      setSuccess(`User "${formData.name}" created successfully.`);
      handleCloseModal();
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create user.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (currentAdmin && currentAdmin.id === id) {
      setError("Action forbidden: You cannot delete your own active administrator account.");
      return;
    }

    if (!window.confirm(`Are you sure you want to remove account "${name}"?`)) return;

    try {
      setError("");
      setSuccess("");
      await usersApi.delete(id);
      setSuccess(`User "${name}" deleted successfully.`);
      loadUsers();
    } catch (err) {
      setError("Failed to delete user.");
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="w-full flex flex-col font-sans text-neutral-200 select-none p-4 sm:p-8 space-y-6 pb-28">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#1DB954] font-mono">
            Access Control
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5">
            User Accounts
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Manage administrative credentials, listener permissions, and authentication
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-5 py-2.5 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-black text-xs font-bold flex items-center gap-2 transition-all active:scale-95 shadow-md shadow-[#1DB954]/20 shrink-0"
        >
          <span className="material-symbols-outlined text-base font-bold">person_add</span>
          <span>Add User</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2.5">
          <span className="material-symbols-outlined text-lg">warning</span>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-[#1DB954]/10 border border-[#1DB954]/30 text-[#86efac] text-xs flex items-center gap-2.5">
          <span className="material-symbols-outlined text-lg">check_circle</span>
          <span>{success}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-[#181818] border border-white/5 rounded-2xl p-4 flex items-center justify-between shadow-md">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-neutral-400 text-sm">
            search
          </span>
          <input
            type="text"
            className="w-full bg-[#242424] border border-white/10 rounded-full py-2 pl-9 pr-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#1DB954]"
            placeholder="Search by name, email, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <span className="text-xs text-neutral-400 font-mono hidden sm:inline">
          {filteredUsers.length} Accounts
        </span>
      </div>

      {/* Users Table */}
      <div className="bg-[#181818] border border-white/5 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#141414] border-b border-white/5 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4 hidden md:table-cell">Created</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-neutral-500 font-mono">
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-neutral-400">
                    No matching users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isCurrent = currentAdmin && (currentAdmin.id === u._id || currentAdmin._id === u._id);
                  const isAdmin = u.role === "admin";
                  return (
                    <tr key={u._id || u.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#242424] border border-white/10 flex items-center justify-center font-bold text-white text-xs">
                            {u.name ? u.name[0].toUpperCase() : "U"}
                          </div>
                          <div>
                            <p className="font-bold text-white flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {isCurrent && (
                                <span className="text-[10px] bg-[#1DB954]/20 text-[#1DB954] font-mono px-1.5 py-0.2 rounded font-semibold">
                                  You
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-neutral-300">
                        {u.email}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                            isAdmin
                              ? "bg-purple-900/30 text-purple-300 border border-purple-500/30"
                              : "bg-white/5 text-neutral-300 border border-white/10"
                          }`}
                        >
                          {u.role || "user"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-neutral-400 hidden md:table-cell">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "Active"}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {!isCurrent && (
                          <button
                            onClick={() => handleDeleteUser(u._id || u.id, u.name)}
                            className="px-3 py-1 rounded-full bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white text-xs font-semibold transition-all"
                          >
                            Remove
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="relative w-full max-w-md bg-[#181818] border border-white/10 rounded-3xl p-6 shadow-2xl select-none">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="text-base font-bold text-white tracking-tight">Add User Account</h3>
              <button
                onClick={handleCloseModal}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#242424] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#1DB954]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="user@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#242424] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#1DB954]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Password *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-[#242424] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#1DB954]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-[#242424] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#1DB954]"
                >
                  <option value="user">Listener (Standard User)</option>
                  <option value="admin">Administrator (Full Access)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-6 py-2 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-black text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                  {formLoading ? "Creating..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
