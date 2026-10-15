import React from "react";
import { usePlayer } from "../context/PlayerContext";

export default function SpotifyTopBar({ activeTab, onSelectTab, user, onLogout }) {
  const {
    audioMode,
    openModeSelector,
    setShowMiloChat,
    setShowFullPlayer,
  } = usePlayer();

  const modeBadge = {
    normal: { label: "Normal Music", short: "Normal", icon: "🎵", color: "text-neutral-200 border-white/20 bg-white/10" },
    "8d": { label: "8D Audio", short: "8D", icon: "🎧", color: "text-[#1DB954] border-[#1DB954]/40 bg-[#1DB954]/15" },
    "9d": { label: "9D Dimension", short: "9D", icon: "✨", color: "text-rose-400 border-rose-400/40 bg-rose-950/40" },
  }[audioMode || "8d"] || { label: "8D Audio", short: "8D", icon: "🎧", color: "text-[#1DB954] border-[#1DB954]/40 bg-[#1DB954]/15" };

  return (
    <header className="h-14 sm:h-16 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 bg-[#121212]/90 backdrop-blur-md border-b border-white/5 select-none">
      {/* Left: History Navigation & Quick Title */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => onSelectTab("home")}
            className="w-8 h-8 rounded-full bg-black/60 hover:bg-black text-neutral-300 hover:text-white flex items-center justify-center transition-colors"
            title="Go to Home"
          >
            <span className="material-symbols-outlined text-lg">chevron_left</span>
          </button>
          <button
            onClick={() => onSelectTab("library")}
            className="w-8 h-8 rounded-full bg-black/60 hover:bg-black text-neutral-300 hover:text-white flex items-center justify-center transition-colors"
            title="Go to Library"
          >
            <span className="material-symbols-outlined text-lg">chevron_right</span>
          </button>
        </div>

        {/* Search shortcut for quick access */}
        <button
          onClick={() => onSelectTab("library")}
          className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#242424] hover:bg-[#2a2a2a] text-neutral-400 hover:text-white text-xs font-medium transition-colors"
        >
          <span className="material-symbols-outlined text-sm">search</span>
          <span>What do you want to play?</span>
        </button>
      </div>

      {/* Right: Audio Universe Pill, Milo AI & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Audio Mode Switcher */}
        <button
          onClick={openModeSelector}
          className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-full border text-xs font-bold transition-all shadow-sm active:scale-95 hover:brightness-125 ${modeBadge.color}`}
          title="Switch Audio Experience Mode (Normal Music, 8D Audio)"
        >
          <span>{modeBadge.icon}</span>
          <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-wider hidden xs:inline">
            {modeBadge.label}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-wider xs:hidden">
            {modeBadge.short}
          </span>
          <span className="text-[9px] opacity-75 underline ml-0.5">Switch</span>
        </button>

        {/* Ask Milo AI Pill */}
        <button
          onClick={() => setShowMiloChat(true)}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-purple-900/40 hover:bg-purple-800/60 border border-purple-500/40 text-purple-200 text-xs font-semibold transition-all active:scale-95"
          title="Chat with Milo AI"
        >
          <span>🐱</span>
          <span className="hidden sm:inline">Milo AI</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#1DB954] animate-ping" />
        </button>

        {/* 360 Stage Pill */}
        <button
          onClick={() => onSelectTab("orbit")}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#242424] hover:bg-[#2a2a2a] text-neutral-300 hover:text-white text-xs font-medium transition-colors"
          title="360° Binaural Stage"
        >
          <span className="material-symbols-outlined text-sm text-[#00f2fe]">spatial_audio_off</span>
          <span>360°</span>
        </button>

        {/* User Profile Pill */}
        <div className="flex items-center gap-1.5 pl-2 border-l border-white/10">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#282828] border border-white/10 flex items-center justify-center font-bold text-xs text-white">
            {user?.name ? user.name[0].toUpperCase() : "A"}
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="text-neutral-400 hover:text-white p-1"
              title="Logout"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
