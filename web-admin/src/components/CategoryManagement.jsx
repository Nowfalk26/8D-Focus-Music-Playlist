import React, { useState, useEffect } from "react";
import { categoriesApi, songsApi } from "../api/api";

const PRESET_CATEGORIES = [
  { name: "Deep Focus", desc: "Monotonic frequencies for intense coding & study" },
  { name: "Binaural Beats", desc: "Dual frequency theta and alpha wave stimulation" },
  { name: "Relaxation", desc: "Gentle 8D panning for stress reduction & calm" },
  { name: "Meditation", desc: "Ambient spatial soundscapes for mindfulness" },
  { name: "Ambient", desc: "Subtle atmospheric noise and focus hums" },
  { name: "Nature 8D", desc: "Spatial rain, river streams, and forest acoustic sounds" },
  { name: "Sleep & Rest", desc: "Delta frequency sleep-inducing spatial audio" },
];

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modal & Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    imageUrl: "",
  });
  const [formLoading, setFormLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [catRes, songsRes] = await Promise.all([
        categoriesApi.getAll(),
        songsApi.getAll().catch(() => ({ data: { data: [] } })),
      ]);

      setCategories(catRes.data?.data || []);
      setSongs(songsRes.data?.data || []);
    } catch (err) {
      setError("Failed to load categories. Verify backend connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getSongCountForCategory = (catName) => {
    return songs.filter(
      (s) => s.category && s.category.toLowerCase() === catName.toLowerCase()
    ).length;
  };

  const handleOpenAddModal = (preset = null) => {
    setEditingCategory(null);
    if (preset) {
      setFormData({
        name: preset.name,
        description: preset.desc,
        imageUrl: "",
      });
    } else {
      setFormData({
        name: "",
        description: "",
        imageUrl: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      description: cat.description || "",
      imageUrl: cat.imageUrl || "",
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.name.trim()) {
      setError("Category name is required.");
      return;
    }

    try {
      setFormLoading(true);
      if (editingCategory) {
        await categoriesApi.update(editingCategory._id, formData);
        setSuccess(`Category "${formData.name}" updated successfully!`);
      } else {
        await categoriesApi.create(formData);
        setSuccess(`Category "${formData.name}" created successfully!`);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to save category.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteCategory = async (id, name) => {
    const songCount = getSongCountForCategory(name);
    let confirmMsg = `Are you sure you want to delete category "${name}"?`;
    if (songCount > 0) {
      confirmMsg += ` Warning: There are ${songCount} track(s) assigned to this category.`;
    }

    if (!window.confirm(confirmMsg)) {
      return;
    }

    try {
      setError("");
      await categoriesApi.delete(id);
      setSuccess(`Category "${name}" deleted successfully.`);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to delete category.");
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
            Focus Categories Management
          </h2>
          <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
            Classify and group 8D audio tracks by study state, relaxation level, and brainwave type
          </p>
        </div>

        <button
          className="btn-primary"
          style={{ width: "auto", margin: 0, padding: "10px 20px" }}
          onClick={() => handleOpenAddModal()}
        >
          ➕ Add New Category
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

      {/* Quick Category Templates / Presets */}
      <div className="card" style={{ padding: "18px 22px", marginBottom: "24px" }}>
        <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "10px" }}>
          Suggested Focus Presets (click to create):
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {PRESET_CATEGORIES.map((preset) => {
            const alreadyExists = categories.some(
              (c) => c.name.toLowerCase() === preset.name.toLowerCase()
            );
            return (
              <button
                key={preset.name}
                className="btn-logout"
                style={{
                  fontSize: "12px",
                  padding: "5px 12px",
                  borderRadius: "20px",
                  opacity: alreadyExists ? 0.4 : 1,
                  borderColor: alreadyExists ? "var(--border-color)" : "var(--accent-cyan)",
                  color: alreadyExists ? "var(--text-muted)" : "var(--accent-cyan)",
                }}
                disabled={alreadyExists}
                onClick={() => handleOpenAddModal(preset)}
                title={alreadyExists ? "Category already added" : preset.desc}
              >
                {alreadyExists ? `✓ ${preset.name}` : `+ ${preset.name}`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Categories Table */}
      <div className="card" style={{ padding: "0" }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: "60px" }}>Icon</th>
                <th>Category Name</th>
                <th>Description</th>
                <th>Track Count</th>
                <th>Created Date</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
                    Loading categories...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "48px 20px" }}>
                    <div style={{ fontSize: "40px", marginBottom: "8px" }}>📁</div>
                    <div style={{ fontSize: "16px", fontWeight: "600", color: "#fff", marginBottom: "4px" }}>
                      No categories created yet
                    </div>
                    <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
                      Choose a suggested preset above or click "Add New Category" to start.
                    </p>
                  </td>
                </tr>
              ) : (
                categories.map((cat) => {
                  const songCount = getSongCountForCategory(cat.name);
                  return (
                    <tr key={cat._id}>
                      <td>
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "8px",
                            backgroundColor: "var(--bg-input)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                            fontSize: "18px",
                          }}
                        >
                          {cat.imageUrl ? (
                            <img
                              src={cat.imageUrl}
                              alt={cat.name}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          ) : (
                            "📁"
                          )}
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: "600", color: "#fff" }}>{cat.name}</div>
                      </td>

                      <td>
                        <div style={{ color: "var(--text-muted)", fontSize: "13px", maxWidth: "340px" }}>
                          {cat.description || "—"}
                        </div>
                      </td>

                      <td>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "3px 10px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: "600",
                            backgroundColor:
                              songCount > 0
                                ? "rgba(16, 185, 129, 0.15)"
                                : "rgba(255, 255, 255, 0.05)",
                            color: songCount > 0 ? "var(--accent-success)" : "var(--text-muted)",
                            border: `1px solid ${
                              songCount > 0
                                ? "rgba(16, 185, 129, 0.3)"
                                : "var(--border-color)"
                            }`,
                          }}
                        >
                          {songCount} {songCount === 1 ? "track" : "tracks"}
                        </span>
                      </td>

                      <td>
                        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                          {cat.createdAt
                            ? new Date(cat.createdAt).toLocaleDateString()
                            : "—"}
                        </span>
                      </td>

                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "8px" }}>
                          <button
                            className="btn-action-edit"
                            onClick={() => handleOpenEditModal(cat)}
                            title="Edit Category"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="btn-action-delete"
                            onClick={() => handleDeleteCategory(cat._id, cat.name)}
                            title="Delete Category"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#fff" }}>
                {editingCategory ? "✏️ Edit Category" : "➕ Add New Category"}
              </h3>
              <button className="btn-close" onClick={handleCloseModal}>
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div className="form-group">
                <label className="form-label">Category Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Deep Focus"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-input"
                  style={{ minHeight: "80px", resize: "vertical" }}
                  placeholder="Describe the focus or mood benefits of this category..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category Image / Icon URL</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="http://localhost:5000/uploads/images/cat.jpg or web URL"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                />
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
                  {formLoading ? "Saving..." : editingCategory ? "Save Changes" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
