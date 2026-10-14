import React from "react";
import { usePlayer } from "../context/PlayerContext";

const TITLE_MAP = {
  home: "Flow 8D Experience",
  taste: "Your Music Taste & ML Fingerprint",
  studio: "AI 8D Spatial Studio",
  library: "Flow 8D Music Archive",
  dashboard: "Platform Metrics & Insights",
  songs: "Songs Catalog & Audio Files",
  categories: "Focus Categories & Frequencies",
  users: "User Permissions & Profiles",
};

export default function Navbar({
  activeTab,
  user,
  onLogout,
  isMobileFrame,
  setIsMobileFrame,
}) {
  const { currentSong, isPlaying, setShowFullPlayer, setShowMiloChat, audioMode, openModeSelector } = usePlayer();

  const modeBadge = {
    normal: { label: "Normal Music", icon: "🎵", color: "text-cyan-300 border-cyan-400/40 bg-cyan-950/40" },
    "8d": { label: "8D Audio", icon: "🎧", color: "text-purple-300 border-purple-400/40 bg-purple-950/40" },
  }[audioMode || "8d"] || { label: "8D Audio", icon: "🎧", color: "text-purple-300 border-purple-400/40 bg-purple-950/40" };

  return (
    <header className="h-16 px-6 glass-panel border-b border-purple-500/20 flex items-center justify-between sticky top-0 z-30 bg-[#0c0817]/80 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
          <span>{TITLE_MAP[activeTab] || "Flow 8D"}</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 font-mono font-normal">
            Stitch ID: 4859390444927120493
          </span>
        </h2>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Audio Universe Mode Switcher Button */}
        <button
          onClick={openModeSelector}
          className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm hover:brightness-125 ${modeBadge.color}`}
          title="Switch Audio Experience Mode (Normal Music, 8D Audio)"
        >
          <span>{modeBadge.icon}</span>
          <span className="hidden md:inline font-mono text-[11px] uppercase tracking-wider">{modeBadge.label}</span>
          <span className="text-[9px] opacity-70 underline ml-0.5 hidden sm:inline">Switch</span>
        </button>

        {/* Milo Companion Trigger in Navbar */}
        <button
          onClick={() => setShowMiloChat(true)}
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-900/80 via-pink-900/60 to-purple-950/80 hover:brightness-110 text-pink-200 border border-pink-400/40 text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
          title="Chat with Milo - Your caring best friend"
        >
          <span className="text-sm">💬</span>
          <span className="hidden sm:inline">Milo</span>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-ping"></span>
        </button>

        {/* Toggle Mobile Preview Frame */}
        <button
          onClick={() => setIsMobileFrame(!isMobileFrame)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
            isMobileFrame
              ? "bg-brand-purple text-white border-brand-cyan shadow-neon-purple"
              : "glass-panel text-purple-200 border-purple-500/30 hover:border-purple-400"
          }`}
          title="Toggle between Mobile Phone simulation frame and Fullscreen desktop canvas"
        >
          <span>{isMobileFrame ? "📱 Mobile View" : "💻 Desktop Canvas"}</span>
        </button>

        {/* 360° Stage Launcher */}
        {currentSong && (
          <button
            onClick={() => setShowFullPlayer(true)}
            className="px-3 py-1.5 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-cyan-300 border border-cyan-400/50 shadow-neon-cyan text-xs font-bold flex items-center gap-1.5 animate-pulse"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            <span>360° Stage</span>
          </button>
        )}

        {/* Admin User Chip */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-purple-950/50 border border-purple-500/20">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-brand-purple to-pink-500 flex items-center justify-center text-xs font-bold text-white shadow-sm">
            {user?.name ? user.name[0].toUpperCase() : "A"}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-white leading-none">{user?.name || "Admin"}</div>
            <div className="text-[10px] text-purple-300/60 leading-none mt-0.5">{user?.role || "admin"}</div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="p-2 rounded-xl text-purple-300/60 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          title="Logout"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </header>
  );
}
