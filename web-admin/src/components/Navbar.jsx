import React, { useState, useEffect } from "react";
import { checkBackendHealth } from "../api/api";

const TAB_TITLES = {
  dashboard: "Admin Overview & Statistics",
  songs: "8D Songs Management",
  categories: "Focus Categories Management",
  users: "Registered Users Overview",
};

export default function Navbar({ activeTab, user, onLogout }) {
  const [isOnline, setIsOnline] = useState(false);
  const [checking, setChecking] = useState(true);
  const title = TAB_TITLES[activeTab] || "Admin Console";

  useEffect(() => {
    let isMounted = true;
    const testConnection = async () => {
      const result = await checkBackendHealth();
      if (isMounted) {
        setIsOnline(result.online);
        setChecking(false);
      }
    };

    testConnection();
    const interval = setInterval(testConnection, 15000); // Check every 15s

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="navbar">
      <h1 className="navbar-title">{title}</h1>

      <div className="navbar-actions">
        <div
          className="status-badge"
          style={{
            backgroundColor: isOnline
              ? "rgba(16, 185, 129, 0.15)"
              : "rgba(239, 68, 68, 0.15)",
            color: isOnline ? "var(--accent-success)" : "var(--accent-danger)",
            borderColor: isOnline
              ? "rgba(16, 185, 129, 0.3)"
              : "rgba(239, 68, 68, 0.3)",
          }}
          title={isOnline ? "Backend is online at http://localhost:5000" : "Cannot reach backend at http://localhost:5000"}
        >
          <span
            className="status-dot"
            style={{
              backgroundColor: isOnline
                ? "var(--accent-success)"
                : "var(--accent-danger)",
              boxShadow: isOnline
                ? "0 0 6px var(--accent-success)"
                : "0 0 6px var(--accent-danger)",
            }}
          ></span>
          <span>{checking ? "Checking..." : isOnline ? "API Online (5000)" : "API Offline"}</span>
        </div>

        <div className="admin-avatar">
          <div className="avatar-badge">
            {user?.name ? user.name.substring(0, 2).toUpperCase() : "AD"}
          </div>
          <span style={{ fontSize: "14px", fontWeight: 500 }}>
            {user?.name || "Admin"}
          </span>
          <button className="btn-logout" onClick={onLogout} title="Log out from Admin session">
            Log Out
          </button>
        </div>
      </div>
    </header>
  );
}
