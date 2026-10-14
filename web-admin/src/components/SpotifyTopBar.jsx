import React from "react";
import { usePlayer } from "../context/PlayerContext";

export default function SpotifyTopBar({ activeTab, onSelectTab, user, onLogout }) {
  const {
    audioMode,
    openModeSelector,
    setShowMiloChat,
    setShowFullPlayer,
    cycleStatus,
  } = usePlayer();

  const modeBadge = {
    normal: { label: "Normal Music", icon: "🎵", color: "text-cyan-400 border-cyan-400/40 bg-cyan-950/40" },
    "8d": { label: "8D Audio", icon: "🎧", color: "text-[#00f2fe] border-[#00f2fe]/40 bg-[#00f2fe]/10" },
  }[audioMode || "8d"] || { label: "8D Audio", icon: "🎧", color: "text-[#00f2fe] border-[#00f2fe]/40 bg-[#00f2fe]/10" };

  return (
    <header className="h-16 px-6 flex items-center justify-between sticky top-0 z-30 bg-[#121212]/90 backdrop-blur-md border-b border-white/5 select-none">
      {/* Left: Spotify History Navigation & Quick Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelectTab("home")}
            className="w-8 h-8 rounded-full bg-black/60 hover:bg-black text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            title="Go to Home"
          >
            <span className="material-symbols-outlined text-lg">chevron_left</span>
          </button>
          <button
            onClick={() => onSelectTab("library")}
            className="w-8 h-8 rounded-full bg-black/60 hover:bg-black text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            title="Go to Library"
          >
            <span className="material-symbols-outlined text-lg">chevron_right</span>
          </button>
        </div>

        {/* Search shortcut for quick access */}
        <button
          onClick={() => onSelectTab("library")}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#242424] hover:bg-[#2a2a2a] text-slate-400 hover:text-white text-xs font-medium transition-colors"
        >
          <span className="material-symbols-outlined text-sm">search</span>
          <span>What do you want to play?</span>
        </button>
      </div>

      {/* Right: Audio Universe Pill, Milo AI & Profile */}
      <div className="flex items-center gap-3">
        {/* Audio Mode Switcher */}
        <button
          onClick={openModeSelector}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all shadow-sm active:scale-95 hover:brightness-125 ${modeBadge.color}`}
          title="Switch Audio Experience Mode (Normal Music, 8D Audio)"
        >
          <span>{modeBadge.icon}</span>
          <span className="font-mono text-[11px] uppercase tracking-wider">{modeBadge.label}</span>
          <span className="text-[9px] opacity-75 underline ml-0.5">Switch</span>
        </button>

        {/* Ask Milo AI Pill */}
        <button
          onClick={() => setShowMiloChat(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-900/60 to-pink-900/60 hover:from-purple-800 hover:to-pink-800 border border-purple-500/40 text-purple-200 text-xs font-semibold transition-all shadow-glow-purple active:scale-95"
          title="Chat with Milo AI"
        >
          <span>🐱</span>
          <span className="hidden sm:inline">Milo AI</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#00f2fe] animate-ping"></span>
        </button>

        {/* 360 Stage Pill */}
        <button
          onClick={() => onSelectTab("orbit")}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#242424] hover:bg-[#2a2a2a] text-slate-300 hover:text-white text-xs font-medium transition-colors"
          title="360° Binaural Stage"
        >
          <span className="material-symbols-outlined text-sm text-[#00f2fe]">spatial_audio_off</span>
          <span>360° Stage</span>
        </button>

        {/* User Profile Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-white/10">
          <div className="w-8 h-8 rounded-full bg-[#282828] border border-white/10 flex items-center justify-center font-bold text-xs text-white">
            {user?.name ? user.name[0].toUpperCase() : "A"}
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-bold text-white leading-tight">
              {user?.name || "Admin Master"}
            </span>
            <span className="text-[10px] text-slate-400 font-mono leading-tight">
              {user?.role || "pro"}
            </span>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="text-slate-400 hover:text-white p-1 ml-1"
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
