import React, { useState } from "react";
import { usePlayer } from "../context/PlayerContext";
import LiveSearchAutocomplete from "./LiveSearchAutocomplete";

export default function SpotifyTopBar({ activeTab, onSelectTab, user, onLogout, isSidebarOpen, onToggleSidebar }) {
  const {
    audioMode,
    openModeSelector,
    setShowMiloChat,
    setShowFullPlayer,
  } = usePlayer();

  const [topSearch, setTopSearch] = useState("");
  const [activeCategoryPill, setActiveCategoryPill] = useState("All");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const categoryPills = [
    "All",
    "Music",
    "Podcasts",
    "Audiobooks",
    "Tamil Hits",
    "Spatial 8D",
  ];

  const modeBadge = {
    normal: { label: "Normal Music", short: "Normal", icon: "🎵", color: "text-neutral-200 border-white/20 bg-white/10" },
    "8d": { label: "8D Audio", short: "8D", icon: "🎧", color: "text-[#1DB954] border-[#1DB954]/40 bg-[#1DB954]/15" },
    "9d": { label: "9D Dimension", short: "9D", icon: "✨", color: "text-rose-400 border-rose-400/40 bg-rose-950/40" },
  }[audioMode || "8d"] || { label: "8D Audio", short: "8D", icon: "🎧", color: "text-[#1DB954] border-[#1DB954]/40 bg-[#1DB954]/15" };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (topSearch.trim()) {
      onSelectTab("search", topSearch.trim());
    } else {
      onSelectTab("search");
    }
  };

  const handlePillClick = (pill) => {
    setActiveCategoryPill(pill);
    if (pill === "Tamil Hits") onSelectTab("search", "Tamil Hits");
    else if (pill === "Spatial 8D") onSelectTab("search", "8D");
    else if (pill === "Music" || pill === "All") onSelectTab("search", "All");
    else onSelectTab("search", pill);
  };

  return (
    <header className={`sticky top-0 z-30 bg-[#121212]/95 backdrop-blur-xl border-b border-white/5 select-none transition-all ${activeTab === "library" || activeTab === "search" ? "hidden md:block" : ""}`}>
      {/* Upper Navigation & Search Row */}
      <div className="py-2.5 sm:py-3 px-4 sm:px-8 flex items-center justify-between gap-3 min-h-[64px]">
        {/* Left: History Navigation & Large Rounded Search Bar */}
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          {/* Sidebar Toggle Button (like ChatGPT & Antigravity) */}
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className={`w-9 h-9 rounded-xl hidden md:flex items-center justify-center transition-all active:scale-90 shrink-0 ${
                !isSidebarOpen
                  ? "bg-[#1ed760] text-black font-bold shadow-lg shadow-[#1ed760]/30 hover:scale-105"
                  : "bg-[#232323] hover:bg-[#2e2e2e] text-neutral-300 hover:text-white border border-white/5"
              }`}
              title={isSidebarOpen ? "Close menu" : "Open menu"}
              aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
            >
              <span className="material-symbols-outlined text-[20px] leading-none">
                {isSidebarOpen ? "dock_to_left" : "menu"}
              </span>
            </button>
          )}

          {/* Back & Forward Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => onSelectTab("home")}
              className="w-8 h-8 rounded-full bg-black/60 hover:bg-black text-neutral-300 hover:text-white flex items-center justify-center transition-colors active:scale-95 shadow-sm"
              title="Go to Home"
            >
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>
            <button
              onClick={() => onSelectTab("library")}
              className="w-8 h-8 rounded-full bg-black/60 hover:bg-black text-neutral-300 hover:text-white flex items-center justify-center transition-colors active:scale-95 shadow-sm"
              title="Go to Library"
            >
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>

          {/* Large Rounded Search Bar with Instant Autocomplete */}
          <LiveSearchAutocomplete
            variant="topbar"
            className="flex-1 max-w-md"
            value={topSearch}
            onChange={setTopSearch}
            onNavigate={onSelectTab}
            placeholder="What do you want to play?"
          />
        </div>

        {/* Right Action Toolbar */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Premium Button */}
          <button
            onClick={() => onSelectTab("orbit")}
            className="hidden lg:inline-flex spotify-action-btn bg-white hover:bg-neutral-200 text-black shadow-md"
            title="Flow 8D Premium Spatial Audio"
          >
            <span className="material-symbols-outlined text-sm font-bold text-amber-600">workspace_premium</span>
            <span>Explore Premium</span>
          </button>

          {/* Audio Universe Mode Switcher Pill */}
          <button
            onClick={openModeSelector}
            className={`spotify-action-btn border shadow-sm hover:brightness-125 ${modeBadge.color}`}
            title="Switch Audio Experience Mode (Normal Music, 8D Audio)"
          >
            <span>{modeBadge.icon}</span>
            <span className="font-mono text-[11px] uppercase tracking-wider hidden sm:inline">
              {modeBadge.label}
            </span>
            <span className="font-mono text-[11px] uppercase tracking-wider sm:hidden">
              {modeBadge.short}
            </span>
          </button>

          {/* Milo AI Assistant Button */}
          <button
            onClick={() => setShowMiloChat(true)}
            className="spotify-action-btn bg-purple-950/60 hover:bg-purple-900 border border-purple-500/40 text-purple-200 shadow-sm"
            title="Chat with Milo AI"
          >
            <span className="text-sm">🐱</span>
            <span className="hidden md:inline">Milo AI</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#1DB954] animate-pulse" />
          </button>

          {/* 360° Spatial Stage Control */}
          <button
            onClick={() => onSelectTab("orbit")}
            className="hidden sm:inline-flex spotify-action-btn bg-[#242424] hover:bg-[#2c2c2c] border border-white/5 text-neutral-300 hover:text-white"
            title="360° Binaural Stage"
          >
            <span className="material-symbols-outlined text-sm text-[#00f2fe]">spatial_audio_off</span>
            <span>360° Orbit</span>
          </button>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="spotify-action-btn-icon bg-[#242424] hover:bg-[#2c2c2c] text-neutral-300 hover:text-white relative"
              title="Notifications"
            >
              <span className="material-symbols-outlined text-lg">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#1DB954] border border-[#121212]" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-[#1e1e1e] border border-white/10 rounded-2xl p-4 shadow-2xl z-50 animate-fadeIn">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Notifications</h4>
                  <span className="text-[10px] text-[#1DB954] font-semibold">1 New</span>
                </div>
                <div className="space-y-2 pt-2">
                  <div className="p-2 rounded-xl bg-[#282828] text-xs">
                    <p className="font-bold text-white">🎵 312 Tamil Tracks Ready</p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      New trending Tamil romantic melodies, vibe tracks, and 8D spatial mixes loaded.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="inline-flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-full bg-[#242424] hover:bg-[#2c2c2c] border border-white/5 text-white transition-colors leading-none"
            >
              <div className="w-7 h-7 rounded-full bg-[#1DB954] text-black inline-flex items-center justify-center font-bold text-xs shadow-sm leading-none">
                {user?.name ? user.name[0].toUpperCase() : "U"}
              </div>
              <span className="text-xs font-semibold hidden md:inline truncate max-w-[100px] leading-none">
                {user?.name || "Listener"}
              </span>
              <span className="material-symbols-outlined text-sm text-neutral-400">
                {showProfileMenu ? "expand_less" : "expand_more"}
              </span>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-[#1e1e1e] border border-white/10 rounded-2xl p-2 shadow-2xl z-50 animate-fadeIn">
                <div className="px-3 py-2 border-b border-white/10">
                  <p className="text-xs font-bold text-white truncate">{user?.name || "Guest Listener"}</p>
                  <p className="text-[10px] text-neutral-400 capitalize">{user?.role || "Free Plan"}</p>
                </div>
                <div className="pt-1 space-y-0.5">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onSelectTab("taste");
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-neutral-200 hover:text-white hover:bg-[#282828] flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">insights</span>
                    <span>Music Taste DNA</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onSelectTab("library", "Favorites");
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-neutral-200 hover:text-white hover:bg-[#282828] flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">favorite</span>
                    <span>Liked Songs</span>
                  </button>
                  {onLogout && (
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onLogout();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 border-t border-white/5 mt-1 pt-2"
                    >
                      <span className="material-symbols-outlined text-sm">logout</span>
                      <span>Log out</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lower Compact Pill-Style Category Filter Row */}
      <div className="px-4 sm:px-8 py-2.5 flex items-center gap-2.5 overflow-x-auto no-scrollbar border-t border-white/5 bg-[#121212]/40">
        {categoryPills.map((pill) => {
          const isActive = activeCategoryPill === pill;
          return (
            <button
              key={pill}
              onClick={() => handlePillClick(pill)}
              className={`spotify-cat-btn !text-xs !min-h-[32px] !py-1.5 !px-4 ${
                isActive ? "spotify-cat-btn-active font-bold" : "spotify-cat-btn-inactive font-bold"
              }`}
            >
              <span className="inline-flex items-center justify-center text-center leading-none px-0.5">
                {pill}
              </span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
