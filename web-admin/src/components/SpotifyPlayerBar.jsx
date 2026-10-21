import React, { useState } from "react";
import { usePlayer } from "../context/PlayerContext";

export default function SpotifyPlayerBar({
  onNavigate,
  onOpenNowPlaying,
  onOpenConnect,
  onOpenQueue,
}) {
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
    volume,
    setVolume,
    isMuted,
    toggleMute,
    isShuffle,
    toggleShuffle,
    repeatMode,
    toggleRepeat,
  } = usePlayer();

  const [isVolumeDragging, setIsVolumeDragging] = useState(false);

  const formatTime = (secs) => {
    if (isNaN(secs) || secs === Infinity) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const isFav = currentSong ? favorites.has(currentSong._id || currentSong.id) : false;

  const DEFAULT_COVER =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAWByWvdnUZaWSyHWRuiUAof9rGDUkaXD0hDAykUqTaQA_p_GH-PIHsoDBJlXPsmxAkgp2fE1h7uI8vbFX6SKL-_yqYcCR3vScUyvaCskQv3W2_53DwvuccO3gSuoWU08yyJD6MzSeR1JNFG71eD3VUjlfCTFKI0ImoEE00r75DhLiPNwojNa9Vy6UUfYhA_9YJ3Xtfd4VE3bcfOHoXCBuVKg6Kg1s5YXb0t_bw_sjqb22HowHDEiQHEg";

  const handleOpenPlayer = () => {
    if (onOpenNowPlaying) {
      onOpenNowPlaying();
    } else {
      setShowFullPlayer(true);
    }
  };

  return (
    <>
      {/* ---------------- MOBILE FLOATING MINI-PLAYER ---------------- */}
      <div className="md:hidden px-2 pb-1 shrink-0 z-40 select-none">
        {currentSong ? (
          <div
            onClick={handleOpenPlayer}
            className="relative bg-surface-container-lowest/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2.5 flex items-center justify-between shadow-2xl cursor-pointer overflow-hidden group active:scale-[0.99] transition-transform"
          >
            {/* Pinned bottom progress bar in neon emerald */}
            <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-surface-container-high">
              <div
                className="h-full bg-primary-container transition-all duration-200"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Left: Thumbnail & Song Info */}
            <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
              <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 shadow-md bg-surface-container">
                <img
                  src={currentSong.imageUrl || currentSong.cover || DEFAULT_COVER}
                  alt={currentSong.title}
                  className="w-full h-full object-cover"
                />
                {isPlaying && (
                  <div className="absolute inset-0 bg-surface-container-lowest/60 flex items-center justify-center gap-0.5">
                    <span className="w-0.5 bg-primary-container rounded-full animate-[bounce_1s_infinite_100ms] h-3" />
                    <span className="w-0.5 bg-primary-container rounded-full animate-[bounce_1s_infinite_300ms] h-4" />
                    <span className="w-0.5 bg-primary-container rounded-full animate-[bounce_1s_infinite_200ms] h-2.5" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1 flex flex-col justify-center">
                <p className="font-label-lg text-xs text-on-surface truncate font-bold leading-snug">
                  {currentSong.title}
                </p>
                <p className="font-body-sm text-[11px] text-outline truncate leading-normal mt-0.5">
                  {currentSong.artist || "Billie Eilish"}
                </p>
              </div>
            </div>

            {/* Right: Play/Pause Controls */}
            <div
              className="flex items-center gap-1.5 shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => toggleFavorite(currentSong._id || currentSong.id)}
                className="w-8 h-8 flex items-center justify-center text-outline hover:text-primary-container active:scale-90 transition-all"
                title={isFav ? "Remove Favorite" : "Save to Library"}
              >
                <span
                  className={`material-symbols-outlined text-lg transition-all ${
                    isFav ? "text-primary-container scale-110" : "text-outline"
                  }`}
                  style={{ fontVariationSettings: isFav ? "'FILL' 1" : "'FILL' 0" }}
                >
                  favorite
                </span>
              </button>

              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center active:scale-90 transition-transform shadow-[0_0_12px_rgba(0,245,155,0.4)] ml-1"
                title={isPlaying ? "Pause" : "Play"}
              >
                <span
                  className="material-symbols-outlined text-2xl font-bold"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {isPlaying ? "pause" : "play_arrow"}
                </span>
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* ---------------- DESKTOP STITCH SPATIAL MEDIA DOCK ---------------- */}
      <footer className="hidden md:flex h-20 bg-surface-container-lowest/95 backdrop-blur-2xl border-t border-white/5 px-6 items-center justify-between z-50 shrink-0 select-none shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
        {/* ================= LEFT SECTION: Track Metadata & Heart ================= */}
        <div className="flex items-center gap-3.5 w-72 min-w-0">
          {currentSong ? (
            <>
              <div
                onClick={handleOpenPlayer}
                className="relative w-12 h-12 rounded-lg bg-surface-container overflow-hidden shrink-0 flex items-center justify-center shadow-[0_0_12px_rgba(0,245,155,0.15)] cursor-pointer group border border-white/5"
              >
                <img
                  src={currentSong.imageUrl || currentSong.cover || DEFAULT_COVER}
                  alt={currentSong.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-surface-container-lowest/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="material-symbols-outlined text-primary-container text-lg">
                    fullscreen
                  </span>
                </div>
              </div>

              <div className="flex flex-col min-w-0">
                <span
                  onClick={handleOpenPlayer}
                  className="font-label-lg text-xs sm:text-[13px] text-on-surface truncate font-semibold cursor-pointer hover:text-primary-container transition-colors"
                  title={currentSong.title}
                >
                  {currentSong.title}
                </span>
                <span
                  className="font-body-sm text-[11px] text-outline truncate mt-0.5"
                  title={currentSong.artist}
                >
                  {currentSong.artist || "Billie Eilish"}
                </span>
              </div>

              <button
                onClick={() => toggleFavorite(currentSong._id || currentSong.id)}
                aria-label="Like Song"
                className="text-primary-fixed-dim hover:text-primary transition-colors flex items-center ml-1 p-1 shrink-0 cursor-pointer"
              >
                <span
                  className={`material-symbols-outlined text-xl transition-all ${
                    isFav
                      ? "text-primary-container scale-110 drop-shadow-[0_0_8px_rgba(0,245,155,0.6)]"
                      : "text-outline hover:text-primary-container"
                  }`}
                  style={{ fontVariationSettings: isFav ? "'FILL' 1" : "'FILL' 0" }}
                >
                  favorite
                </span>
              </button>
            </>
          ) : (
            <>
              <div className="relative w-12 h-12 rounded-lg bg-surface-container overflow-hidden shrink-0 flex items-center justify-center shadow-[0_0_12px_rgba(0,245,155,0.15)] border border-white/5">
                <span className="material-symbols-outlined text-secondary text-2xl animate-pulse">
                  graphic_eq
                </span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-label-lg text-xs sm:text-[13px] text-on-surface truncate">
                  Ocean Eyes - 8D Audio Remaster
                </span>
                <span className="font-body-sm text-[11px] text-outline truncate">
                  Billie Eilish
                </span>
              </div>
            </>
          )}
        </div>

        {/* ================= CENTER SECTION: Controls & Scrubber ================= */}
        <div className="flex flex-col items-center gap-1.5 flex-1 max-w-2xl px-4">
          <div className="flex items-center gap-6">
            <button
              onClick={toggleShuffle}
              aria-label="Shuffle"
              className={`transition-colors cursor-pointer ${
                isShuffle ? "text-primary-container" : "text-outline hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-lg">shuffle</span>
            </button>

            <button
              onClick={playPrev}
              aria-label="Previous"
              className="text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-xl">skip_previous</span>
            </button>

            <button
              onClick={togglePlay}
              aria-label="Play Pause"
              className="w-10 h-10 rounded-full bg-primary-container hover:bg-primary-fixed text-on-primary-container flex items-center justify-center transition-all shadow-[0_0_16px_rgba(0,245,155,0.4)] hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span
                className="material-symbols-outlined text-2xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {isPlaying ? "pause" : "play_arrow"}
              </span>
            </button>

            <button
              onClick={playNext}
              aria-label="Next"
              className="text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-xl">skip_next</span>
            </button>

            <button
              onClick={toggleRepeat}
              aria-label="Repeat"
              className={`transition-colors cursor-pointer ${
                repeatMode !== "off"
                  ? "text-primary-container"
                  : "text-outline hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-lg">
                {repeatMode === "one" ? "repeat_one" : "repeat"}
              </span>
            </button>
          </div>

          <div className="w-full flex items-center gap-3 text-outline font-body-sm text-[11px] font-mono">
            <span className="w-8 text-right">{formatTime(currentTime)}</span>
            <div
              onClick={(e) => {
                if (!duration) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const pct = (e.clientX - rect.left) / rect.width;
                seek(pct * duration);
              }}
              className="relative flex-1 h-1 hover:h-2 bg-surface-container-high rounded-full overflow-hidden cursor-pointer group transition-all"
            >
              <div
                className="h-full bg-primary-container rounded-full transition-all group-hover:bg-primary-fixed"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="w-8 text-left">{formatTime(duration || 200)}</span>
          </div>
        </div>

        {/* ================= RIGHT SECTION: Spatial Mode, Volume, Tools ================= */}
        <div className="flex items-center gap-4 justify-end w-80">
          {/* 8D ON Pill Badge from Stitch */}
          <div
            onClick={() => {
              if (openModeSelector) {
                openModeSelector();
              } else {
                setIs8DActive(!is8DActive);
              }
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-container/20 text-primary-container shadow-[0_0_12px_rgba(0,245,155,0.3)] cursor-pointer hover:bg-primary-container/30 transition-all border border-primary-container/30"
          >
            <span className="material-symbols-outlined text-sm animate-spin">
              spatial_audio
            </span>
            <span className="font-label-caps text-[10px] font-bold tracking-wider">
              {audioMode?.toUpperCase() || "8D"} ON
            </span>
          </div>

          <button
            onClick={() => (onNavigate ? onNavigate("orbit") : handleOpenPlayer())}
            aria-label="Orbit Sound stage"
            className="text-outline hover:text-primary-container transition-colors cursor-pointer"
            title="Stage Orbit"
          >
            <span className="material-symbols-outlined text-xl">orbit</span>
          </button>

          <button
            onClick={onOpenQueue}
            aria-label="Playback Queue"
            className="text-outline hover:text-on-surface transition-colors cursor-pointer"
            title="Queue"
          >
            <span className="material-symbols-outlined text-xl">queue_music</span>
          </button>

          <button
            onClick={onOpenConnect}
            aria-label="Device Selector"
            className="text-outline hover:text-on-surface transition-colors cursor-pointer"
            title="Connect to device"
          >
            <span className="material-symbols-outlined text-xl">speaker_group</span>
          </button>

          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              aria-label="Volume"
              className="text-outline hover:text-on-surface transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">
                {isMuted || volume === 0
                  ? "volume_off"
                  : volume < 0.5
                  ? "volume_down"
                  : "volume_up"}
              </span>
            </button>

            <div
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                setVolume(pct);
              }}
              className="w-20 h-1 bg-surface-container-high rounded-full overflow-hidden cursor-pointer group transition-all hover:h-2"
            >
              <div
                className="h-full bg-on-surface-variant group-hover:bg-primary-container rounded-full transition-all"
                style={{ width: `${isMuted ? 0 : volume * 100}%` }}
              />
            </div>
          </div>

          <button
            onClick={() => (onNavigate ? onNavigate("orbit") : handleOpenPlayer())}
            aria-label="Visualizer"
            className="text-outline hover:text-on-surface transition-colors ml-1 cursor-pointer"
            title="Full Screen Visualizer"
          >
            <span className="material-symbols-outlined text-xl">fullscreen</span>
          </button>
        </div>
      </footer>
    </>
  );
}
