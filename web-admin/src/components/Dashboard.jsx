import React, { useState, useEffect } from "react";
import { songsApi, categoriesApi } from "../api/api";
import { usePlayer } from "../context/PlayerContext";

export default function Dashboard({ onNavigate }) {
  const { playSong } = usePlayer();
  const [stats, setStats] = useState({
    totalSongs: 0,
    totalCategories: 0,
    total8DSongs: 0,
    totalNormalSongs: 0,
  });
  const [recentSongs, setRecentSongs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const DEFAULT_COVER =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCYHY4hp0r-GSzPdesFf5Z5mHQjlDX8zkLIjOdCA_IqUU_uw_nFr73ANifvOdaM2Q0NTsbK9ZB4CakHGH5fOSwA-_HynlD80C-hNL1oquc1m9K6gETHr9tKwpVJsxr8i3yXt8MxzxgSfUOhVYLQ8IqgfrlSGKs-61qE80eejtCqn6bE6dEiNbaAVFjYTn5bXQizoK0XcGh2VyyPyVMbGgVbr-Vnz7APr5Vg8HSuKiI1D50YhAVg3lfgaQ";

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

      const count8D = songs.filter((s) => s.is8D !== false && s.audioMode !== "normal").length;
      const countNormal = songs.filter((s) => s.audioMode === "normal" || s.is8D === false).length;

      setStats({
        totalSongs: songs.length,
        totalCategories: cats.length,
        total8DSongs: count8D,
        totalNormalSongs: countNormal,
      });

      setRecentSongs(songs.slice(0, 6));
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
    <div className="w-full flex flex-col font-sans text-neutral-200 select-none p-4 sm:p-8 space-y-6 pb-28">
      {/* Top Welcome Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#1DB954] font-mono">
            Administration Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5">
            Overview Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Real-time analytics, spatial audio metrics, and music library status
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 border border-white/10 shadow-sm"
            title="Refresh statistics"
          >
            <span className="material-symbols-outlined text-base">refresh</span>
            <span>Refresh</span>
          </button>
          <button
            onClick={() => onNavigate("songs")}
            className="px-5 py-2 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-black text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-md shadow-[#1DB954]/20"
          >
            <span className="material-symbols-outlined text-base">add</span>
            <span>Add Song</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2.5">
          <span className="material-symbols-outlined text-lg">warning</span>
          <span>{error}</span>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Tracks */}
        <div className="bg-[#181818] border border-white/5 rounded-2xl p-4 sm:p-5 flex items-center gap-4 hover:border-white/10 transition-all shadow-md group">
          <div className="w-12 h-12 rounded-xl bg-[#1DB954]/15 text-[#1DB954] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-2xl">music_note</span>
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Total Tracks</p>
            <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight mt-0.5">
              {loading ? "..." : stats.totalSongs}
            </h3>
            <span className="text-[10px] text-[#1DB954] font-medium flex items-center gap-1 mt-0.5">
              <span className="w-1 h-1 rounded-full bg-[#1DB954]" /> Verified Active
            </span>
          </div>
        </div>

        {/* 8D Spatial Audio Tracks */}
        <div className="bg-[#181818] border border-white/5 rounded-2xl p-4 sm:p-5 flex items-center gap-4 hover:border-white/10 transition-all shadow-md group">
          <div className="w-12 h-12 rounded-xl bg-[#00f2fe]/15 text-[#00f2fe] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-2xl">spatial_audio_off</span>
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">8D Spatial</p>
            <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight mt-0.5">
              {loading ? "..." : stats.total8DSongs}
            </h3>
            <span className="text-[10px] text-[#00f2fe] font-medium flex items-center gap-1 mt-0.5">
              <span className="w-1 h-1 rounded-full bg-[#00f2fe]" /> 360° Panning
            </span>
          </div>
        </div>

        {/* Normal Audio Tracks */}
        <div className="bg-[#181818] border border-white/5 rounded-2xl p-4 sm:p-5 flex items-center gap-4 hover:border-white/10 transition-all shadow-md group">
          <div className="w-12 h-12 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-2xl">headphones</span>
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Normal Stereo</p>
            <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight mt-0.5">
              {loading ? "..." : stats.totalNormalSongs}
            </h3>
            <span className="text-[10px] text-purple-400 font-medium flex items-center gap-1 mt-0.5">
              <span className="w-1 h-1 rounded-full bg-purple-400" /> Studio Master
            </span>
          </div>
        </div>

        {/* Categories */}
        <div className="bg-[#181818] border border-white/5 rounded-2xl p-4 sm:p-5 flex items-center gap-4 hover:border-white/10 transition-all shadow-md group">
          <div className="w-12 h-12 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-2xl">folder</span>
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Categories</p>
            <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight mt-0.5">
              {loading ? "..." : stats.totalCategories}
            </h3>
            <span className="text-[10px] text-amber-400 font-medium flex items-center gap-1 mt-0.5">
              <span className="w-1 h-1 rounded-full bg-amber-400" /> Curated Playlists
            </span>
          </div>
        </div>
      </div>

      {/* Two-Column Section: Recently Added Tracks & Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Tracks (2 cols) */}
        <div className="lg:col-span-2 bg-[#181818] border border-white/5 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Recent Additions</h2>
              <p className="text-xs text-neutral-400">Latest songs synchronized in the catalog</p>
            </div>
            <button
              onClick={() => onNavigate("songs")}
              className="text-xs font-semibold text-[#1DB954] hover:underline"
            >
              View All Catalog →
            </button>
          </div>

          <div className="mt-4 divide-y divide-white/5">
            {recentSongs.length > 0 ? (
              recentSongs.map((song, idx) => (
                <div
                  key={song._id || song.id || idx}
                  className="py-3 flex items-center justify-between gap-3 group hover:bg-white/[0.02] -mx-2 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0 bg-black relative shadow-sm">
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
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-semibold text-white truncate group-hover:text-[#1DB954] transition-colors">
                        {song.title}
                      </h4>
                      <p className="text-xs text-neutral-400 truncate mt-0.5">
                        {song.artist}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="hidden sm:inline text-[10px] font-mono bg-white/5 text-neutral-300 px-2 py-0.5 rounded">
                      {song.category || "Tamil Melodies"}
                    </span>
                    <button
                      onClick={() => playSong(song, recentSongs)}
                      className="w-8 h-8 rounded-full bg-[#1DB954] text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                      title="Play Preview"
                    >
                      <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                        play_arrow
                      </span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-neutral-500">
                {loading ? "Loading recent tracks..." : "No recent tracks available."}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Quick Navigation & Category Overview */}
        <div className="space-y-6">
          {/* Quick Actions Panel */}
          <div className="bg-[#181818] border border-white/5 rounded-2xl p-5 shadow-lg">
            <h3 className="text-base font-bold text-white tracking-tight mb-1">Quick Tools</h3>
            <p className="text-xs text-neutral-400 mb-4">Direct shortcuts to admin operations</p>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => onNavigate("songs")}
                className="w-full p-3 rounded-xl bg-[#242424] hover:bg-[#2a2a2a] flex items-center justify-between text-left transition-colors border border-white/5"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#1DB954]">library_music</span>
                  <div>
                    <p className="text-xs font-bold text-white">Songs Catalog</p>
                    <p className="text-[11px] text-neutral-400">Edit, add, or delete audio files</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-sm text-neutral-500">chevron_right</span>
              </button>

              <button
                onClick={() => onNavigate("categories")}
                className="w-full p-3 rounded-xl bg-[#242424] hover:bg-[#2a2a2a] flex items-center justify-between text-left transition-colors border border-white/5"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-amber-400">category</span>
                  <div>
                    <p className="text-xs font-bold text-white">Manage Categories</p>
                    <p className="text-[11px] text-neutral-400">Mood tags & playlist collections</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-sm text-neutral-500">chevron_right</span>
              </button>

              <button
                onClick={() => onNavigate("users")}
                className="w-full p-3 rounded-xl bg-[#242424] hover:bg-[#2a2a2a] flex items-center justify-between text-left transition-colors border border-white/5"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-purple-400">group</span>
                  <div>
                    <p className="text-xs font-bold text-white">User Accounts</p>
                    <p className="text-[11px] text-neutral-400">Roles and access control</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-sm text-neutral-500">chevron_right</span>
              </button>
            </div>
          </div>

          {/* Active Categories Summary */}
          <div className="bg-[#181818] border border-white/5 rounded-2xl p-5 shadow-lg">
            <h3 className="text-base font-bold text-white tracking-tight mb-1">Categories</h3>
            <p className="text-xs text-neutral-400 mb-3">Live collection distribution</p>

            <div className="flex flex-wrap gap-1.5">
              {categories.slice(0, 10).map((c, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#242424] text-neutral-300 border border-white/5 hover:border-white/10"
                >
                  {typeof c === "string" ? c : c.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
