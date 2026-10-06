import React, { useState } from "react";
import { authApi } from "../api/api";

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    try {
      setLoading(true);
      const res = await authApi.login({ email, password });

      if (res.data && res.data.success) {
        const userData = res.data.data;

        // Verify admin privilege
        if (userData.role !== "admin") {
          setError("Access Denied: You must have an administrator account to log in.");
          setLoading(false);
          return;
        }

        // Store session credentials
        localStorage.setItem("adminToken", userData.token);
        localStorage.setItem("adminUser", JSON.stringify(userData));

        onLoginSuccess(userData);
      } else {
        setError(res.data?.message || "Failed to log in.");
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Login failed. Check server connection.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">🎧</div>
          <h1 className="login-title">8D Focus Music</h1>
          <p className="login-subtitle">Admin Control Panel</p>
        </div>

        {error && (
          <div className="alert-error" style={{ marginBottom: "18px" }}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Admin Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="admin@focusmusic.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Authenticating..." : "Sign In to Admin"}
          </button>
        </form>

        <div style={{ marginTop: "24px", textAlign: "center", fontSize: "12px", color: "var(--text-muted)" }}>
          College Project Demonstration • 8D Spatial Audio
        </div>
      </div>
    </div>
  );
}
