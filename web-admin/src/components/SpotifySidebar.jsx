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
      className={`hidden md:flex h-full flex-col shrink-0 select-none font-sans bg-[#121212] rounded-2xl border border-[#262626] p-3 sm:p-3.5 shadow-xl transition-all duration-300 ease-in-out ${
        isSidebarOpen
          ? "w-52 lg:w-56 xl:w-60 opacity-100"
          : "w-0 p-0 m-0 overflow-hidden opacity-0 pointer-events-none"
      }`}
    >
      {/* Brand Header with GreenWave Audio Bars */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-2.5">
        <div
          onClick={() => onSelectTab("home")}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          {/* GreenWave Icon Bars */}
          <div className="flex items-center gap-0.5 px-1.5 py-1.5 rounded-xl bg-[#10b981]/15 text-[#10b981] group-hover:scale-105 transition-transform">
            <span className="w-0.5 h-2.5 bg-[#10b981] rounded-full animate-[pulse_1s_infinite_100ms]" />
            <span className="w-0.5 h-4 bg-[#10b981] rounded-full animate-[pulse_1s_infinite_300ms]" />
            <span className="w-0.5 h-2 bg-[#10b981] rounded-full animate-[pulse_1s_infinite_200ms]" />
            <span className="w-0.5 h-3 bg-[#10b981] rounded-full animate-[pulse_1s_infinite_400ms]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-white tracking-tight font-display">
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
            <span className="material-symbols-outlined text-base">dock_to_left</span>
          </button>
        )}
      </div>

      {/* Scrollable Navigation Sections with Image 1 spacing */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pr-0.5 pt-0.5">
        {/* SECTION 1: MENU */}
        <div>
          <p className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-mono mb-1.5">
            MENU
          </p>
          <nav className="space-y-0.5">
            {menuItems.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-[13px] font-semibold transition-all duration-150 ${
                    active
                      ? "text-[#10b981] bg-[#10b981]/15 font-bold shadow-sm border border-[#10b981]/30"
                      : "text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[18px] ${
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
          <p className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-mono mb-1.5">
            FOLDER
          </p>
          <nav className="space-y-0.5">
            {studioItems.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-[13px] font-semibold transition-all duration-150 ${
                    active
                      ? "text-[#10b981] bg-[#10b981]/15 font-bold shadow-sm border border-[#10b981]/30"
                      : "text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[18px] ${
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
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-[13px] font-semibold text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent transition-all"
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[18px] text-cyan-400">
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
          <div className="flex items-center justify-between px-2.5 mb-1.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-mono">
              PLAYLISTS
            </p>
            <button
              onClick={() => onSelectTab("library")}
              className="text-[10px] text-[#10b981] hover:underline font-semibold"
            >
              View all
            </button>
          </div>

          <div className="space-y-1">
            {samplePlaylists.map((pl) => (
              <div
                key={pl.id}
                onClick={() =>
                  pl.category
                    ? onSelectTab(pl.tab, pl.category)
                    : onSelectTab(pl.tab)
                }
                className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-white/5 cursor-pointer group transition-colors"
              >
                <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-[#1c2420] border border-white/5">
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
      <div className="pt-2.5 border-t border-white/5 mt-auto">
        <button
          onClick={onLogout || (() => onSelectTab("home"))}
          className="w-full h-9 flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs sm:text-[13px] font-semibold text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
