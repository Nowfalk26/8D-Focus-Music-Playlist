import React from "react";
import { usePlayer } from "../context/PlayerContext";

export default function SpotifyPlayerBar({ onNavigate, onOpenNowPlaying, onOpenConnect, onOpenQueue }) {
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

  const handleOpenPlayer = () => {
    if (onOpenNowPlaying) {
      onOpenNowPlaying();
    } else {
      setShowFullPlayer(true);
    }
  };

  return (
    <>
      {/* ---------------- MOBILE FLOATING MINI-PLAYER (Stitch Android UX) ---------------- */}
      <div className="md:hidden px-2 pb-1 shrink-0 z-40 select-none">
        {currentSong ? (
          <div
            onClick={handleOpenPlayer}
            className="relative bg-[#282828]/95 backdrop-blur-xl border border-white/10 rounded-xl p-2 flex items-center justify-between shadow-2xl cursor-pointer overflow-hidden group active:scale-[0.99] transition-transform"
          >
            {/* Pinned 2px bottom progress bar in Spotify Green */}
            <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-white/20">
              <div
                className="h-full bg-[#1DB954] transition-all duration-200"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Left: Thumbnail & Song Info */}
            <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
              <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 shadow-md bg-black">
                <img
                  src={currentSong.imageUrl || DEFAULT_COVER}
                  alt={currentSong.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = DEFAULT_COVER;
                  }}
                />
                {isPlaying && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-0.5">
                    <span className="w-0.5 bg-[#1DB954] rounded-full animate-[bounce_1s_infinite_100ms] h-2.5" />
                    <span className="w-0.5 bg-[#1DB954] rounded-full animate-[bounce_1s_infinite_300ms] h-3.5" />
                    <span className="w-0.5 bg-[#1DB954] rounded-full animate-[bounce_1s_infinite_200ms] h-2" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate leading-tight">
                  {currentSong.title}
                </p>
                <p className="text-[11px] text-neutral-400 truncate leading-tight mt-0.5">
                  {currentSong.artist || "Flow 8D Artist"}
                </p>
              </div>
            </div>

            {/* Right: Connect, Like, Play/Pause Controls */}
            <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
              {/* Device Connect Button */}
              <button
                onClick={onOpenConnect}
                className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-[#1DB954] active:scale-90 transition-all"
                title="Connect Device"
              >
                <span className="material-symbols-outlined text-lg">speaker_group</span>
              </button>

              {/* Heart Button */}
              <button
                onClick={() => toggleFavorite(currentSong._id || currentSong.id)}
                className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-white active:scale-90 transition-all"
                title={isFav ? "Remove Favorite" : "Save to Library"}
              >
                <span
                  className={`material-symbols-outlined text-xl transition-all ${
                    isFav ? "text-[#1DB954] scale-110" : "text-neutral-400"
                  }`}
                  style={{ fontVariationSettings: isFav ? "'FILL' 1" : "'FILL' 0" }}
                >
                  favorite
                </span>
              </button>

              {/* Play / Pause Circular Button */}
              <button
                onClick={togglePlay}
                className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-90 transition-transform shadow-md ml-1"
                title={isPlaying ? "Pause" : "Play"}
              >
                <span
                  className="material-symbols-outlined text-2xl font-bold ml-0.5 select-none"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {isPlaying ? "pause" : "play_arrow"}
                </span>
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* ---------------- DESKTOP SPOTIFY PLAYER BAR ---------------- */}
      <footer className="hidden md:flex h-20 bg-[#000000] border-t border-[#242424] px-4 items-center justify-between z-50 shrink-0 select-none">
        {/* Left: Track Information */}
        <div className="flex items-center gap-3.5 w-1/4 min-w-[180px] max-w-[320px]">
          {currentSong ? (
            <>
              <div
                onClick={handleOpenPlayer}
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
                <h4
                  onClick={handleOpenPlayer}
                  className="text-sm font-semibold text-white truncate hover:underline cursor-pointer"
                  title={currentSong.title}
                >
                  {currentSong.title}
                </h4>
                <p
                  className="text-xs text-neutral-400 truncate hover:text-white hover:underline cursor-pointer mt-0.5"
                  title={currentSong.artist}
                >
                  {currentSong.artist || "Flow 8D Artist"}
                </p>
              </div>

              {/* Heart Favorite Button */}
              <button
                onClick={() => toggleFavorite(currentSong._id || currentSong.id)}
                className="text-neutral-400 hover:text-white transition-colors p-1"
                title={isFav ? "Remove from Your Library" : "Save to Your Library"}
              >
                <span
                  className={`material-symbols-outlined text-xl transition-all ${
                    isFav
                      ? "text-[#1DB954] scale-110 drop-shadow-[0_0_8px_rgba(29,185,84,0.6)]"
                      : "text-neutral-400 hover:text-white"
                  }`}
                  style={{ fontVariationSettings: isFav ? "'FILL' 1" : "'FILL' 0" }}
                >
                  favorite
                </span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-md bg-[#181818] border border-white/5 flex items-center justify-center text-neutral-500">
                <span className="material-symbols-outlined text-2xl">music_note</span>
              </div>
              <div>
                <p className="text-xs text-neutral-400">No track playing</p>
                <p className="text-[10px] text-neutral-600 font-mono">Select a song to start</p>
              </div>
            </div>
          )}
        </div>

        {/* Center: Playback Transport & Scrubber Bar */}
        <div className="flex flex-col items-center justify-center flex-1 w-2/4 max-w-xl px-4">
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
                cycleStatus ? "text-[#1DB954]" : "text-neutral-400 hover:text-white"
              }`}
            >
              <span className="material-symbols-outlined text-lg">sync_alt</span>
              {cycleStatus && (
                <span className="text-[9px] font-mono font-bold bg-[#1DB954]/20 text-[#1DB954] px-1 rounded">
                  #{cycleStatus.cycleId}
                </span>
              )}
            </button>

            {/* Previous Button */}
            <button
              onClick={playPrev}
              disabled={!currentSong}
              className="text-neutral-400 hover:text-white transition-colors disabled:opacity-30 disabled:hover:text-neutral-400"
              title="Previous"
            >
              <span className="material-symbols-outlined text-2xl">skip_previous</span>
            </button>

            {/* Play / Pause Circular Button */}
            <button
              onClick={togglePlay}
              disabled={!currentSong}
              className="w-9 h-9 rounded-full bg-white hover:bg-neutral-200 text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-transform disabled:opacity-40 disabled:hover:scale-100 shadow-md"
              title={isPlaying ? "Pause" : "Play"}
            >
              <span
                className="material-symbols-outlined text-2xl font-bold ml-0.5"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {isPlaying ? "pause" : "play_arrow"}
              </span>
            </button>

            {/* Next Button */}
            <button
              onClick={playNext}
              disabled={!currentSong}
              className="text-neutral-400 hover:text-white transition-colors disabled:opacity-30 disabled:hover:text-neutral-400"
              title="Next"
            >
              <span className="material-symbols-outlined text-2xl">skip_next</span>
            </button>

            {/* 8D Orbit Mode Active Indicator */}
            <button
              onClick={() => setIs8DActive(!is8DActive)}
              title={is8DActive ? "8D Spatial Audio: Active" : "8D Spatial Audio: Bypassed"}
              className={`text-xs p-1 transition-colors ${
                is8DActive ? "text-[#00f2fe]" : "text-neutral-500 hover:text-white"
              }`}
            >
              <span className="material-symbols-outlined text-lg">spatial_audio_off</span>
            </button>
          </div>

          {/* Bottom Time Scrubber */}
          <div className="w-full flex items-center gap-2.5 text-[11px] font-mono text-neutral-400">
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
                className="h-full bg-white group-hover:bg-[#1DB954] rounded-full relative"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow-md transition-opacity" />
              </div>
            </div>

            <span className="w-9 text-left">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right: Audio Modes & Tools */}
        <div className="flex items-center justify-end gap-3 w-1/4 min-w-[180px]">
          {/* Queue Button */}
          <button
            onClick={onOpenQueue}
            className="text-neutral-400 hover:text-white transition-colors p-1"
            title="Open Queue"
          >
            <span className="material-symbols-outlined text-lg">queue_music</span>
          </button>

          {/* Connect to Device Button */}
          <button
            onClick={onOpenConnect}
            className="text-neutral-400 hover:text-white transition-colors p-1"
            title="Connect Device"
          >
            <span className="material-symbols-outlined text-lg">speaker_group</span>
          </button>

          {/* Audio Universe Switcher Pill */}
          <button
            onClick={openModeSelector}
            className="px-2.5 py-1 rounded-full bg-[#181818] hover:bg-[#282828] border border-[#1DB954]/40 text-[#1DB954] font-mono text-[10px] font-bold tracking-wider uppercase transition-all shadow-sm"
            title="Switch Audio Experience Mode"
          >
            {audioMode?.toUpperCase() || "8D"}
          </button>

          {/* 360 Fullscreen / Stage Button */}
          <button
            onClick={() => (onNavigate ? onNavigate("orbit") : handleOpenPlayer())}
            className="text-neutral-400 hover:text-white transition-colors p-1"
            title="Open 360° Binaural Stage"
          >
            <span className="material-symbols-outlined text-lg">fullscreen</span>
          </button>
        </div>
      </footer>
    </>
  );
}
