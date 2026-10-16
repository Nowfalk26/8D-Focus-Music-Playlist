import React, { useState, useEffect } from "react";
import { categoriesApi } from "../api/api";
import { usePlayer } from "../context/PlayerContext";

export default function SpotifySidebar({ activeTab, onSelectTab }) {
  const { audioMode, favorites } = usePlayer();
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

  const primaryNavItems = [
    { id: "home", label: "Home", icon: "home" },
    { id: "search", label: "Search & Browse", icon: "search" },
    { id: "library", label: "Your Library", icon: "library_music" },
    { id: "taste", label: "Music Taste DNA", icon: "insights", badge: "ML" },
    { id: "orbit", label: "360° Orbit Stage", icon: "spatial_audio_off", badge: "Live" },
    { id: "studio", label: "AI 8D Studio", icon: "tune" },
  ];

  const libraryItems = [
    { id: "library", label: "Your Library", icon: "library_music" },
    { id: "liked", label: "Liked Songs", icon: "favorite", isLiked: true, badge: `${favorites.size}` },
    { id: "playlists", label: "Playlists", icon: "queue_music" },
  ];

  const curatedTamilChannels = [
    { id: "tamil-love", label: "Tamil Love", categoryName: "Tamil Love", icon: "favorite_border", color: "text-rose-400" },
    { id: "tamil-melodies", label: "Tamil Melodies", categoryName: "Tamil Melodies", icon: "music_note", color: "text-cyan-400" },
    { id: "tamil-vibe", label: "Tamil Vibe", categoryName: "Tamil Vibe", icon: "bolt", color: "text-amber-400" },
    { id: "90s-classics", label: "90s & Classics", categoryName: "90s & Classics", icon: "album", color: "text-purple-400" },
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
    <aside className="hidden md:flex w-72 lg:w-80 h-full flex-col gap-2 shrink-0 select-none font-sans">
      {/* Top Card: Brand & Primary Navigation */}
      <div className="bg-[#121212] rounded-xl p-4 flex flex-col gap-3 shadow-md border border-white/5">
        {/* Brand Header */}
        <div
          onClick={() => onSelectTab("home")}
          className="flex items-center gap-3 cursor-pointer group pb-2 border-b border-white/5"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1DB954] to-[#128a3c] flex items-center justify-center shadow-lg shadow-[#1DB954]/20 group-hover:scale-105 transition-transform shrink-0">
            <span className="material-symbols-outlined text-black text-2xl font-black">graphic_eq</span>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-lg font-black text-white tracking-tight font-display">Flow 8D</span>
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-[#1DB954] text-black tracking-wide">
                SPATIAL
              </span>
            </div>
            <span className="text-[11px] font-semibold text-neutral-400 tracking-wide truncate">
              Spatial Audio Experience
            </span>
          </div>
        </div>

        {/* Primary Links */}
        <nav className="flex flex-col gap-1">
          {primaryNavItems.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 leading-none ${
                  active
                    ? "text-white bg-[#282828] font-bold shadow-sm"
                    : "text-neutral-400 hover:text-white hover:bg-[#1a1a1a]"
                }`}
              >
                <div className="flex items-center gap-3.5 leading-none">
                  <span
                    className={`material-symbols-outlined text-xl transition-colors ${
                      active ? "text-[#1DB954]" : "text-neutral-400"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="leading-none">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#1DB954]/20 text-[#1DB954] border border-[#1DB954]/30 leading-none">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Card: "Your Library" & Curated Channels Dock */}
      <div className="bg-[#121212] rounded-xl flex-1 flex flex-col p-3.5 overflow-hidden shadow-md border border-white/5">
        {/* Library Header */}
        <div className="flex items-center justify-between px-2 pt-1 pb-2 mb-4" style={{ marginBottom: "16px" }}>
          <button
            onClick={() => onSelectTab("library")}
            className="flex items-center gap-3 text-neutral-300 hover:text-white transition-colors group"
          >
            <span className="material-symbols-outlined text-2xl text-[#1DB954]">library_music</span>
            <span className="text-sm font-bold tracking-tight">Your Library</span>
          </button>
          <button
            onClick={() => onSelectTab("library")}
            className="w-8 h-8 rounded-full hover:bg-[#282828] text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
            title="Browse all tracks"
          >
            <span className="material-symbols-outlined text-lg">add</span>
          </button>
        </div>

        {/* Quick Library Filter Chips */}
        <div className="flex items-center gap-3 px-2 py-2 mb-5 overflow-x-auto no-scrollbar shrink-0" style={{ marginBottom: "20px" }}>
          {["all", "playlists", "8D", "favorites"].map((f) => (
            <button
              key={f}
              onClick={() => {
                setLibraryFilter(f);
                if (f === "favorites") onSelectTab("library", "Favorites");
                else if (f === "8D") onSelectTab("library", "8D");
              }}
              className={`spotify-cat-btn !text-xs !min-h-[34px] !py-2 !px-4 capitalize ${
                libraryFilter === f ? "spotify-cat-btn-active" : "spotify-cat-btn-inactive"
              }`}
            >
              {f === "8D" ? "8D Spatial" : f === "favorites" ? "Liked" : f}
            </button>
          ))}
        </div>

        {/* Scrollable Channels & Playlists Container */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-3.5 pr-1.5" style={{ paddingTop: "4px" }}>
          {/* Liked Songs Entry */}
          <div
            onClick={() => onSelectTab("library", "Favorites")}
            className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-[#1a1a1a] cursor-pointer group transition-colors mb-4"
            style={{ marginBottom: "16px" }}
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#450af5] to-[#8e8ee5] flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                favorite
              </span>
            </div>
            <div className="min-w-0 flex-1 flex flex-col justify-center">
              <h4 className="text-sm font-bold text-white truncate group-hover:text-[#1DB954] transition-colors leading-snug">
                Liked Songs
              </h4>
              <p className="text-xs text-neutral-400 truncate flex items-center gap-1.5 leading-normal mt-1.5">
                <span className="material-symbols-outlined text-[14px] text-[#1DB954]">push_pin</span>
                <span className="text-[#1DB954] font-medium">Pinned</span>
                <span>•</span>
                <span>{favorites.size} songs</span>
              </p>
            </div>
          </div>

          {/* Section Divider: Curated Tamil Channels */}
          <div className="pt-4 pb-2.5 px-2" style={{ paddingTop: "18px", paddingBottom: "10px" }}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 font-mono leading-normal block">
              Curated Tamil Channels
            </span>
          </div>

          <div className="space-y-2">
            {curatedTamilChannels.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelectTab("library", item.categoryName)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#1a1a1a] text-left transition-colors group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#202020] border border-white/5 flex items-center justify-center shrink-0 group-hover:bg-[#282828] group-hover:border-white/10 transition-all">
                    <span className={`material-symbols-outlined text-xl ${item.color}`}>
                      {item.icon}
                    </span>
                  </div>
                  <div className="min-w-0 flex flex-col justify-center">
                    <div className="text-xs sm:text-sm font-semibold text-neutral-200 group-hover:text-white truncate leading-snug">
                      {item.label}
                    </div>
                    <div className="text-[11px] text-neutral-500 truncate leading-normal mt-0.5">Spatial Playlist</div>
                  </div>
                </div>
                <span className="material-symbols-outlined text-neutral-600 group-hover:text-neutral-300 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  chevron_right
                </span>
              </button>
            ))}
          </div>

          {/* User & Dynamic Categories */}
          {filteredCategories.length > 0 && (
            <>
              <div className="pt-5 pb-2.5 px-2" style={{ paddingTop: "20px", paddingBottom: "10px" }}>
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 font-mono leading-normal block">
                  Custom Playlists
                </span>
              </div>
              <div className="space-y-2">
                {filteredCategories.map((cat, idx) => {
                  const catName = typeof cat === "string" ? cat : cat.name;
                  return (
                    <div
                      key={idx}
                      onClick={() => onSelectTab("library", catName)}
                      className="flex items-center gap-3.5 p-2.5 rounded-xl hover:bg-[#1a1a1a] cursor-pointer group transition-colors"
                    >
                      <div className="w-10 h-10 rounded-xl bg-[#242424] overflow-hidden shrink-0 border border-white/5">
                        <img
                          src={DEFAULT_PLAYLIST_COVER}
                          alt={catName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="min-w-0 flex-1 flex flex-col justify-center">
                        <h4 className="text-xs sm:text-sm font-semibold text-neutral-200 truncate group-hover:text-[#1DB954] transition-colors leading-snug">
                          {catName}
                        </h4>
                        <p className="text-[11px] text-neutral-500 truncate leading-normal mt-0.5">
                          Flow 8D • Tamil Mix
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Collapsible Admin Portal at Bottom */}
        <div className="pt-2 border-t border-white/5 mt-2">
          <button
            onClick={() => setIsAdminOpen(!isAdminOpen)}
            className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-semibold text-neutral-400 hover:text-white hover:bg-[#181818] transition-colors"
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-neutral-400">admin_panel_settings</span>
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
                      ? "text-[#1DB954] bg-[#282828] font-bold"
                      : "text-neutral-400 hover:text-white hover:bg-[#1a1a1a]"
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
