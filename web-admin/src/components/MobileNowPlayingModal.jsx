import React, { useState, useEffect, useMemo, useRef } from "react";
import { usePlayer } from "../context/PlayerContext";
import { getSynchronizedLyrics } from "../services/LyricsService";

export default function MobileNowPlayingModal({
  isOpen,
  onClose,
  onOpenQueue,
  onOpenConnect,
}) {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    seek,
    playNext,
    playPrev,
    audioMode,
    favorites,
    toggleFavorite,
    cycleStatus,
    resetPlaybackCycle,
    is8DActive,
    setIs8DActive,
  } = usePlayer();

  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState("all"); // 'all' | 'one' | 'off'
  const [isLyricsExpanded, setIsLyricsExpanded] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubValue, setScrubValue] = useState(0);

  const lyricsContainerRef = useRef(null);

  const DEFAULT_COVER =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCYHY4hp0r-GSzPdesFf5Z5mHQjlDX8zkLIjOdCA_IqUU_uw_nFr73ANifvOdaM2Q0NTsbK9ZB4CakHGH5fOSwA-_HynlD80C-hNL1oquc1m9K6gETHr9tKwpVJsxr8i3yXt8MxzxgSfUOhVYLQ8IqgfrlSGKs-61qE80eejtCqn6bE6dEiNbaAVFjYTn5bXQizoK0XcGh2VyyPyVMbGgVbr-Vnz7APr5Vg8HSuKiI1D50YhAVg3lfgaQ";

  // Get synchronized lyrics for current song
  const lyrics = useMemo(() => {
    return getSynchronizedLyrics(currentSong, duration || 210);
  }, [currentSong, duration]);

  // Find active line index based on currentTime
  const activeLyricIndex = useMemo(() => {
    if (!lyrics.length) return -1;
    let idx = 0;
    for (let i = 0; i < lyrics.length; i++) {
      if (currentTime >= lyrics[i].time) {
        idx = i;
      } else {
        break;
      }
    }
    return idx;
  }, [lyrics, currentTime]);

  // Smooth auto-scroll lyrics to keep active line centered
  useEffect(() => {
    if (lyricsContainerRef.current && activeLyricIndex >= 0) {
      const activeEl = lyricsContainerRef.current.children[activeLyricIndex];
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [activeLyricIndex]);

  if (!isOpen || !currentSong) return null;

  const isFav = favorites.has(currentSong._id || currentSong.id);

  const formatTime = (secs) => {
    if (isNaN(secs) || secs === Infinity) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const remainingTime = duration > currentTime ? duration - currentTime : 0;
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleScrubStart = () => {
    setIsScrubbing(true);
  };

  const handleScrubChange = (e) => {
    setScrubValue(Number(e.target.value));
  };

  const handleScrubEnd = () => {
    setIsScrubbing(false);
    seek(scrubValue);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentSong.title,
          text: `Listening to ${currentSong.title} by ${currentSong.artist} on Flow 8D Music!`,
          url: window.location.href,
        });
      } catch (e) {}
    } else {
      navigator.clipboard?.writeText(window.location.href);
      alert("Song link copied to clipboard!");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#121212] text-white overflow-hidden select-none animate-in slide-in-from-bottom duration-300">
      {/* Dynamic Ambient Background Glow */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-80 h-80 bg-gradient-to-b from-[#1DB954]/25 via-[#242424]/40 to-transparent blur-3xl pointer-events-none rounded-full" />

      {/* Pinned Top Navigation Bar */}
      <header className="sticky top-0 w-full z-40 bg-[#121212]/80 backdrop-blur-xl border-b border-white/5 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-neutral-300 hover:text-[#1DB954] transition-colors active:scale-95"
            aria-label="Dismiss Player"
          >
            <span className="material-symbols-outlined text-2xl">expand_more</span>
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold tracking-tight text-white uppercase">Now Playing</h1>
            <span className="text-[10px] font-mono bg-[#1DB954]/20 text-[#1DB954] font-bold px-2 py-0.5 rounded-full">
              {audioMode?.toUpperCase() || "8D"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenConnect}
            className="w-9 h-9 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
            title="Connect Device"
          >
            <span className="material-symbols-outlined text-xl">speaker_group</span>
          </button>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-neutral-300 hover:text-white"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      </header>

      {/* Main Scrollable Player Body */}
      <main className="flex-1 overflow-y-auto px-5 pt-2 pb-12 flex flex-col items-center">
        {/* Playlist Sub-Header Context */}
        <div className="flex flex-col items-center justify-center text-center my-3">
          <span className="text-[11px] uppercase tracking-widest text-neutral-400 font-semibold">
            Playing from Playlist
          </span>
          <span className="text-xs font-bold text-white mt-0.5 flex items-center gap-1 cursor-pointer hover:text-[#1DB954] transition-colors">
            312 Trending Tamil Hits
            <span className="material-symbols-outlined text-sm text-neutral-400">chevron_right</span>
          </span>
        </div>

        {/* Album Artwork Stage */}
        <div className="w-full flex items-center justify-center my-4 max-w-sm">
          <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.8)] border border-white/10 group bg-black">
            <img
              src={currentSong.imageUrl || DEFAULT_COVER}
              alt={currentSong.title}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = DEFAULT_COVER;
              }}
            />
            {/* Vinyl Micro-Sheen reflection overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/10 pointer-events-none" />

            {/* Spatial 8D Orbit Indicator */}
            {is8DActive && (
              <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md border border-[#00f2fe]/40 px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-md">
                <span className="w-2 h-2 rounded-full bg-[#00f2fe] animate-pulse" />
                <span className="text-[10px] font-mono font-bold text-[#00f2fe] tracking-wider uppercase">
                  8D Orbit Active
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Track Metadata & Favorite */}
        <div className="w-full max-w-sm flex items-center justify-between mt-2 mb-4">
          <div className="flex flex-col min-w-0 pr-3">
            <h2 className="text-xl sm:text-2xl font-black text-white truncate tracking-tight">
              {currentSong.title}
            </h2>
            <p className="text-sm text-neutral-400 truncate mt-0.5">
              {currentSong.artist || "Flow 8D Artist"}
            </p>
          </div>
          <button
            onClick={() => toggleFavorite(currentSong._id || currentSong.id)}
            className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-white/10 active:scale-90 transition-all text-[#1DB954]"
            aria-label="Save to Your Library"
          >
            <span
              className="material-symbols-outlined text-3xl"
              style={{ fontVariationSettings: isFav ? "'FILL' 1" : "'FILL' 0" }}
            >
              favorite
            </span>
          </button>
        </div>

        {/* Scrubber Progress Bar & Timestamps */}
        <div className="w-full max-w-sm flex flex-col gap-1.5 mb-5">
          <div className="relative w-full flex items-center">
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={isScrubbing ? scrubValue : currentTime}
              onMouseDown={handleScrubStart}
              onTouchStart={handleScrubStart}
              onChange={handleScrubChange}
              onMouseUp={handleScrubEnd}
              onTouchEnd={handleScrubEnd}
              className="w-full h-1.5 bg-neutral-700 rounded-full appearance-none cursor-pointer accent-white hover:accent-[#1DB954] transition-all"
            />
          </div>
          <div className="flex justify-between items-center text-xs font-mono text-neutral-400 pt-0.5">
            <span>{formatTime(isScrubbing ? scrubValue : currentTime)}</span>
            <span>-{formatTime(remainingTime)}</span>
          </div>
        </div>

        {/* Transport & Playback Control Suite */}
        <div className="w-full max-w-sm flex items-center justify-between px-2 mb-6">
          {/* Shuffle Button */}
          <button
            onClick={() => setIsShuffle(!isShuffle)}
            className={`w-10 h-10 flex flex-col items-center justify-center transition-all active:scale-95 ${
              isShuffle ? "text-[#1DB954]" : "text-neutral-400 hover:text-white"
            }`}
            aria-label="Shuffle"
          >
            <span className="material-symbols-outlined text-2xl">shuffle</span>
            {isShuffle && <span className="w-1 h-1 bg-[#1DB954] rounded-full mt-0.5" />}
          </button>

          {/* Previous Track Button */}
          <button
            onClick={playPrev}
            className="w-12 h-12 flex items-center justify-center text-neutral-200 hover:text-[#1DB954] active:scale-90 transition-all"
            aria-label="Previous Track"
          >
            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              skip_previous
            </span>
          </button>

          {/* Giant Play / Pause FAB Button */}
          <button
            onClick={togglePlay}
            className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            <span
              className="material-symbols-outlined text-4xl select-none"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {isPlaying ? "pause" : "play_arrow"}
            </span>
          </button>

          {/* Next Track Button */}
          <button
            onClick={playNext}
            className="w-12 h-12 flex items-center justify-center text-neutral-200 hover:text-[#1DB954] active:scale-90 transition-all"
            aria-label="Next Track"
          >
            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              skip_next
            </span>
          </button>

          {/* Repeat / Smart Cycle Button */}
          <button
            onClick={resetPlaybackCycle}
            title={
              cycleStatus
                ? `Smart Cycle #${cycleStatus.cycleId}: ${cycleStatus.playedCount} played`
                : "Cycle Loop"
            }
            className="w-10 h-10 flex flex-col items-center justify-center text-[#1DB954] hover:text-white transition-colors active:scale-90"
            aria-label="Repeat Cycle"
          >
            <span className="material-symbols-outlined text-2xl">repeat</span>
            {cycleStatus && (
              <span className="text-[9px] font-mono font-bold leading-none">#{cycleStatus.cycleId}</span>
            )}
          </button>
        </div>

        {/* Quick Device Routing & Utility Footer */}
        <div className="w-full max-w-sm flex items-center justify-between text-neutral-400 text-xs mb-6">
          {/* Spotify Connect Pill */}
          <button
            onClick={onOpenConnect}
            className="flex items-center gap-2 text-[#1DB954] hover:opacity-85 transition-opacity px-3 py-1.5 rounded-full bg-[#1DB954]/10 border border-[#1DB954]/20"
          >
            <span className="material-symbols-outlined text-lg">speaker_group</span>
            <span className="font-semibold tracking-tight">Flow 8D Output</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#1DB954] animate-pulse" />
          </button>

          {/* Share & Queue Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIs8DActive(!is8DActive)}
              className={`w-9 h-9 flex items-center justify-center rounded-full transition-all ${
                is8DActive ? "text-[#00f2fe] bg-[#00f2fe]/10" : "text-neutral-400 hover:text-white"
              }`}
              title="8D Spatial Sound"
            >
              <span className="material-symbols-outlined text-xl">spatial_audio</span>
            </button>
            <button
              onClick={handleShare}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 text-neutral-400 hover:text-white active:scale-90 transition-all"
              title="Share Track"
            >
              <span className="material-symbols-outlined text-xl">share</span>
            </button>
            <button
              onClick={onOpenQueue}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 text-neutral-400 hover:text-white active:scale-90 transition-all"
              title="Current Queue"
            >
              <span className="material-symbols-outlined text-xl">queue_music</span>
            </button>
          </div>
        </div>

        {/* Synchronized Lyrics Drawer Card */}
        <div className="w-full max-w-sm pb-6">
          <div
            className={`w-full rounded-2xl bg-gradient-to-b from-[#2e1933] to-[#1a0e1c] p-5 shadow-2xl relative overflow-hidden transition-all duration-300 border border-purple-500/20 ${
              isLyricsExpanded ? "max-h-[500px]" : "max-h-[280px]"
            }`}
          >
            {/* Top Light-bleed glow inside lyrics card */}
            <div className="absolute -top-12 left-1/4 w-48 h-24 bg-[#1DB954]/20 blur-2xl pointer-events-none rounded-full" />

            {/* Lyrics Header & Expand Button */}
            <div className="flex items-center justify-between w-full mb-3 relative z-10">
              <span className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#1DB954] text-lg">mic</span>
                Lyrics
              </span>
              <button
                onClick={() => setIsLyricsExpanded(!isLyricsExpanded)}
                className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-white hover:bg-white/20 transition-colors"
              >
                <span>{isLyricsExpanded ? "Less" : "More"}</span>
                <span className="material-symbols-outlined text-sm">
                  {isLyricsExpanded ? "close_fullscreen" : "open_in_full"}
                </span>
              </button>
            </div>

            {/* Karaoke-Synced Lyric Line Flow */}
            <div
              ref={lyricsContainerRef}
              className="flex flex-col gap-3 relative z-10 py-1 overflow-y-auto max-h-[200px] no-scrollbar scroll-smooth"
            >
              {lyrics.map((line, idx) => {
                const isPast = idx < activeLyricIndex;
                const isActive = idx === activeLyricIndex;
                const isUpcoming = idx > activeLyricIndex;

                return (
                  <p
                    key={idx}
                    onClick={() => seek(line.time)}
                    className={`cursor-pointer transition-all duration-300 leading-snug ${
                      isActive
                        ? "text-lg sm:text-xl font-extrabold text-white drop-shadow-[0_4px_12px_rgba(255,255,255,0.3)] scale-[1.02]"
                        : isPast
                        ? "text-sm sm:text-base font-semibold text-white/35 hover:text-white/60"
                        : "text-sm sm:text-base font-semibold text-white/35 hover:text-white/60"
                    }`}
                  >
                    {line.text}
                  </p>
                );
              })}
            </div>

            {/* Bottom gradient fader indicating continuous scrolling */}
            <div className="w-full h-6 bg-gradient-to-t from-[#1a0e1c] to-transparent pointer-events-none mt-1" />
          </div>
        </div>
      </main>
    </div>
  );
}
