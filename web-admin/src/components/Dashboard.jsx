import React, { useState, useEffect } from "react";
import { songsApi, categoriesApi } from "../api/api";

export default function Dashboard({ onNavigate }) {
  const [stats, setStats] = useState({
    totalSongs: 0,
    totalCategories: 0,
    total8DSongs: 0,
  });
  const [recentSongs, setRecentSongs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [songsRes, categoriesRes] = await Promise.all([
        songsApi.getAll().catch(() => ({ data: { data: [] } })),
        categoriesApi.getAll().catch(() => ({ data: { data: [] } })),
      ]);

      const songs = songsRes.data?.data || [];
      const cats = categoriesRes.data?.data || [];

      const count8D = songs.filter((s) => s.is8D !== false).length;

      setStats({
        totalSongs: songs.length,
        totalCategories: cats.length,
        total8DSongs: count8D,
      });

      setRecentSongs(songs.slice(0, 5));
      setCategories(cats);
    } catch (err) {
      setError("Failed to fetch dashboard metrics. Verify backend connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div>
      {/* Top Welcome Banner & Refresh */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <div>
          <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#fff", marginBottom: "4px" }}>
            Overview Dashboard
          </h2>
          <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
            Live metrics and spatial music catalog status
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          className="btn-logout"
          style={{ display: "flex", alignItems: "center", gap: "6px" }}
          title="Refresh statistics"
        >
          🔄 Refresh
        </button>
      </div>

      {error && (
        <div className="alert-error" style={{ marginBottom: "20px" }}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ background: "rgba(99, 102, 241, 0.15)", color: "#818cf8" }}
          >
            🎵
          </div>
          <div className="stat-info">
            <h3>{loading ? "..." : stats.totalSongs}</h3>
            <p>Total Tracks</p>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ background: "rgba(6, 182, 212, 0.15)", color: "#22d3ee" }}
          >
            📁
          </div>
          <div className="stat-info">
            <h3>{loading ? "..." : stats.totalCategories}</h3>
            <p>Active Categories</p>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ background: "rgba(168, 85, 247, 0.15)", color: "#c084fc" }}
          >
            🎧
          </div>
          <div className="stat-info">
            <h3>{loading ? "..." : stats.total8DSongs}</h3>
            <p>8D Spatial Audio Tracks</p>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34d399" }}
          >
            ⚡
          </div>
          <div className="stat-info">
            <h3 style={{ fontSize: "16px", color: "#34d399" }}>Live</h3>
            <p>REST API & MongoDB</p>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div
        className="card"
        style={{
          display: "flex",
          gap: "16px",
          alignItems: "center",
          flexWrap: "wrap",
          padding: "18px 24px",
        }}
      >
        <span style={{ fontSize: "14px", fontWeight: "600", color: "#fff" }}>
          Quick Actions:
        </span>
        <button
          className="btn-primary"
          style={{ width: "auto", padding: "8px 16px", margin: 0, fontSize: "13px" }}
          onClick={() => onNavigate("songs")}
        >
          ➕ Manage Songs
        </button>
        <button
          className="btn-logout"
          style={{ padding: "8px 16px", fontSize: "13px" }}
          onClick={() => onNavigate("categories")}
        >
          📁 Manage Categories
        </button>
      </div>

      {/* Grid: Recent Songs & Categories Overview */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
        {/* Recent Songs Preview */}
        <div className="card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <h3 className="card-title" style={{ margin: 0 }}>
              Recent 8D Tracks
            </h3>
            <button
              onClick={() => onNavigate("songs")}
              style={{
                background: "none",
                border: "none",
                color: "var(--accent-primary)",
                fontSize: "13px",
                cursor: "pointer",
                fontWeight: "500",
              }}
            >
              View All &rarr;
            </button>
          </div>

          {loading ? (
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Loading tracks...</p>
          ) : recentSongs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-muted)" }}>
              <div style={{ fontSize: "36px", marginBottom: "8px" }}>🎵</div>
              <p>No songs uploaded yet.</p>
              <button
                className="btn-primary"
                style={{ width: "auto", margin: "14px auto 0", padding: "8px 18px", fontSize: "13px" }}
                onClick={() => onNavigate("songs")}
              >
                Add Your First Track
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {recentSongs.map((song) => (
                <div
                  key={song._id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    backgroundColor: "var(--bg-sidebar)",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "6px",
                        backgroundColor: "var(--bg-card)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "18px",
                        overflow: "hidden",
                      }}
                    >
                      {song.imageUrl ? (
                        <img
                          src={song.imageUrl}
                          alt={song.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        "🎧"
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: "600", color: "#fff" }}>
                        {song.title}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                        {song.artist} • <span style={{ color: "var(--accent-cyan)" }}>{song.category}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {song.is8D && (
                      <span
                        style={{
                          fontSize: "11px",
                          padding: "2px 8px",
                          borderRadius: "12px",
                          backgroundColor: "rgba(99, 102, 241, 0.2)",
                          color: "#818cf8",
                          fontWeight: "600",
                        }}
                      >
                        8D Audio
                      </span>
                    )}
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      {song.duration || "--:--"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Categories Overview */}
        <div className="card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <h3 className="card-title" style={{ margin: 0 }}>
              Focus Categories
            </h3>
            <button
              onClick={() => onNavigate("categories")}
              style={{
                background: "none",
                border: "none",
                color: "var(--accent-cyan)",
                fontSize: "13px",
                cursor: "pointer",
                fontWeight: "500",
              }}
            >
              Manage &rarr;
            </button>
          </div>

          {loading ? (
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Loading categories...</p>
          ) : categories.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-muted)" }}>
              <div style={{ fontSize: "36px", marginBottom: "8px" }}>📁</div>
              <p>No categories defined.</p>
              <button
                className="btn-logout"
                style={{ margin: "14px auto 0", fontSize: "13px" }}
                onClick={() => onNavigate("categories")}
              >
                Add Category
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {categories.map((cat) => (
                <div
                  key={cat._id}
                  style={{
                    padding: "10px 12px",
                    backgroundColor: "var(--bg-sidebar)",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ fontSize: "13px", fontWeight: "600", color: "#fff" }}>
                    {cat.name}
                  </span>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    {cat.description ? `${cat.description.substring(0, 24)}...` : "Active"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
