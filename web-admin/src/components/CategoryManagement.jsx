import React, { useState, useEffect } from "react";
import { categoriesApi, songsApi } from "../api/api";

const PRESET_CATEGORIES = [
  { name: "Tamil Melodies 8D", desc: "Soulful romantic melodies with dynamic binaural panning" },
  { name: "Tamil High Energy 8D", desc: "Fast-paced club and kuthu beats with high velocity orbit" },
  { name: "Deep Flow State", desc: "Monotonic frequencies for intense coding & study" },
  { name: "Binaural Beats Focus", desc: "Dual frequency theta and alpha wave acoustic stimulation" },
  { name: "Tamil Indie & Pop 8D", desc: "Modern acoustic guitars and contemporary vocal harmonics" },
  { name: "Ambient Rain & Sleep", desc: "Spatial rain, river streams, and soothing focus white noise" },
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
    setFormData({
      name: preset ? preset.name : "",
      description: preset ? preset.desc : "",
      imageUrl: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name || "",
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
        await categoriesApi.update(editingCategory._id || editingCategory.id, formData);
        setSuccess(`"${formData.name}" updated successfully.`);
      } else {
        await categoriesApi.create(formData);
        setSuccess(`"${formData.name}" category created.`);
      }

      handleCloseModal();
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save category.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteCategory = async (id, name) => {
    const songCount = getSongCountForCategory(name);
    const confirmMsg =
      songCount > 0
        ? `Warning: Category "${name}" contains ${songCount} tracks. Delete anyway?`
        : `Are you sure you want to delete category "${name}"?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      setError("");
      setSuccess("");
      await categoriesApi.delete(id);
      setSuccess(`"${name}" deleted successfully.`);
      loadData();
    } catch (err) {
      setError("Failed to delete category.");
    }
  };

  return (
    <div className="w-full flex flex-col font-sans text-neutral-200 select-none p-4 sm:p-8 space-y-6 pb-28">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#1DB954] font-mono">
            Collection Architecture
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5">
            Categories & Tags
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Organize audio universes into themed playlists, moods, and spatial frequencies
          </p>
        </div>

        <button
          onClick={() => handleOpenAddModal()}
          className="px-5 py-2.5 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-black text-xs font-bold flex items-center gap-2 transition-all active:scale-95 shadow-md shadow-[#1DB954]/20 shrink-0"
        >
          <span className="material-symbols-outlined text-base font-bold">add</span>
          <span>Create Category</span>
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

      {/* Suggested Curated Presets Bar */}
      <div className="bg-[#181818] border border-white/5 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-[#1DB954] text-xl">auto_awesome</span>
          <h3 className="text-sm font-bold text-white tracking-tight">Recommended Presets</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {PRESET_CATEGORIES.map((preset, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-[#242424] border border-white/5 flex items-center justify-between hover:border-white/10 transition-colors"
            >
              <div className="min-w-0 pr-2">
                <p className="text-xs font-bold text-white truncate">{preset.name}</p>
                <p className="text-[11px] text-neutral-400 truncate mt-0.5">{preset.desc}</p>
              </div>
              <button
                onClick={() => handleOpenAddModal(preset)}
                className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-[#1DB954] hover:text-black text-white text-[10px] font-bold transition-all shrink-0"
              >
                + Add
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Categories Grid */}
      <div>
        <h3 className="text-base font-bold text-white tracking-tight mb-3">Active Categories ({categories.length})</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full py-12 text-center text-neutral-500 font-mono text-xs">
              Loading categories...
            </div>
          ) : categories.length === 0 ? (
            <div className="col-span-full py-12 text-center text-neutral-400">
              No categories found. Click "Create Category" to add one.
            </div>
          ) : (
            categories.map((cat) => {
              const count = getSongCountForCategory(cat.name);
              return (
                <div
                  key={cat._id || cat.name}
                  className="bg-[#181818] border border-white/5 hover:border-white/10 rounded-2xl p-5 shadow-md flex flex-col justify-between transition-all group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 rounded-xl bg-[#1DB954]/15 text-[#1DB954] flex items-center justify-center font-bold">
                        <span className="material-symbols-outlined text-xl">folder</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-white/10 text-neutral-300">
                        {count} tracks
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-white truncate group-hover:text-[#1DB954] transition-colors">
                      {cat.name}
                    </h4>
                    <p className="text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                      {cat.description || "Curated spatial music collection and playlists."}
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-white/5">
                    <button
                      onClick={() => handleOpenEditModal(cat)}
                      className="px-3 py-1 rounded-full bg-white/10 hover:bg-[#1DB954] hover:text-black text-white text-xs font-semibold transition-all"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat._id || cat.id, cat.name)}
                      className="px-3 py-1 rounded-full bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white text-xs font-semibold transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="relative w-full max-w-md bg-[#181818] border border-white/10 rounded-3xl p-6 shadow-2xl select-none">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="text-base font-bold text-white tracking-tight">
                {editingCategory ? "Edit Category" : "Create New Category"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tamil Melodies 8D"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#242424] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#1DB954]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Description</label>
                <textarea
                  rows="3"
                  placeholder="Brief description of this collection..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-[#242424] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#1DB954]"
                />
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
                  {formLoading ? "Saving..." : editingCategory ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
