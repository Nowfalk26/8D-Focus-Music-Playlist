import React from "react";
import { usePlayer } from "../context/PlayerContext";

export default function SpotifyPlayerBar({ onNavigate }) {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    playNext,
    playPrev,
    seek,
    is8DActive,
    setIs8DActive,
    audioMode,
    openModeSelector,
    favorites,
    toggleFavorite,
    setShowFullPlayer,
    setShowMiloChat,
    cycleStatus,
    resetPlaybackCycle,
  } = usePlayer();

  const formatTime = (secs) => {
    if (isNaN(secs) || secs === Infinity) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const isFav = currentSong ? favorites.has(currentSong._id || currentSong.id) : false;

  const DEFAULT_COVER =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCYHY4hp0r-GSzPdesFf5Z5mHQjlDX8zkLIjOdCA_IqUU_uw_nFr73ANifvOdaM2Q0NTsbK9ZB4CakHGH5fOSwA-_HynlD80C-hNL1oquc1m9K6gETHr9tKwpVJsxr8i3yXt8MxzxgSfUOhVYLQ8IqgfrlSGKs-61qE80eejtCqn6bE6dEiNbaAVFjYTn5bXQizoK0XcGh2VyyPyVMbGgVbr-Vnz7APr5Vg8HSuKiI1D50YhAVg3lfgaQ";

  return (
    <footer className="h-20 bg-[#000000] border-t border-[#242424] px-4 flex items-center justify-between z-50 shrink-0 select-none">
      {/* Left: Track Information (Spotify style) */}
      <div className="flex items-center gap-3.5 w-1/4 min-w-[200px] max-w-[320px]">
        {currentSong ? (
          <>
            <div
              onClick={() => setShowFullPlayer(true)}
              className="relative w-14 h-14 rounded-md overflow-hidden shrink-0 group cursor-pointer shadow-md bg-[#181818]"
            >
              <img
                src={currentSong.imageUrl || DEFAULT_COVER}
                alt={currentSong.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = DEFAULT_COVER;
                }}
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <span className="material-symbols-outlined text-white text-xl">expand_less</span>
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4
                  onClick={() => setShowFullPlayer(true)}
                  className="text-sm font-semibold text-white truncate hover:underline cursor-pointer"
                  title={currentSong.title}
                >
                  {currentSong.title}
                </h4>
              </div>
              <p
                className="text-xs text-slate-400 truncate hover:text-white hover:underline cursor-pointer mt-0.5"
                title={currentSong.artist}
              >
                {currentSong.artist || "Flow 8D Artist"}
              </p>
            </div>

            {/* Heart Favorite Button */}
            <button
              onClick={() => toggleFavorite(currentSong._id || currentSong.id)}
              className="text-slate-400 hover:text-white transition-colors p-1"
              title={isFav ? "Remove from Your Library" : "Save to Your Library"}
            >
              <span
                className={`material-symbols-outlined text-xl transition-all ${
                  isFav
                    ? "text-[#00f2fe] scale-110 drop-shadow-[0_0_8px_rgba(0,242,254,0.6)]"
                    : "text-slate-400 hover:text-white"
                }`}
                style={{ fontVariationSettings: isFav ? "'FILL' 1" : "'FILL' 0" }}
              >
                favorite
              </span>
            </button>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-md bg-[#181818] border border-white/5 flex items-center justify-center text-slate-500">
              <span className="material-symbols-outlined text-2xl">music_note</span>
            </div>
            <div>
              <p className="text-xs text-slate-400">No track playing</p>
              <p className="text-[10px] text-slate-600 font-mono">Select a song to start</p>
            </div>
          </div>
        )}
      </div>

      {/* Center: Playback Transport & Scrubber Bar (Spotify Canonical Center) */}
      <div className="flex flex-col items-center justify-center w-2/4 max-w-xl px-4">
        {/* Top Control Buttons */}
        <div className="flex items-center gap-5 mb-1.5">
          {/* Smart No-Repeat Cycle Loop status */}
          <button
            onClick={resetPlaybackCycle}
            title={
              cycleStatus
                ? `Smart No-Repeat Cycle #${cycleStatus.cycleId}: ${cycleStatus.playedCount}/${cycleStatus.totalEligible || "all"} played (Click to reset)`
                : "Smart Cycle Active"
            }
            className={`text-xs p-1 transition-colors flex items-center gap-1 ${
              cycleStatus ? "text-[#00f2fe]" : "text-slate-400 hover:text-white"
            }`}
          >
            <span className="material-symbols-outlined text-lg">sync_alt</span>
            {cycleStatus && (
              <span className="text-[9px] font-mono font-bold bg-[#00f2fe]/20 text-[#00f2fe] px-1 rounded">
                #{cycleStatus.cycleId}
              </span>
            )}
          </button>

          {/* Previous Button */}
          <button
            onClick={playPrev}
            disabled={!currentSong}
            className="text-slate-400 hover:text-white transition-colors disabled:opacity-30 disabled:hover:text-slate-400"
            title="Previous"
          >
            <span className="material-symbols-outlined text-2xl">skip_previous</span>
          </button>

          {/* Play / Pause Circular Button */}
          <button
            onClick={togglePlay}
            disabled={!currentSong}
            className="w-9 h-9 rounded-full bg-white hover:bg-slate-200 text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-transform disabled:opacity-40 disabled:hover:scale-100 shadow-md"
            title={isPlaying ? "Pause" : "Play"}
          >
            <span className="material-symbols-outlined text-2xl font-bold ml-0.5">
              {isPlaying ? "pause" : "play_arrow"}
            </span>
          </button>

          {/* Next Button */}
          <button
            onClick={playNext}
            disabled={!currentSong}
            className="text-slate-400 hover:text-white transition-colors disabled:opacity-30 disabled:hover:text-slate-400"
            title="Next"
          >
            <span className="material-symbols-outlined text-2xl">skip_next</span>
          </button>

          {/* 8D Orbit Mode Active Indicator */}
          <button
            onClick={() => setIs8DActive(!is8DActive)}
            title={is8DActive ? "8D Spatial Audio: Active" : "8D Spatial Audio: Bypassed"}
            className={`text-xs p-1 transition-colors ${
              is8DActive ? "text-[#00f2fe]" : "text-slate-500 hover:text-white"
            }`}
          >
            <span className="material-symbols-outlined text-lg">spatial_audio_off</span>
          </button>
        </div>

        {/* Bottom Time Scrubber */}
        <div className="w-full flex items-center gap-2.5 text-[11px] font-mono text-slate-400">
          <span className="w-9 text-right">{formatTime(currentTime)}</span>

          <div
            onClick={(e) => {
              if (!duration) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              seek(pct * duration);
            }}
            className="relative flex-1 h-1 bg-[#4d4d4d] hover:h-1.5 rounded-full cursor-pointer group transition-all"
          >
            <div
              className="h-full bg-white group-hover:bg-[#00f2fe] rounded-full relative"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow-md transition-opacity"></div>
            </div>
          </div>

          <span className="w-9 text-left">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right: Audio Modes & Tools (Spotify right utility bar) */}
      <div className="flex items-center justify-end gap-3 w-1/4 min-w-[200px]">
        {/* Milo AI Chat Button */}
        <button
          onClick={() => setShowMiloChat(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#181818] hover:bg-[#282828] border border-white/5 text-slate-300 hover:text-white text-xs font-medium transition-all"
          title="Chat with Milo AI"
        >
          <span className="text-sm">🐱</span>
          <span className="hidden lg:inline text-[11px]">Milo</span>
        </button>

        {/* Audio Universe Switcher Pill */}
        <button
          onClick={openModeSelector}
          className="px-2.5 py-1 rounded-full bg-[#181818] hover:bg-[#282828] border border-[#00f2fe]/30 text-[#00f2fe] font-mono text-[10px] font-bold tracking-wider uppercase transition-all shadow-sm"
          title="Switch Audio Experience Mode"
        >
          {audioMode.toUpperCase()}
        </button>

        {/* 360 Fullscreen / Stage Button */}
        <button
          onClick={() => (onNavigate ? onNavigate("orbit") : setShowFullPlayer(true))}
          className="text-slate-400 hover:text-white transition-colors p-1"
          title="Open 360° Binaural Stage"
        >
          <span className="material-symbols-outlined text-lg">fullscreen</span>
        </button>
      </div>
    </footer>
  );
}
