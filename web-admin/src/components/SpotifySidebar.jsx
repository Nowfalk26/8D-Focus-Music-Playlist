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

  const menuNav = [
    { id: "home", label: "Dashboard", icon: "grid_view" },
    { id: "search", label: "Files & Browse", icon: "explore" },
    { id: "library", label: "Your Library", icon: "local_library" },
    { id: "taste", label: "Taste DNA", icon: "bubble_chart" },
  ];

  const studioNav = [
    { id: "orbit", label: "360° Video Orbit", icon: "360" },
    { id: "studio", label: "AI 8D Audio Studio", icon: "auto_awesome" },
  ];

  const playlists = [
    {
      id: "liked",
      title: "Liked Songs",
      subtitle: `Playlist • ${favorites.size} songs`,
      icon: "favorite",
      iconColor: "text-primary-container",
      tab: "library",
      category: "Favorites",
    },
    {
      id: "hit-me-hard",
      title: "Hit Me Hard and Soft",
      subtitle: "Playlist • Billie Eilish",
      icon: "queue_music",
      tab: "library",
    },
    {
      id: "happier-than-ever",
      title: "Happier Than Ever",
      subtitle: "Playlist • Billie Eilish",
      icon: "queue_music",
      tab: "library",
    },
    {
      id: "dont-smile",
      title: "Don't Smile at Me",
      subtitle: "Playlist • Billie Eilish",
      icon: "queue_music",
      tab: "library",
    },
    {
      id: "tamil-melodies",
      title: "Tamil 8D Melodies",
      subtitle: "Playlist • Flow 8D Master",
      icon: "headphones",
      iconColor: "text-secondary",
      tab: "library",
    },
    {
      id: "leonard-cohen",
      title: "Leonard Cohen",
      subtitle: "Artist • Folk & Poetry",
      icon: "queue_music",
      tab: "library",
    },
  ];

  return (
    <aside
      className={`hidden md:flex h-full flex-col justify-between shrink-0 select-none font-sans bg-surface-container-lowest rounded-2xl border border-white/5 p-4 shadow-2xl transition-all duration-300 ease-in-out ${
        isSidebarOpen
          ? "w-64 lg:w-68 opacity-100"
          : "w-0 p-0 m-0 overflow-hidden opacity-0 pointer-events-none"
      }`}
    >
      {/* Brand Header */}
      <div className="flex flex-col gap-5 overflow-y-auto custom-scrollbar flex-1 pr-1">
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <div
            onClick={() => onSelectTab("home")}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-primary-container/15 border border-primary-container/30 flex items-center justify-center text-primary-container shadow-[0_0_12px_rgba(0,245,155,0.25)] group-hover:shadow-[0_0_18px_rgba(0,245,155,0.45)] transition-all">
              <span className="material-symbols-outlined text-lg">graphic_eq</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-headline-sm text-base text-on-surface font-bold tracking-tight">
                GreenWave
              </span>
              <span className="font-label-caps text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-primary-container/20 text-primary-container border border-primary-container/30">
                8D
              </span>
            </div>
          </div>

          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="w-7 h-7 rounded-lg hover:bg-surface-container-high text-outline hover:text-on-surface flex items-center justify-center transition-colors"
              title="Collapse sidebar"
            >
              <span className="material-symbols-outlined text-base">dock_to_left</span>
            </button>
          )}
        </div>

        {/* Menu Section */}
        <div className="flex flex-col gap-1.5">
          <span className="px-2 font-label-caps text-[11px] text-outline uppercase tracking-wider font-bold">
            Menu
          </span>
          <nav className="flex flex-col gap-1">
            {menuNav.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all font-label-lg text-xs sm:text-[13px] ${
                    active
                      ? "bg-surface-container-high text-primary-container font-semibold shadow-inner border border-primary-container/30"
                      : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface border border-transparent"
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[19px] ${
                      active ? "text-primary-container" : "text-outline"
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

        {/* Spatial Studio Section */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between px-2">
            <span className="font-label-caps text-[11px] text-outline uppercase tracking-wider font-bold">
              Spatial Studio
            </span>
            <span className="px-1.5 py-0.5 rounded-full bg-primary-container/20 text-primary-container font-label-caps text-[9px] font-bold tracking-widest uppercase shadow-[0_0_8px_rgba(0,245,155,0.35)]">
              8D Pro
            </span>
          </div>

          <nav className="flex flex-col gap-1">
            {studioNav.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all font-label-lg text-xs sm:text-[13px] ${
                    active
                      ? "bg-surface-container-high text-primary-container font-semibold shadow-inner border border-primary-container/30"
                      : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface border border-transparent"
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[19px] ${
                      active ? "text-primary-container" : "text-outline"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}

            {/* Spatial Sound Modal Trigger */}
            <button
              onClick={openModeSelector}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all font-label-lg text-xs sm:text-[13px] border border-transparent"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="material-symbols-outlined text-[19px] text-secondary">
                  surround_sound
                </span>
                <span className="truncate">Spatial Sound</span>
              </div>
              <span className="px-1.5 py-0.2 rounded bg-primary-container text-on-primary-container font-label-caps text-[9px] font-extrabold">
                {audioMode?.toUpperCase() || "8D"}
              </span>
            </button>
          </nav>
        </div>

        {/* Your Library Playlists Section */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between px-2">
            <span className="font-label-caps text-[11px] text-outline uppercase tracking-wider font-bold">
              Your Library Playlists
            </span>
            <button
              onClick={() => onSelectTab("library")}
              className="font-label-md text-[11px] text-primary-container hover:underline"
            >
              See All
            </button>
          </div>

          <nav className="flex flex-col gap-0.5">
            {playlists.map((pl) => (
              <button
                key={pl.id}
                onClick={() =>
                  pl.category
                    ? onSelectTab(pl.tab, pl.category)
                    : onSelectTab(pl.tab)
                }
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all font-body-sm text-xs group text-left w-full"
              >
                <span
                  className={`material-symbols-outlined text-base ${
                    pl.iconColor || "text-outline"
                  } group-hover:text-primary-container transition-colors`}
                >
                  {pl.icon}
                </span>
                <span className="truncate group-hover:text-on-surface transition-colors">
                  {pl.title}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Guest Listener Bottom Card */}
      <div className="pt-3 mt-3 border-t border-white/5 flex flex-col gap-2">
        <div className="p-3 rounded-xl bg-surface-container-low flex flex-col gap-2 border border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="font-label-md text-xs text-on-surface font-semibold">
                Guest Listener
              </span>
            </div>
            <span className="font-label-caps text-[10px] text-outline font-mono">
              HQ Audio
            </span>
          </div>

          <button
            onClick={onLogout || (() => onSelectTab("home"))}
            className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface font-label-md text-xs transition-colors border border-white/5"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
