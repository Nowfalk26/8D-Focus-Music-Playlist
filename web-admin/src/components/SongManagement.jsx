import React, { useState, useEffect } from "react";
import { songsApi, categoriesApi } from "../api/api";

export default function SongManagement() {
  const [songs, setSongs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Modal & Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSong, setEditingSong] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    artist: "",
    category: "",
    audioUrl: "",
    imageUrl: "",
    duration: "",
    is8D: true,
  });
  const [formLoading, setFormLoading] = useState(false);

  // Audio preview player state
  const [playingSongId, setPlayingSongId] = useState(null);
  const [audioElement, setAudioElement] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [songsRes, catsRes] = await Promise.all([
        songsApi.getAll({
          search: searchQuery || undefined,
          category: selectedCategory || undefined,
        }),
        categoriesApi.getAll().catch(() => ({ data: { data: [] } })),
      ]);

      setSongs(songsRes.data?.data || []);
      setCategories(catsRes.data?.data || []);
    } catch (err) {
      setError("Failed to load songs from backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  const handleOpenAddModal = () => {
    setEditingSong(null);
    setFormData({
      title: "",
      artist: "",
      category: categories[0]?.name || "Focus",
      audioUrl: "",
      imageUrl: "",
      duration: "03:30",
      is8D: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (song) => {
    setEditingSong(song);
    setFormData({
      title: song.title,
      artist: song.artist,
      category: song.category,
      audioUrl: song.audioUrl,
      imageUrl: song.imageUrl || "",
      duration: song.duration || "",
      is8D: song.is8D !== undefined ? song.is8D : true,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSong(null);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.title || !formData.artist || !formData.category || !formData.audioUrl) {
      setError("Please fill in Title, Artist, Category, and Audio URL.");
      return;
    }

    try {
      setFormLoading(true);
      if (editingSong) {
        await songsApi.update(editingSong._id, formData);
        setSuccess("Song updated successfully!");
      } else {
        await songsApi.create(formData);
        setSuccess("New 8D track added successfully!");
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to save song.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteSong = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      setError("");
      await songsApi.delete(id);
      setSuccess(`Track "${title}" deleted successfully.`);
      if (playingSongId === id && audioElement) {
        audioElement.pause();
        setPlayingSongId(null);
      }
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to delete song.");
    }
  };

  const handleTogglePlay = (song) => {
    if (playingSongId === song._id) {
      if (audioElement) {
        audioElement.pause();
      }
      setPlayingSongId(null);
    } else {
      if (audioElement) {
        audioElement.pause();
      }
      const audio = new Audio(song.audioUrl);
      audio.play().catch((e) => {
        console.warn("Audio playback failed (check URL):", e);
        alert("Could not stream audio from: " + song.audioUrl);
      });
      audio.onended = () => setPlayingSongId(null);
      setAudioElement(audio);
      setPlayingSongId(song._id);
    }
  };

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
            8D Songs Management
          </h2>
          <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
            Upload, update, and organize focus and relaxation tracks
          </p>
        </div>

        <button
          className="btn-primary"
          style={{ width: "auto", margin: 0, padding: "10px 20px" }}
          onClick={handleOpenAddModal}
        >
          ➕ Add New 8D Track
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

      {/* Filter and Search Bar */}
      <div
        className="card"
        style={{
          padding: "16px 20px",
          display: "flex",
          gap: "16px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <form
          onSubmit={handleSearchSubmit}
          style={{ display: "flex", gap: "10px", flex: 1, minWidth: "240px" }}
        >
          <input
            type="text"
            className="form-input"
            placeholder="Search by title or artist..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            type="submit"
            className="btn-logout"
            style={{ padding: "0 16px", height: "42px" }}
          >
            Search
          </button>
        </form>

        <select
          className="form-input"
          style={{ width: "auto", minWidth: "180px", height: "42px" }}
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>

        {(searchQuery || selectedCategory) && (
          <button
            className="btn-logout"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("");
              setTimeout(loadData, 50);
            }}
          >
            Reset
          </button>
        )}
      </div>

      {/* Songs Table */}
      <div className="card" style={{ padding: "0" }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: "60px" }}>Cover</th>
                <th>Track Details</th>
                <th>Category</th>
                <th>8D Audio</th>
                <th>Duration</th>
                <th>Audio Preview</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
                    Loading music catalog...
                  </td>
                </tr>
              ) : songs.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "48px 20px" }}>
                    <div style={{ fontSize: "40px", marginBottom: "8px" }}>🎧</div>
                    <div style={{ fontSize: "16px", fontWeight: "600", color: "#fff", marginBottom: "4px" }}>
                      No songs found
                    </div>
                    <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
                      Click "Add New 8D Track" to upload your first focus music piece.
                    </p>
                  </td>
                </tr>
              ) : (
                songs.map((song) => (
                  <tr key={song._id}>
                    <td>
                      <div
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "8px",
                          backgroundColor: "var(--bg-input)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden",
                          fontSize: "20px",
                        }}
                      >
                        {song.imageUrl ? (
                          <img
                            src={song.imageUrl}
                            alt={song.title}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          "🎵"
                        )}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: "600", color: "#fff" }}>{song.title}</div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{song.artist}</div>
                    </td>

                    <td>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "3px 10px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "500",
                          backgroundColor: "rgba(6, 182, 212, 0.15)",
                          color: "var(--accent-cyan)",
                          border: "1px solid rgba(6, 182, 212, 0.3)",
                        }}
                      >
                        {song.category}
                      </span>
                    </td>

                    <td>
                      {song.is8D ? (
                        <span
                          style={{
                            display: "inline-block",
                            padding: "3px 10px",
                            borderRadius: "12px",
                            fontSize: "11px",
                            fontWeight: "600",
                            backgroundColor: "rgba(99, 102, 241, 0.2)",
                            color: "#818cf8",
                            border: "1px solid rgba(99, 102, 241, 0.4)",
                          }}
                        >
                          8D Spatial
                        </span>
                      ) : (
                        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Stereo</span>
                      )}
                    </td>

                    <td>
                      <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                        {song.duration || "--:--"}
                      </span>
                    </td>

                    <td>
                      <button
                        className="btn-logout"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "12px",
                          padding: "4px 10px",
                          color: playingSongId === song._id ? "var(--accent-cyan)" : "var(--text-main)",
                        }}
                        onClick={() => handleTogglePlay(song)}
                        title={playingSongId === song._id ? "Pause Audio" : "Stream Audio Preview"}
                      >
                        <span>{playingSongId === song._id ? "⏸ Pause" : "▶ Preview"}</span>
                      </button>
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "8px" }}>
                        <button
                          className="btn-action-edit"
                          onClick={() => handleOpenEditModal(song)}
                          title="Edit Track"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="btn-action-delete"
                          onClick={() => handleDeleteSong(song._id, song.title)}
                          title="Delete Track"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Song Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#fff" }}>
                {editingSong ? "✏️ Edit 8D Track" : "➕ Add New 8D Track"}
              </h3>
              <button className="btn-close" onClick={handleCloseModal}>
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div className="form-group">
                <label className="form-label">Song Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Deep Alpha Waves 8D"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Artist / Creator *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. NeuroFocus Studio"
                  value={formData.artist}
                  onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category *</label>
                {categories.length > 0 ? (
                  <select
                    className="form-input"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                    <option value="Focus">Focus</option>
                    <option value="Study">Study</option>
                    <option value="Relaxation">Relaxation</option>
                    <option value="Meditation">Meditation</option>
                    <option value="Binaural Beats">Binaural Beats</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Deep Focus"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  />
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Audio Stream URL *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="http://localhost:5000/uploads/music/track.mp3 or external URL"
                  value={formData.audioUrl}
                  onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Cover Artwork URL</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="http://localhost:5000/uploads/images/cover.jpg or web image"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="form-group">
                  <label className="form-label">Duration</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="04:20"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ justifyContent: "center" }}>
                  <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "22px", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={formData.is8D}
                      onChange={(e) => setFormData({ ...formData, is8D: e.target.checked })}
                      style={{ width: "16px", height: "16px", accentColor: "var(--accent-primary)" }}
                    />
                    <span>Is 8D Spatial Audio</span>
                  </label>
                </div>
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
                  {formLoading ? "Saving..." : editingSong ? "Save Changes" : "Create 8D Track"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
