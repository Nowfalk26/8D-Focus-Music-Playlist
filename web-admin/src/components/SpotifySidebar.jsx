import React, { useState, useEffect } from "react";
import { categoriesApi } from "../api/api";
import { usePlayer } from "../context/PlayerContext";

export default function SpotifySidebar({ activeTab, onSelectTab }) {
  const { audioMode, favorites, isPlaying } = usePlayer();
  const [categories, setCategories] = useState([]);
  const [libraryFilter, setLibraryFilter] = useState("all");
  const [librarySearch, setLibrarySearch] = useState("");
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  useEffect(() => {
    categoriesApi
      .getAll()
      .then((res) => setCategories(res.data?.data || []))
      .catch(() => setCategories([]));
  }, []);

  const navItems = [
    { id: "home", label: "Home", icon: "home" },
    { id: "library", label: "Search & Library", icon: "search" },
    { id: "taste", label: "Music Taste DNA", icon: "insights", badge: "ML" },
    { id: "orbit", label: "360° Orbit Stage", icon: "spatial_audio_off", badge: "Live" },
    { id: "studio", label: "AI 8D Studio", icon: "tune" },
  ];

  const adminItems = [
    { id: "dashboard", label: "Admin Analytics", icon: "bar_chart" },
    { id: "songs", label: "Songs Catalog", icon: "queue_music" },
    { id: "categories", label: "Categories & Tags", icon: "folder_open" },
    { id: "users", label: "Users & Auth", icon: "group" },
  ];

  const DEFAULT_PLAYLIST_COVER =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCYHY4hp0r-GSzPdesFf5Z5mHQjlDX8zkLIjOdCA_IqUU_uw_nFr73ANifvOdaM2Q0NTsbK9ZB4CakHGH5fOSwA-_HynlD80C-hNL1oquc1m9K6gETHr9tKwpVJsxr8i3yXt8MxzxgSfUOhVYLQ8IqgfrlSGKs-61qE80eejtCqn6bE6dEiNbaAVFjYTn5bXQizoK0XcGh2VyyPyVMbGgVbr-Vnz7APr5Vg8HSuKiI1D50YhAVg3lfgaQ";

  const filteredCategories = categories.filter((c) => {
    const name = typeof c === "string" ? c : c.name;
    return name?.toLowerCase().includes(librarySearch.toLowerCase());
  });

  return (
    <aside className="w-72 lg:w-80 h-full flex flex-col gap-2 shrink-0 select-none font-sans">
      {/* Top Card: Primary Spotify Nav Dock */}
      <div className="bg-[#121212] rounded-lg p-4 flex flex-col gap-3 shadow-md">
        {/* Brand Header */}
        <div
          onClick={() => onSelectTab("home")}
          className="flex items-center gap-2.5 cursor-pointer group pb-2"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#b026ff] via-purple-600 to-[#00f2fe] flex items-center justify-center shadow-glow-cyan">
            <span className="material-symbols-outlined text-white text-base">graphic_eq</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-base font-extrabold text-white tracking-tight font-display">Flow</span>
            <span className="text-xs font-black px-1.5 py-0.5 rounded bg-gradient-to-r from-[#b026ff] to-[#00f2fe] text-obsidian-950">
              8D
            </span>
          </div>
        </div>

        {/* Primary Links */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-semibold transition-colors duration-150 ${
                  active
                    ? "text-white bg-[#282828]"
                    : "text-slate-400 hover:text-white hover:bg-[#1a1a1a]"
                }`}
              >
                <div className="flex items-center gap-4">
                  <span
                    className={`material-symbols-outlined text-xl ${
                      active ? "text-[#00f2fe]" : "text-slate-400"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#00f2fe]/20 text-[#00f2fe] border border-[#00f2fe]/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Card: "Your Library" Dock (Spotify Signature) */}
      <div className="bg-[#121212] rounded-lg flex-1 flex flex-col p-3 overflow-hidden shadow-md">
        {/* Library Header */}
        <div className="flex items-center justify-between px-2 py-1 mb-2">
          <button
            onClick={() => onSelectTab("library")}
            className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors group"
          >
            <span className="material-symbols-outlined text-2xl group-hover:text-white">library_music</span>
            <span className="text-sm font-bold">Your Library</span>
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onSelectTab("library")}
              className="w-7 h-7 rounded-full hover:bg-[#282828] text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              title="Browse all tracks"
            >
              <span className="material-symbols-outlined text-lg">add</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 px-1 pb-2 overflow-x-auto scrollbar-none">
          {["all", "playlists", "8D", "favorites"].map((f) => (
            <button
              key={f}
              onClick={() => setLibraryFilter(f)}
              className={`px-3 py-1 rounded-full text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                libraryFilter === f
                  ? "bg-white text-black font-bold"
                  : "bg-[#242424] text-white hover:bg-[#2a2a2a]"
              }`}
            >
              {f === "8D" ? "8D Spatial" : f === "favorites" ? "Liked" : f}
            </button>
          ))}
        </div>

        {/* Search & Sort row */}
        <div className="flex items-center justify-between px-2 py-1 text-slate-400 text-xs">
          <div className="relative flex-1 mr-2">
            <input
              type="text"
              placeholder="Search in Library..."
              value={librarySearch}
              onChange={(e) => setLibrarySearch(e.target.value)}
              className="w-full bg-[#1e1e1e] border-0 rounded-full py-1 pl-7 pr-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-white/20"
            />
            <span className="material-symbols-outlined absolute left-2 top-1 text-sm text-slate-500">
              search
            </span>
          </div>
          <span className="text-[11px] font-medium text-slate-400 hover:text-white cursor-pointer flex items-center gap-0.5 shrink-0">
            Recents ▾
          </span>
        </div>

        {/* Scrollable Playlists & Categories List */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-1 mt-1 pr-1">
          {/* Liked Songs Pinned Item */}
          <div
            onClick={() => onSelectTab("library")}
            className="flex items-center gap-3 p-2 rounded-md hover:bg-[#1a1a1a] cursor-pointer group transition-colors"
          >
            <div className="w-12 h-12 rounded-md bg-gradient-to-br from-[#b026ff] via-indigo-600 to-[#00f2fe] flex items-center justify-center shrink-0 shadow-md">
              <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                favorite
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-semibold text-white truncate group-hover:text-[#00f2fe] transition-colors">
                Liked Songs
              </h4>
              <p className="text-xs text-slate-400 truncate flex items-center gap-1.5">
                <span className="text-[#00f2fe]">📌 Pinned</span>
                <span>•</span>
                <span>{favorites.size} songs</span>
              </p>
            </div>
          </div>

          {/* Categories / Playlists */}
          {(filteredCategories.length > 0
            ? filteredCategories
            : [
                { name: "Tamil Melodies 8D", count: 28 },
                { name: "Tamil High Energy 8D", count: 32 },
                { name: "Deep Flow State", count: 18 },
                { name: "Binaural Beats Focus", count: 14 },
                { name: "Tamil Indie & Pop 8D", count: 22 },
                { name: "Ambient Rain & Sleep", count: 10 },
              ]
          ).map((cat, idx) => {
            const catName = typeof cat === "string" ? cat : cat.name;
            return (
              <div
                key={idx}
                onClick={() => onSelectTab("library")}
                className="flex items-center gap-3 p-2 rounded-md hover:bg-[#1a1a1a] cursor-pointer group transition-colors"
              >
                <div className="w-12 h-12 rounded-md bg-[#242424] overflow-hidden shrink-0 border border-white/5">
                  <img
                    src={DEFAULT_PLAYLIST_COVER}
                    alt={catName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-semibold text-white truncate group-hover:text-[#00f2fe] transition-colors">
                    {catName}
                  </h4>
                  <p className="text-xs text-slate-400 truncate">
                    Playlist • Flow 8D
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Collapsible Admin Portal at Bottom */}
        <div className="pt-2 border-t border-[#242424] mt-2">
          <button
            onClick={() => setIsAdminOpen(!isAdminOpen)}
            className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base">admin_panel_settings</span>
              <span>Management Portal</span>
            </span>
            <span className="material-symbols-outlined text-sm">
              {isAdminOpen ? "expand_less" : "expand_more"}
            </span>
          </button>

          {isAdminOpen && (
            <div className="space-y-0.5 pt-1">
              {adminItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    activeTab === item.id
                      ? "text-[#00f2fe] bg-[#282828]"
                      : "text-slate-400 hover:text-white hover:bg-[#1a1a1a]"
                  }`}
                >
                  <span className="material-symbols-outlined text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
