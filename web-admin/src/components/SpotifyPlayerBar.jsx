import React, { useState } from "react";
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
    cycleStatus,
    resetPlaybackCycle,
    volume,
    setVolume,
    isMuted,
    toggleMute,
    isShuffle,
    toggleShuffle,
    repeatMode,
    toggleRepeat,
  } = usePlayer();

  const [isVolumeHovered, setIsVolumeHovered] = useState(false);

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

  const currentVolumePercent = isMuted ? 0 : Math.round(volume * 100);

  return (
    <>
      {/* ---------------- MOBILE FLOATING MINI-PLAYER (Touch Friendly) ---------------- */}
      <div className="md:hidden px-2 pb-1 shrink-0 z-40 select-none">
        {currentSong ? (
          <div
            onClick={handleOpenPlayer}
            className="relative bg-[#1f1f1f]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2.5 flex items-center justify-between shadow-2xl cursor-pointer overflow-hidden group active:scale-[0.99] transition-transform"
          >
            {/* Pinned 2.5px bottom progress bar in Spotify Green */}
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/15">
              <div
                className="h-full bg-[#1DB954] transition-all duration-200"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Left: Thumbnail & Song Info */}
            <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
              <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 shadow-md bg-black">
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
                    <span className="w-0.5 bg-[#1DB954] rounded-full animate-[bounce_1s_infinite_100ms] h-3" />
                    <span className="w-0.5 bg-[#1DB954] rounded-full animate-[bounce_1s_infinite_300ms] h-4" />
                    <span className="w-0.5 bg-[#1DB954] rounded-full animate-[bounce_1s_infinite_200ms] h-2.5" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1 flex flex-col justify-center">
                <p className="text-xs font-bold text-white truncate leading-snug pb-0.5">
                  {currentSong.title}
                </p>
                <p className="text-[11px] text-neutral-400 truncate leading-normal mt-0.5">
                  {currentSong.artist || "Flow 8D Artist"}
                </p>
              </div>
            </div>

            {/* Right: Connect, Like, Play/Pause Controls */}
            <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
              {/* Device Connect Button */}
              <button
                onClick={onOpenConnect}
                className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-[#1DB954] active:scale-90 transition-all leading-none"
                title="Connect Device"
              >
                <span className="material-symbols-outlined text-lg">speaker_group</span>
              </button>

              {/* Heart Button */}
              <button
                onClick={() => toggleFavorite(currentSong._id || currentSong.id)}
                className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-white active:scale-90 transition-all leading-none"
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
                className="w-10 h-10 rounded-full bg-[#1DB954] text-black flex items-center justify-center active:scale-90 transition-transform shadow-md ml-1 leading-none"
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
      <footer className="hidden md:flex h-20 bg-[#0a0a0a] border-t border-white/10 px-4 sm:px-5 items-center justify-between z-50 shrink-0 select-none shadow-[0_-8px_24px_rgba(0,0,0,0.7)]">
        {/* ================= LEFT SECTION: Track Metadata & Heart ================= */}
        <div className="flex items-center gap-3 w-1/4 min-w-[190px] max-w-[300px]">
          {currentSong ? (
            <>
              {/* Artwork Thumbnail with Expand Overlay */}
              <div
                onClick={handleOpenPlayer}
                className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 group cursor-pointer shadow-lg bg-[#181818] border border-white/5"
              >
                <img
                  src={currentSong.imageUrl || DEFAULT_COVER}
                  alt={currentSong.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = DEFAULT_COVER;
                  }}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="material-symbols-outlined text-white text-lg">expand_less</span>
                </div>
              </div>

              {/* Title & Artist */}
              <div className="min-w-0 flex-1 flex flex-col justify-center">
                <h4
                  onClick={handleOpenPlayer}
                  className="text-xs sm:text-[13px] font-bold text-white truncate hover:underline cursor-pointer leading-tight"
                  title={currentSong.title}
                >
                  {currentSong.title}
                </h4>
                <p
                  className="text-[11px] text-neutral-400 truncate hover:text-white hover:underline cursor-pointer mt-0.5 leading-tight"
                  title={currentSong.artist}
                >
                  {currentSong.artist || "Flow 8D Artist"}
                </p>
              </div>

              {/* Like / Heart Button */}
              <button
                onClick={() => toggleFavorite(currentSong._id || currentSong.id)}
                className="text-neutral-400 hover:text-white transition-colors p-1.5 shrink-0 inline-flex items-center justify-center leading-none"
                title={isFav ? "Remove from Liked Songs" : "Save to Liked Songs"}
              >
                <span
                  className={`material-symbols-outlined text-lg transition-all ${
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
            <div className="flex items-center gap-2.5">
              <div className="w-12 h-12 rounded-lg bg-[#181818] border border-white/5 flex items-center justify-center text-neutral-400 shadow-sm shrink-0">
                <span className="material-symbols-outlined text-xl">music_note</span>
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-xs font-semibold text-neutral-200 leading-tight">No track playing</p>
                <p className="text-[11px] text-neutral-400 font-mono leading-tight mt-0.5">Select a song to start</p>
              </div>
            </div>
          )}
        </div>

        {/* ================= CENTER SECTION: Controls & Scrubber ================= */}
        <div className="flex flex-col items-center justify-center flex-1 w-2/4 max-w-xl px-4">
          <div className="flex items-center gap-4 mb-1.5">
            {/* Shuffle Button */}
            <button
              onClick={toggleShuffle}
              title={isShuffle ? "Shuffle On" : "Shuffle Off"}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors relative ${
                isShuffle ? "text-[#1DB954]" : "text-neutral-400 hover:text-white"
              }`}
            >
              <span className="material-symbols-outlined text-lg">shuffle</span>
              {isShuffle && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#1DB954]" />
              )}
            </button>

            {/* Previous Button */}
            <button
              onClick={playPrev}
              disabled={!currentSong}
              className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-300 hover:text-white transition-colors disabled:opacity-30 disabled:hover:text-neutral-400 active:scale-90"
              title="Previous Track"
            >
              <span className="material-symbols-outlined text-xl">skip_previous</span>
            </button>

            {/* Play / Pause Circular FAB */}
            <button
              onClick={togglePlay}
              disabled={!currentSong}
              className="w-9 h-9 rounded-full bg-white hover:bg-[#1DB954] text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:hover:scale-100 shadow-xl"
              title={isPlaying ? "Pause" : "Play"}
            >
              <span
                className="material-symbols-outlined text-xl font-bold ml-0.5 select-none"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {isPlaying ? "pause" : "play_arrow"}
              </span>
            </button>

            {/* Next Button */}
            <button
              onClick={playNext}
              disabled={!currentSong}
              className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-300 hover:text-white transition-colors disabled:opacity-30 disabled:hover:text-neutral-400 active:scale-90"
              title="Next Track"
            >
              <span className="material-symbols-outlined text-xl">skip_next</span>
            </button>

            {/* Repeat Button */}
            <button
              onClick={toggleRepeat}
              title={
                repeatMode === "off"
                  ? "Enable Repeat"
                  : repeatMode === "all"
                  ? "Repeat All (Click for Repeat One)"
                  : "Repeat One (Click to Turn Off)"
              }
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors relative ${
                repeatMode !== "off" ? "text-[#1DB954]" : "text-neutral-400 hover:text-white"
              }`}
            >
              <span className="material-symbols-outlined text-lg">
                {repeatMode === "one" ? "repeat_one" : "repeat"}
              </span>
              {repeatMode !== "off" && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#1DB954]" />
              )}
            </button>
          </div>

          {/* Time Scrubber Slider */}
          <div className="w-full flex items-center gap-2.5 text-[11px] font-mono text-neutral-400">
            <span className="w-9 text-right text-neutral-300">{formatTime(currentTime)}</span>

            <div
              onClick={(e) => {
                if (!duration) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const pct = (e.clientX - rect.left) / rect.width;
                seek(pct * duration);
              }}
              className="relative flex-1 h-1 hover:h-2 bg-neutral-700 hover:bg-neutral-600 rounded-full cursor-pointer group transition-all"
            >
              <div
                className="h-full bg-white group-hover:bg-[#1DB954] rounded-full relative transition-all"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow-md transition-opacity" />
              </div>
            </div>

            <span className="w-9 text-left text-neutral-400">{formatTime(duration)}</span>
          </div>
        </div>

        {/* ================= RIGHT SECTION: Spatial Mode, Volume, Tools ================= */}
        <div className="flex items-center justify-end gap-2 sm:gap-2.5 w-1/4 min-w-[200px]">
          {/* Spatial Mode Indicator Pill */}
          <button
            onClick={openModeSelector}
            className="h-7 px-3 rounded-full bg-[#181818] hover:bg-[#242424] border border-[#1DB954]/40 text-[#1DB954] font-mono text-[11px] font-extrabold tracking-wider uppercase transition-all shadow-sm hover:scale-105 active:scale-95 leading-none inline-flex items-center justify-center text-center select-none"
            title="Switch Audio Experience Mode"
          >
            {audioMode?.toUpperCase() || "8D"}
          </button>

          {/* 8D Orbit Active Toggle */}
          <button
            onClick={() => setIs8DActive(!is8DActive)}
            title={is8DActive ? "8D Spatial Orbit Active" : "8D Orbit Bypassed"}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              is8DActive ? "text-[#00f2fe]" : "text-neutral-400 hover:text-white"
            }`}
          >
            <span className="material-symbols-outlined text-lg">spatial_audio_off</span>
          </button>

          {/* Queue Drawer Button */}
          <button
            onClick={onOpenQueue}
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
            title="Open Playback Queue"
          >
            <span className="material-symbols-outlined text-lg">queue_music</span>
          </button>

          {/* Device Connect Button */}
          <button
            onClick={onOpenConnect}
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
            title="Connect to Device"
          >
            <span className="material-symbols-outlined text-lg">speaker_group</span>
          </button>

          {/* Volume Control Slider */}
          <div
            className="flex items-center gap-1.5"
            onMouseEnter={() => setIsVolumeHovered(true)}
            onMouseLeave={() => setIsVolumeHovered(false)}
          >
            <button
              onClick={toggleMute}
              className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
              title={isMuted ? "Unmute" : "Mute"}
            >
              <span className="material-symbols-outlined text-lg">
                {isMuted || volume === 0
                  ? "volume_off"
                  : volume < 0.5
                  ? "volume_down"
                  : "volume_up"}
              </span>
            </button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-20 sm:w-24 h-1 accent-[#1DB954] bg-neutral-700 rounded-full cursor-pointer"
              title={`Volume: ${currentVolumePercent}%`}
            />
          </div>

          {/* Fullscreen / 360 Stage Button */}
          <button
            onClick={() => (onNavigate ? onNavigate("orbit") : handleOpenPlayer())}
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
            title="Open 360° Binaural Stage"
          >
            <span className="material-symbols-outlined text-lg">fullscreen</span>
          </button>
        </div>
      </footer>
    </>
  );
}
