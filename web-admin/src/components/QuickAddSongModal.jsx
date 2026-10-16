import React, { useState } from "react";
import { songsApi } from "../api/api";
import { usePlayer } from "../context/PlayerContext";

const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80";

// Fallback high-fidelity audio streams for instant 1-click playback
const SAMPLE_AUDIO_URLS = [
  "https://aac.saavncdn.com/932/7cf7f8a9d9c3faa2633d1605e97ba4a5_160.mp4",
  "https://aac.saavncdn.com/001/cf795c655325785055b410f9e9cfda3a_160.mp4",
  "https://aac.saavncdn.com/267/35e80dc0e599d4db2f8d8b9d6a36f94b_160.mp4",
];

export default function QuickAddSongModal({
  isOpen,
  onClose,
  initialTitle = "",
  onSongAdded,
}) {
  const { playSong } = usePlayer();

  const [title, setTitle] = useState(initialTitle || "");
  const [artist, setArtist] = useState("Tamil Special");
  const [album, setAlbum] = useState("Flow 8D Exclusive");
  const [category, setCategory] = useState("Tamil Hits");
  const [audioMode, setAudioMode] = useState("8d");
  const [createBothModes, setCreateBothModes] = useState(true);
  const [audioUrl, setAudioUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Sync title when initialTitle changes
  React.useEffect(() => {
    if (initialTitle) {
      // Capitalize first letter of each word nicely
      const clean = initialTitle
        .trim()
        .replace(/\b\w/g, (c) => c.toUpperCase());
      setTitle(clean);
    }
  }, [initialTitle]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please provide a song title.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const finalAudioUrl =
        audioUrl.trim() ||
        SAMPLE_AUDIO_URLS[Math.floor(Math.random() * SAMPLE_AUDIO_URLS.length)];
      const finalImageUrl = imageUrl.trim() || DEFAULT_COVER;

      // Primary song
      const newSong = {
        title: title.trim(),
        artist: artist.trim() || "Tamil Artist",
        album: album.trim() || "Flow 8D Singles",
        composer: artist.trim() || "Flow 8D",
        category: category,
        genre: category.replace("Tamil ", ""),
        audioMode: audioMode,
        is8D: audioMode === "8d",
        audioUrl: finalAudioUrl,
        imageUrl: finalImageUrl,
        duration: "03:45",
        year: new Date().getFullYear(),
        language: "Tamil",
      };

      // 1. Create primary song
      const createdRes = await songsApi.create(newSong);
      const addedPrimary = createdRes.data?.data || newSong;

      // 2. If user selected "Create Both Normal & 8D", also add the sister track
      if (createBothModes) {
        const sisterMode = audioMode === "8d" ? "normal" : "8d";
        const sisterSong = {
          ...newSong,
          title:
            sisterMode === "8d"
              ? `${newSong.title} (8D Audio)`
              : newSong.title.replace(/\s*\(8D Audio\)/i, ""),
          audioMode: sisterMode,
          is8D: sisterMode === "8d",
        };
        await songsApi.create(sisterSong);
      }

      // Immediately play the new song
      playSong(addedPrimary);

      if (onSongAdded) {
        onSongAdded(addedPrimary);
      }

      onClose();
    } catch (err) {
      console.error("Failed to add song:", err);
      setError("Failed to add song to database. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg rounded-3xl bg-[#121820] border border-white/10 p-6 sm:p-8 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-emerald-500/20 blur-3xl rounded-full pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between mb-5 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <span className="material-symbols-outlined text-2xl">library_add</span>
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Add New Song to Database
              </h2>
              <p className="text-xs text-neutral-400">
                Save permanently to your Flow 8D library
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {/* Song Title */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
              Song Title <span className="text-emerald-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Magale, Kanna Veesi"
              className="w-full h-11 px-4 rounded-xl bg-[#1a222a] border border-white/10 focus:border-emerald-400 text-white text-sm outline-none transition-colors"
            />
          </div>

          {/* Artist & Movie / Album */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                Artist / Singer
              </label>
              <input
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="e.g. Sai Abhyankkar, A. R. Rahman"
                className="w-full h-11 px-4 rounded-xl bg-[#1a222a] border border-white/10 focus:border-emerald-400 text-white text-sm outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                Movie / Album
              </label>
              <input
                type="text"
                value={album}
                onChange={(e) => setAlbum(e.target.value)}
                placeholder="e.g. Baththa, Think Indie"
                className="w-full h-11 px-4 rounded-xl bg-[#1a222a] border border-white/10 focus:border-emerald-400 text-white text-sm outline-none transition-colors"
              />
            </div>
          </div>

          {/* Category & Audio Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-[#1a222a] border border-white/10 focus:border-emerald-400 text-white text-sm outline-none transition-colors"
              >
                <option value="Tamil Hits">Tamil Hits</option>
                <option value="Tamil Love">Tamil Love</option>
                <option value="Tamil Melodies">Tamil Melodies</option>
                <option value="Tamil Mass">Tamil Mass</option>
                <option value="Spatial 8D">Spatial 8D</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                Audio Experience Mode
              </label>
              <select
                value={audioMode}
                onChange={(e) => setAudioMode(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-[#1a222a] border border-white/10 focus:border-emerald-400 text-white text-sm outline-none transition-colors"
              >
                <option value="8d">🎧 8D Spatial Audio</option>
                <option value="normal">🎵 Normal Music</option>
              </select>
            </div>
          </div>

          {/* Audio URL (Optional, defaults to valid music stream) */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
              Audio Streaming URL{" "}
              <span className="text-neutral-500 lowercase font-normal">
                (optional — auto-generates if empty)
              </span>
            </label>
            <input
              type="url"
              value={audioUrl}
              onChange={(e) => setAudioUrl(e.target.value)}
              placeholder="https://.../song.mp3 or .mp4 (leave empty for auto stream)"
              className="w-full h-11 px-4 rounded-xl bg-[#1a222a] border border-white/10 focus:border-emerald-400 text-white text-xs outline-none transition-colors font-mono"
            />
          </div>

          {/* Toggle Create Both Modes */}
          <label className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 cursor-pointer hover:bg-white/[0.05] transition-colors">
            <input
              type="checkbox"
              checked={createBothModes}
              onChange={(e) => setCreateBothModes(e.target.checked)}
              className="w-4 h-4 accent-emerald-400 rounded cursor-pointer"
            />
            <div className="text-xs">
              <span className="font-semibold text-white block">
                Add both Normal and 8D Spatial Audio versions
              </span>
              <span className="text-neutral-400">
                Automatically creates paired tracks for full immersion
              </span>
            </div>
          </label>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-full text-xs font-semibold text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#1DB954]/25 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Adding to Database...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">check</span>
                  <span>Save Song Permanently</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
