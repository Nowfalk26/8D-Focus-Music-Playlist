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
    duration: "03:30",
    is8D: true,
    audioMode: "8d",
  });
  const [formLoading, setFormLoading] = useState(false);

  // Audio preview player state
  const [playingSongId, setPlayingSongId] = useState(null);
  const [audioElement, setAudioElement] = useState(null);

  const DEFAULT_COVER =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCYHY4hp0r-GSzPdesFf5Z5mHQjlDX8zkLIjOdCA_IqUU_uw_nFr73ANifvOdaM2Q0NTsbK9ZB4CakHGH5fOSwA-_HynlD80C-hNL1oquc1m9K6gETHr9tKwpVJsxr8i3yXt8MxzxgSfUOhVYLQ8IqgfrlSGKs-61qE80eejtCqn6bE6dEiNbaAVFjYTn5bXQizoK0XcGh2VyyPyVMbGgVbr-Vnz7APr5Vg8HSuKiI1D50YhAVg3lfgaQ";

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
      category: categories[0]?.name || "Tamil Melodies 8D",
      audioUrl: "",
      imageUrl: "",
      duration: "03:30",
      is8D: true,
      audioMode: "8d",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (song) => {
    setEditingSong(song);
    setFormData({
      title: song.title || "",
      artist: song.artist || "",
      category: song.category || "",
      audioUrl: song.audioUrl || "",
      imageUrl: song.imageUrl || "",
      duration: song.duration || "03:30",
      is8D: song.is8D !== false,
      audioMode: song.audioMode || "8d",
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

    if (!formData.title || !formData.audioUrl) {
      setError("Title and Audio URL are required.");
      return;
    }

    try {
      setFormLoading(true);

      if (editingSong) {
        await songsApi.update(editingSong._id || editingSong.id, formData);
        setSuccess(`"${formData.title}" updated successfully.`);
      } else {
        await songsApi.create(formData);
        setSuccess(`"${formData.title}" added to catalog.`);
      }

      handleCloseModal();
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save song.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteSong = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      setError("");
      setSuccess("");
      await songsApi.delete(id);
      setSuccess(`"${title}" deleted successfully.`);
      loadData();
    } catch (err) {
      setError("Failed to delete song.");
    }
  };

  const handleTogglePreview = (song) => {
    if (playingSongId === (song._id || song.id)) {
      if (audioElement) {
        audioElement.pause();
      }
      setPlayingSongId(null);
    } else {
      if (audioElement) {
        audioElement.pause();
      }
      const audio = new Audio(song.audioUrl);
      audio.play().catch(() => setError("Unable to play preview audio."));
      audio.onended = () => setPlayingSongId(null);
      setAudioElement(audio);
      setPlayingSongId(song._id || song.id);
    }
  };

  useEffect(() => {
    return () => {
      if (audioElement) {
        audioElement.pause();
      }
    };
  }, [audioElement]);

  return (
    <div className="w-full flex flex-col font-sans text-neutral-200 select-none p-4 sm:p-8 space-y-6 pb-28">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#1DB954] font-mono">
            Catalog Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5">
            Songs Repository
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Browse, upload, preview, and edit audio files and spatial metadata
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-5 py-2.5 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-black text-xs font-bold flex items-center gap-2 transition-all active:scale-95 shadow-md shadow-[#1DB954]/20 shrink-0"
        >
          <span className="material-symbols-outlined text-base font-bold">add</span>
          <span>Add New Track</span>
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

      {/* Filter and Search Bar */}
      <div className="bg-[#181818] border border-white/5 rounded-2xl p-4 flex flex-wrap gap-3 items-center justify-between shadow-md">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1 min-w-[260px]">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-neutral-400 text-sm">
              search
            </span>
            <input
              type="text"
              className="w-full bg-[#242424] border border-white/10 rounded-full py-2 pl-9 pr-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#1DB954]"
              placeholder="Search by title or artist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-all active:scale-95 border border-white/10"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2">
          <select
            className="bg-[#242424] border border-white/10 rounded-full px-4 py-2 text-xs text-neutral-300 focus:outline-none focus:border-[#1DB954] cursor-pointer"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id || c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          {(searchQuery || selectedCategory) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("");
                setTimeout(loadData, 50);
              }}
              className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white text-xs transition-colors"
            >
              Reset ✕
            </button>
          )}
        </div>
      </div>

      {/* Songs Table */}
      <div className="bg-[#181818] border border-white/5 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#141414] border-b border-white/5 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                <th className="py-3 px-4 w-12 text-center">Cover</th>
                <th className="py-3 px-4">Track Details</th>
                <th className="py-3 px-4 hidden md:table-cell">Category</th>
                <th className="py-3 px-4 hidden sm:table-cell">Mode</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4 text-center">Preview</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-neutral-500 font-mono">
                    Loading music catalog...
                  </td>
                </tr>
              ) : songs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-16 text-center text-neutral-400">
                    <span className="material-symbols-outlined text-4xl text-neutral-600 block mb-2">music_off</span>
                    <p className="font-bold text-white text-sm">No songs found</p>
                    <p className="text-xs text-neutral-500 mt-1">Try adjusting your filters or click "Add New Track".</p>
                  </td>
                </tr>
              ) : (
                songs.map((song) => {
                  const isThisPlaying = playingSongId === (song._id || song.id);
                  return (
                    <tr key={song._id || song.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-black shadow-sm relative">
                          <img
                            src={song.imageUrl || DEFAULT_COVER}
                            alt={song.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = DEFAULT_COVER;
                            }}
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4 min-w-[180px]">
                        <p className="font-bold text-white truncate max-w-xs">{song.title}</p>
                        <p className="text-neutral-400 text-[11px] truncate mt-0.5">{song.artist || "Flow 8D Artist"}</p>
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] bg-white/5 text-neutral-300 font-medium">
                          {song.category || "Tamil Melodies"}
                        </span>
                      </td>
                      <td className="py-3 px-4 hidden sm:table-cell">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            song.audioMode === "normal"
                              ? "bg-purple-900/40 text-purple-300 border border-purple-500/30"
                              : song.audioMode === "9d"
                              ? "bg-rose-900/40 text-rose-300 border border-rose-500/30"
                              : "bg-[#1DB954]/15 text-[#1DB954] border border-[#1DB954]/30"
                          }`}
                        >
                          {song.audioMode?.toUpperCase() || "8D"}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-neutral-400">
                        {song.duration || "03:30"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleTogglePreview(song)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                            isThisPlaying
                              ? "bg-[#1DB954] text-black scale-105"
                              : "bg-white/10 hover:bg-white/20 text-white"
                          }`}
                          title={isThisPlaying ? "Pause Preview" : "Play Preview"}
                        >
                          <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                            {isThisPlaying ? "pause" : "play_arrow"}
                          </span>
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(song)}
                            className="px-3 py-1 rounded-full bg-white/10 hover:bg-[#1DB954] hover:text-black text-white text-[11px] font-semibold transition-all"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteSong(song._id || song.id, song.title)}
                            className="px-3 py-1 rounded-full bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white text-[11px] font-semibold transition-all"
                          >
                            Delete
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

      {/* Add / Edit Song Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="relative w-full max-w-lg bg-[#181818] border border-white/10 rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[90vh] select-none">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="text-lg font-bold text-white tracking-tight">
                {editingSong ? "Edit Audio Track" : "Add New Audio Track"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Track Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chuttamalle"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-[#242424] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#1DB954]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Artist / Composer</label>
                <input
                  type="text"
                  placeholder="e.g. Anirudh Ravichander"
                  value={formData.artist}
                  onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                  className="w-full bg-[#242424] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#1DB954]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-[#242424] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#1DB954]"
                  >
                    {categories.map((c) => (
                      <option key={c._id || c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Audio Mode</label>
                  <select
                    value={formData.audioMode}
                    onChange={(e) => setFormData({ ...formData, audioMode: e.target.value })}
                    className="w-full bg-[#242424] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#1DB954]"
                  >
                    <option value="8d">8D Audio</option>
                    <option value="normal">Normal Music</option>
                    <option value="9d">9D Dimension</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Audio Stream URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://...mp3"
                  value={formData.audioUrl}
                  onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
                  className="w-full bg-[#242424] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#1DB954]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Album Cover Artwork URL</label>
                <input
                  type="url"
                  placeholder="https://...jpg"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full bg-[#242424] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#1DB954]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
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
                  {formLoading ? "Saving..." : editingSong ? "Update Track" : "Save Track"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
