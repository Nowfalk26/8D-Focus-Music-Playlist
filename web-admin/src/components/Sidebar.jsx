import React from "react";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "songs", label: "Songs Management", icon: "🎵" },
  { id: "categories", label: "Categories", icon: "📁" },
  { id: "users", label: "Users Overview", icon: "👥" },
];

export default function Sidebar({ activeTab, onSelectTab }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand-icon">🎧</div>
        <div>
          <div className="brand-title">8D FOCUS</div>
          <div className="brand-subtitle">Music Admin</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeTab === item.id ? "active" : ""}`}
            onClick={() => onSelectTab(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div>Backend: <strong>Express + MongoDB</strong></div>
        <div style={{ marginTop: "4px", fontSize: "11px", color: "var(--accent-cyan)" }}>
          v1.0.0 • Focus Suite
        </div>
      </div>
    </aside>
  );
}
