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
      setError("Please fill in Name, Email, and Password.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setFormLoading(true);
      await usersApi.create(formData);
      setSuccess(`User account for "${formData.name}" created successfully!`);
      setIsModalOpen(false);
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to create user.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteUser = async (id, name, email) => {
    if (id === currentAdmin?._id) {
      alert("You cannot delete your own admin account.");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete user "${name}" (${email})?`)) {
      return;
    }

    try {
      setError("");
      await usersApi.delete(id);
      setSuccess(`User "${name}" has been removed.`);
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to delete user.");
    }
  };

  const filteredUsers = users.filter((u) => {
    const query = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      u.role.toLowerCase().includes(query)
    );
  });

  return (
    <div>
      {/* Header and Controls */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#fff", marginBottom: "4px" }}>
            Registered Users Overview
          </h2>
          <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
            Monitor accounts, listener profiles, and administrative privileges
          </p>
        </div>

        <button
          className="btn-primary"
          style={{ width: "auto", margin: 0, padding: "10px 20px" }}
          onClick={handleOpenAddModal}
        >
          ➕ Provision New Account
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="alert-error" style={{ marginBottom: "16px" }}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert-success" style={{ marginBottom: "16px" }}>
          <span>✓</span>
          <span>{success}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="card" style={{ padding: "16px 20px" }}>
        <input
          type="text"
          className="form-input"
          placeholder="Filter users by name, email, or role..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Users Table */}
      <div className="card" style={{ padding: "0" }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: "60px" }}>Avatar</th>
                <th>Full Name</th>
                <th>Email Address</th>
                <th>Role</th>
                <th>Registered Date</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
                    Loading accounts...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "48px 20px" }}>
                    <div style={{ fontSize: "40px", marginBottom: "8px" }}>👥</div>
                    <div style={{ fontSize: "16px", fontWeight: "600", color: "#fff", marginBottom: "4px" }}>
                      No users found
                    </div>
                    <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
                      Users will appear here once they register via the Android application.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isCurrent = user._id === currentAdmin?._id;
                  return (
                    <tr key={user._id}>
                      <td>
                        <div
                          style={{
                            width: "38px",
                            height: "38px",
                            borderRadius: "50%",
                            backgroundColor:
                              user.role === "admin"
                                ? "rgba(99, 102, 241, 0.2)"
                                : "rgba(6, 182, 212, 0.15)",
                            color:
                              user.role === "admin" ? "#818cf8" : "var(--accent-cyan)",
                            border: `1px solid ${
                              user.role === "admin"
                                ? "rgba(99, 102, 241, 0.4)"
                                : "rgba(6, 182, 212, 0.3)"
                            }`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "13px",
                            fontWeight: "700",
                          }}
                        >
                          {user.name ? user.name.substring(0, 2).toUpperCase() : "U"}
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: "600", color: "#fff" }}>
                          {user.name} {isCurrent && <span style={{ fontSize: "11px", color: "var(--accent-cyan)" }}>(You)</span>}
                        </div>
                      </td>

                      <td>
                        <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>
                          {user.email}
                        </div>
                      </td>

                      <td>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "3px 10px",
                            borderRadius: "12px",
                            fontSize: "11px",
                            fontWeight: "600",
                            backgroundColor:
                              user.role === "admin"
                                ? "rgba(99, 102, 241, 0.2)"
                                : "rgba(16, 185, 129, 0.15)",
                            color:
                              user.role === "admin" ? "#818cf8" : "var(--accent-success)",
                            border: `1px solid ${
                              user.role === "admin"
                                ? "rgba(99, 102, 241, 0.4)"
                                : "rgba(16, 185, 129, 0.3)"
                            }`,
                            textTransform: "uppercase",
                          }}
                        >
                          {user.role}
                        </span>
                      </td>

                      <td>
                        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString()
                            : "—"}
                        </span>
                      </td>

                      <td style={{ textAlign: "right" }}>
                        <button
                          className="btn-action-delete"
                          onClick={() => handleDeleteUser(user._id, user.name, user.email)}
                          disabled={isCurrent}
                          style={{
                            opacity: isCurrent ? 0.4 : 1,
                            cursor: isCurrent ? "not-allowed" : "pointer",
                          }}
                          title={isCurrent ? "Cannot delete your own account" : "Delete User"}
                        >
                          🗑️ Delete
                        </button>
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
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#fff" }}>
                ➕ Provision User Account
              </h3>
              <button className="btn-close" onClick={handleCloseModal}>
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Alex Johnson"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="user@focusmusic.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Initial Password * (min 6 chars)</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Account Role *</label>
                <select
                  className="form-input"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="user">Regular Listener (Android User)</option>
                  <option value="admin">Administrator (Web Admin Access)</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
                <button
                  type="button"
                  className="btn-logout"
                  style={{ flex: 1, padding: "10px" }}
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 2, margin: 0, padding: "10px" }}
                  disabled={formLoading}
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
