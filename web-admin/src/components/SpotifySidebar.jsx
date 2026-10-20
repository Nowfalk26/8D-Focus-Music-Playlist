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
      count: `${favorites.size} tracks`,
      cover: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=100&q=80",
      tab: "library",
      category: "Favorites",
    },
    {
      id: "hit-me-hard",
      title: "Hit Me Hard and Soft",
      count: "10 tracks",
      cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100&q=80",
      tab: "library",
    },
    {
      id: "happier-than-ever",
      title: "Happier Than Ever",
      count: "16 tracks",
      cover: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=100&q=80",
      tab: "library",
    },
    {
      id: "dont-smile",
      title: "Don't Smile at Me",
      count: "9 tracks",
      cover: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=100&q=80",
      tab: "library",
    },
  ];

  return (
    <aside
      className={`hidden md:flex h-full flex-col shrink-0 select-none font-sans bg-[#121212] rounded-2xl border border-[#282828] p-4 shadow-xl transition-all duration-300 ease-in-out ${
        isSidebarOpen
          ? "w-64 lg:w-72 opacity-100"
          : "w-0 p-0 m-0 overflow-hidden opacity-0 pointer-events-none"
      }`}
    >
      {/* Brand Header with GreenWave Audio Bars */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-3">
        <div
          onClick={() => onSelectTab("home")}
          className="flex items-center gap-3 cursor-pointer group"
        >
          {/* GreenWave Icon Bars */}
          <div className="flex items-center gap-0.5 px-2 py-2 rounded-xl bg-[#10b981]/15 text-[#10b981] group-hover:scale-105 transition-transform">
            <span className="w-1 h-3 bg-[#10b981] rounded-full animate-[pulse_1s_infinite_100ms]" />
            <span className="w-1 h-5 bg-[#10b981] rounded-full animate-[pulse_1s_infinite_300ms]" />
            <span className="w-1 h-2 bg-[#10b981] rounded-full animate-[pulse_1s_infinite_200ms]" />
            <span className="w-1 h-4 bg-[#10b981] rounded-full animate-[pulse_1s_infinite_400ms]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold text-white tracking-tight font-display">
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
            className="w-7 h-7 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
            title="Collapse sidebar"
          >
            <span className="material-symbols-outlined text-lg">dock_to_left</span>
          </button>
        )}
      </div>

      {/* Scrollable Navigation Sections */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-5 pr-0.5">
        {/* SECTION 1: MENU */}
        <div>
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-neutral-500 font-mono mb-2">
            MENU
          </p>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    active
                      ? "text-[#10b981] bg-[#10b981]/15 font-bold shadow-sm border border-[#10b981]/30"
                      : "text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-lg ${
                      active ? "text-[#10b981]" : "text-neutral-400"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* SECTION 2: FOLDER & STUDIO */}
        <div>
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-neutral-500 font-mono mb-2">
            FOLDER
          </p>
          <nav className="space-y-1">
            {studioItems.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    active
                      ? "text-[#10b981] bg-[#10b981]/15 font-bold shadow-sm border border-[#10b981]/30"
                      : "text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-lg ${
                      active ? "text-[#10b981]" : "text-neutral-400"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Sound Universe Mode Trigger */}
            <button
              onClick={openModeSelector}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-lg text-cyan-400">
                  graphic_eq
                </span>
                <span>Spatial Sound</span>
              </div>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {audioMode?.toUpperCase() || "8D"}
              </span>
            </button>
          </nav>
        </div>

        {/* SECTION 3: PLAYLISTS CONTAINER */}
        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 font-mono">
              PLAYLISTS
            </p>
            <button
              onClick={() => onSelectTab("library")}
              className="text-[10px] text-[#10b981] hover:underline"
            >
              View all
            </button>
          </div>

          <div className="space-y-1.5">
            {samplePlaylists.map((pl) => (
              <div
                key={pl.id}
                onClick={() =>
                  pl.category
                    ? onSelectTab(pl.tab, pl.category)
                    : onSelectTab(pl.tab)
                }
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer group transition-colors"
              >
                <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-[#1c2420] border border-white/5">
                  <img
                    src={pl.cover}
                    alt={pl.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h5 className="text-xs font-semibold text-neutral-200 group-hover:text-white truncate">
                    {pl.title}
                  </h5>
                  <p className="text-[10px] text-neutral-500 truncate mt-0.5">
                    {pl.count}
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
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <span className="material-symbols-outlined text-lg">logout</span>
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
