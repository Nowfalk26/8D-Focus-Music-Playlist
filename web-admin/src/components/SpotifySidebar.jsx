import React, { useState } from "react";
import { usePlayer } from "../context/PlayerContext";

export default function SpotifySidebar({
  activeTab,
  onSelectTab,
  isSidebarOpen = true,
  onToggleSidebar,
  onLogout,
}) {
  const { audioMode, openModeSelector, favorites } = usePlayer();
  const [libraryFilter, setLibraryFilter] = useState("all"); // 'all' | 'playlists' | 'artists'

  const menuItems = [
    { id: "home", label: "Dashboard", icon: "dashboard" },
    { id: "search", label: "Files & Browse", icon: "folder_open" },
    { id: "library", label: "Your Library", icon: "folder_special" },
    { id: "taste", label: "Taste DNA", icon: "insights" },
  ];

  const studioItems = [
    { id: "orbit", label: "360° Video Orbit", icon: "videocam" },
    { id: "studio", label: "AI 8D Audio Studio", icon: "mic" },
  ];

  const samplePlaylists = [
    {
      id: "liked",
      title: "Liked Songs",
      count: `Playlist • ${favorites.size} songs`,
      cover: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=100&q=80",
      tab: "library",
      category: "Favorites",
      isLiked: true,
    },
    {
      id: "hit-me-hard",
      title: "Hit Me Hard and Soft",
      count: "Playlist • Billie Eilish",
      cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100&q=80",
      tab: "library",
    },
    {
      id: "happier-than-ever",
      title: "Happier Than Ever",
      count: "Playlist • Billie Eilish",
      cover: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=100&q=80",
      tab: "library",
    },
    {
      id: "dont-smile",
      title: "Don't Smile at Me",
      count: "Playlist • Billie Eilish",
      cover: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=100&q=80",
      tab: "library",
    },
    {
      id: "tamil-melodies",
      title: "Tamil 8D Melodies",
      count: "Playlist • Flow 8D Master",
      cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&q=80",
      tab: "library",
    },
  ];

  const sampleArtists = [
    {
      id: "art-1",
      title: "Billie Eilish",
      count: "Artist • Musician",
      cover: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=160&q=80",
      tab: "library",
      isArtist: true,
    },
    {
      id: "art-2",
      title: "Leonard Cohen.",
      count: "Artist • Musician",
      cover: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&q=80",
      tab: "library",
      isArtist: true,
    },
    {
      id: "art-3",
      title: "Jackson Wang",
      count: "Artist • Musician",
      cover: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&q=80",
      tab: "library",
      isArtist: true,
    },
    {
      id: "art-4",
      title: "Dazara Wilde",
      count: "Artist • Musician",
      cover: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&q=80",
      tab: "library",
      isArtist: true,
    },
  ];

  const filteredLibraryItems = [
    ...(libraryFilter === "artists" ? [] : samplePlaylists),
    ...(libraryFilter === "playlists" ? [] : sampleArtists),
  ];

  return (
    <aside
      className={`hidden md:flex h-full flex-col shrink-0 select-none font-sans bg-[#121212] rounded-2xl border border-[#262626] p-3 sm:p-4 shadow-xl transition-all duration-300 ease-in-out ${
        isSidebarOpen
          ? "w-64 lg:w-72 xl:w-72 opacity-100"
          : "w-0 p-0 m-0 overflow-hidden opacity-0 pointer-events-none"
      }`}
    >
      {/* Brand Header with GreenWave Audio Bars */}
      <div className="flex items-center justify-between pb-3.5 border-b border-white/5 mb-3">
        <div
          onClick={() => onSelectTab("home")}
          className="flex items-center gap-3 cursor-pointer group"
        >
          {/* GreenWave Icon Bars */}
          <div className="flex items-center gap-0.5 px-2 py-2 rounded-xl bg-[#10b981]/15 text-[#10b981] group-hover:scale-105 transition-transform">
            <span className="w-0.5 h-3 bg-[#10b981] rounded-full animate-[pulse_1s_infinite_100ms]" />
            <span className="w-0.5 h-4.5 bg-[#10b981] rounded-full animate-[pulse_1s_infinite_300ms]" />
            <span className="w-0.5 h-2.5 bg-[#10b981] rounded-full animate-[pulse_1s_infinite_200ms]" />
            <span className="w-0.5 h-3.5 bg-[#10b981] rounded-full animate-[pulse_1s_infinite_400ms]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-sm sm:text-base font-bold text-white tracking-tight font-display">
                GreenWave
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#10b981] text-black">
                8D
              </span>
            </div>
            <span className="text-[10px] text-neutral-400 font-mono">
              Spatial Audio Dashboard
            </span>
          </div>
        </div>

        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="w-8 h-8 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
            title="Collapse sidebar"
          >
            <span className="material-symbols-outlined text-lg">dock_to_left</span>
          </button>
        )}
      </div>

      {/* Scrollable Navigation Sections with Comfortable Vertical Spacing */}
      <div className="flex-1 overflow-y-auto min-h-0 space-y-5 pr-1 custom-scrollbar pt-1">
        {/* SECTION 1: MENU */}
        <div>
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-mono mb-2">
            MENU
          </p>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-[13px] font-semibold transition-all duration-150 ${
                    active
                      ? "text-[#10b981] bg-[#10b981]/15 font-bold shadow-sm border border-[#10b981]/30"
                      : "text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[20px] shrink-0 ${
                      active ? "text-[#10b981]" : "text-neutral-400"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* SECTION 2: FOLDER & STUDIO */}
        <div>
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-mono mb-2">
            SPATIAL STUDIO
          </p>
          <nav className="space-y-1">
            {studioItems.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-[13px] font-semibold transition-all duration-150 ${
                    active
                      ? "text-[#10b981] bg-[#10b981]/15 font-bold shadow-sm border border-[#10b981]/30"
                      : "text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[20px] shrink-0 ${
                      active ? "text-[#10b981]" : "text-neutral-400"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}

            {/* Sound Universe Mode Trigger */}
            <button
              onClick={openModeSelector}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-[13px] font-semibold text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="material-symbols-outlined text-[20px] text-cyan-400 shrink-0">
                  graphic_eq
                </span>
                <span className="truncate">Spatial Sound</span>
              </div>
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shrink-0">
                {audioMode?.toUpperCase() || "8D"}
              </span>
            </button>
          </nav>
        </div>

        {/* SECTION 3: YOUR LIBRARY (Playlists & Artists with Comfortable Spacing) */}
        <div>
          <div className="flex items-center justify-between px-3 mb-2.5">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-[#10b981]">folder_special</span>
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-300 font-mono">
                YOUR LIBRARY
              </p>
            </div>
            <button
              onClick={() => onSelectTab("library")}
              className="text-[11px] text-[#10b981] hover:underline font-semibold"
            >
              View all
            </button>
          </div>

          {/* Filter Pills (All / Playlists / Artists) */}
          <div className="flex items-center gap-1.5 px-2 mb-3">
            {[
              { id: "all", label: "All" },
              { id: "playlists", label: "Playlists" },
              { id: "artists", label: "Artists" },
            ].map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => setLibraryFilter(chip.id)}
                className={`h-6 px-2.5 rounded-full text-[11px] font-medium transition-colors ${
                  libraryFilter === chip.id
                    ? "bg-white/20 text-white font-bold"
                    : "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Comfortable Playlists & Artists List */}
          <div className="space-y-1.5">
            {filteredLibraryItems.map((item) => (
              <div
                key={item.id}
                onClick={() =>
                  item.category
                    ? onSelectTab(item.tab, item.category)
                    : onSelectTab(item.tab)
                }
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer group transition-colors"
              >
                <div
                  className={`w-10 h-10 overflow-hidden shrink-0 bg-[#1c2420] border border-white/5 shadow-sm ${
                    item.isArtist ? "rounded-full" : "rounded-xl"
                  }`}
                >
                  <img
                    src={item.cover}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h5 className="text-xs sm:text-[13px] font-semibold text-neutral-200 group-hover:text-white truncate leading-tight">
                    {item.title}
                  </h5>
                  <p className="text-[11px] text-neutral-400 truncate mt-1 leading-none font-normal">
                    {item.count}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Log Out Section */}
      <div className="pt-3 border-t border-white/5 mt-auto">
        <button
          onClick={onLogout || (() => onSelectTab("home"))}
          className="w-full h-10 flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs sm:text-[13px] font-semibold text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
