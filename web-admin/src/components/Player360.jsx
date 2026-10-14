import React from "react";
import { usePlayer } from "../context/PlayerContext";

export default function Player360() {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    audioMode,
    cycleStatus,
    resetPlaybackCycle,
    is8DActive,
    orbitSpeed,
    spatialDepth,
    reverbRoom,
    favorites,
    setShowFullPlayer,
    setIs8DActive,
    setOrbitSpeed,
    setSpatialDepth,
    setReverbRoom,
    togglePlay,
    seek,
    playNext,
    playPrev,
    toggleFavorite,
    isOnline,
    offlineNotice,
    setOfflineNotice,
    startOfflineSynth,
  } = usePlayer();

  if (!currentSong) return null;

  const formatTime = (secs) => {
    if (isNaN(secs)) return "00:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const isFav = favorites.has(currentSong._id || currentSong.id);
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-2xl p-4 overflow-y-auto">
      {/* Container simulating the Stitch Mobile Player Frame / Responsive Frame */}
      <div className="relative w-full max-w-[420px] min-h-[780px] bg-[#07091B] rounded-[44px] border-[3px] border-purple-500/30 shadow-[0_25px_80px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col justify-between p-6">
        {/* Atmospheric Radiant Background Blurs from Stitch */}
        <div className="absolute -top-24 -left-20 w-80 h-80 bg-purple-600/25 rounded-full blur-[90px] pointer-events-none"></div>
        <div className="absolute top-1/3 -right-24 w-80 h-80 bg-cyan-400/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute -bottom-20 left-10 w-96 h-96 bg-purple-800/25 rounded-full blur-[110px] pointer-events-none"></div>

        {/* Top Navigation Bar */}
        <nav className="relative z-20 flex items-center justify-between mb-2">
          <button
            onClick={() => setShowFullPlayer(false)}
            className="w-10 h-10 rounded-full bg-slate-900/70 backdrop-blur-md border border-slate-700/60 flex items-center justify-center text-slate-300 hover:text-white transition active:scale-95 shadow-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M15.75 19.5L8.25 12l7.5-7.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div className="text-center">
            <span className="text-[10px] tracking-[0.25em] uppercase text-cyan-400 font-bold block mb-0.5">
              {audioMode === "normal" ? "Studio Master Direct" : "Spatial Engine 3.0"}
            </span>
            <h1 className="text-sm font-semibold tracking-wide text-slate-200">
              {audioMode === "normal" ? "Pure Stereo Sound" : "360° Binaural Orbit"}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIs8DActive(!is8DActive)}
              title={is8DActive ? "8D Spatial Orbit Active" : "8D Orbit Muted"}
              className={`w-10 h-10 rounded-full backdrop-blur-md border flex items-center justify-center transition active:scale-95 shadow-md ${
                is8DActive ? "bg-cyan-950/70 border-cyan-400 text-cyan-300 shadow-neon-cyan" : "bg-slate-900/60 border-slate-700/50 text-slate-400"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M3 18v-6a9 9 0 0118 0v6M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3v5zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3v5z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <button
              onClick={() => toggleFavorite(currentSong._id || currentSong.id)}
              className="w-10 h-10 rounded-full bg-slate-900/70 backdrop-blur-md border border-slate-700/60 flex items-center justify-center hover:scale-105 transition active:scale-90 shadow-md"
            >
              <svg className={`w-5 h-5 ${isFav ? "fill-pink-500 text-pink-500 drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]" : "text-slate-400 fill-none"}`} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </button>
          </div>
        </nav>

        {/* Smart No-Repeat Playback Cycle Badge */}
        {cycleStatus && (
          <div className="relative z-20 flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-[11px] mb-2 backdrop-blur-md">
            <div className="flex items-center gap-1.5 text-cyan-300 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-bold">Cycle #{cycleStatus.cycleId}</span>
              <span className="text-purple-300/60">•</span>
              <span className="text-purple-200">
                {cycleStatus.playedCount} played
                {cycleStatus.totalEligible > 0 ? ` / ${cycleStatus.totalEligible}` : ""}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-purple-300/80 font-mono">
              <span className="text-emerald-400 font-semibold">⚡ No-Repeat Active</span>
            </div>
          </div>
        )}

        {/* Offline Status Warning & Ambient Switcher */}
        {offlineNotice && (
          <div className="relative z-30 mx-1 my-2 p-3 rounded-2xl bg-[#2a1708]/95 border border-amber-500/50 text-amber-200 text-xs shadow-xl backdrop-blur-md flex flex-col gap-2 animate-fadeIn">
            <div className="flex items-start justify-between gap-2">
              <span className="flex items-center gap-1.5 font-bold text-amber-300">
                <span>📡</span>
                <span>{offlineNotice}</span>
              </span>
              <button
                onClick={() => setOfflineNotice(null)}
                className="text-amber-400 hover:text-white text-xs px-1.5 py-0.5 rounded-full hover:bg-white/10"
              >
                ✕
              </button>
            </div>
            <button
              onClick={() => startOfflineSynth("Offline 8D Meditative Waves (432Hz)")}
              className="w-full py-1.5 px-3 rounded-xl bg-gradient-to-r from-purple-800 to-cyan-700 hover:brightness-110 text-white font-bold text-xs flex items-center justify-center gap-2 border border-cyan-400/50 shadow-md active:scale-95 transition-all"
            >
              <span>🎧 Play Offline 8D Ambient Sound</span>
              <span className="text-[10px] text-cyan-200 bg-black/40 px-2 py-0.5 rounded-full font-mono">No Internet Needed</span>
            </button>
          </div>
        )}

        {/* 3D Holographic Orbital Sound Ring Stage from Stitch */}
        <section className="relative z-10 flex-1 flex flex-col items-center justify-center my-4" style={{ perspective: "1000px" }}>
          <div className="relative w-64 h-64 md:w-72 md:h-72 flex items-center justify-center">
            {/* Outer Atmospheric Radial Halo */}
            <div className="absolute inset-0 rounded-full border border-cyan-500/20 pulse-glow"></div>
            <div className="absolute inset-5 rounded-full border border-violet-500/25 bg-gradient-to-b from-cyan-500/5 via-purple-600/5 to-transparent"></div>

            {/* 3D Inclined Sound Plane Rings (Simulating 360 sound-stage) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {/* Orbit Ring 1 with rotating sound node */}
              <div
                className={`absolute w-64 h-64 rounded-full border border-dashed border-cyan-400/50 flex items-center justify-start ${isPlaying && is8DActive ? "orbital-ring-1" : ""}`}
                style={{ animationDuration: `${12 / orbitSpeed}s` }}
              >
                <div className="w-4 h-4 -ml-2 rounded-full bg-cyan-400 shadow-glow-cyan border-2 border-white flex items-center justify-center">
                  <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                </div>
              </div>

              {/* Orbit Ring 2 with counter-rotating sound node */}
              <div
                className={`absolute w-52 h-52 rounded-full border border-violet-400/40 flex items-center justify-end ${isPlaying && is8DActive ? "orbital-ring-2" : ""}`}
                style={{ animationDuration: `${8 / orbitSpeed}s` }}
              >
                <div className="w-3.5 h-3.5 -mr-1.5 rounded-full bg-pink-500 shadow-glow-violet border-2 border-white"></div>
              </div>

              {/* Orbit Ring 3 inner frequency line */}
              <div
                className={`absolute w-40 h-40 rounded-full border border-purple-500/40 ${isPlaying && is8DActive ? "orbital-ring-3" : ""}`}
                style={{ animationDuration: `${18 / orbitSpeed}s` }}
              ></div>
            </div>

            {/* Center Album Art & Listener Node */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-3xl blur-md opacity-70 group-hover:opacity-100 transition duration-500"></div>
                <div className="relative w-28 h-28 rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-slate-900">
                  <img
                    alt={currentSong.title}
                    className="w-full h-full object-cover"
                    src={currentSong.imageUrl || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><defs><linearGradient id='g' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%237b2cbf'/><stop offset='100%' stop-color='%2300f0ff'/></linearGradient></defs><rect width='100' height='100' rx='16' fill='url(%23g)'/><circle cx='50' cy='50' r='20' fill='%2307050b' opacity='0.7'/><circle cx='50' cy='50' r='8' fill='%2300f0ff'/></svg>"}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><defs><linearGradient id='g' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%237b2cbf'/><stop offset='100%' stop-color='%2300f0ff'/></linearGradient></defs><rect width='100' height='100' rx='16' fill='url(%23g)'/><circle cx='50' cy='50' r='20' fill='%2307050b' opacity='0.7'/><circle cx='50' cy='50' r='8' fill='%2300f0ff'/></svg>";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent"></div>

                  {/* Equalizer Wavelets on artwork */}
                  <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-1">
                    <span className={`w-1 bg-cyan-400 rounded-full ${isPlaying ? "bar-anim-1" : "h-1"}`}></span>
                    <span className={`w-1 bg-cyan-300 rounded-full ${isPlaying ? "bar-anim-2" : "h-1"}`}></span>
                    <span className={`w-1 bg-purple-400 rounded-full ${isPlaying ? "bar-anim-3" : "h-1"}`}></span>
                    <span className={`w-1 bg-pink-400 rounded-full ${isPlaying ? "bar-anim-4" : "h-1"}`}></span>
                  </div>
                </div>
              </div>

              {/* Listener Perspective Avatar Badge */}
              <div className="mt-3 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3.5 py-1 rounded-full border border-cyan-400/30 shadow-lg">
                <span className={`w-2 h-2 rounded-full ${is8DActive && isPlaying ? "bg-cyan-400 animate-ping" : "bg-purple-400"}`}></span>
                <span className="text-[10px] font-bold text-cyan-300 tracking-wider uppercase font-mono">
                  {is8DActive ? `Orbit: ${(orbitSpeed * 60).toFixed(0)} RPM` : "Spatial Bypass"}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Track Metadata Info */}
        <div className="text-center my-2 z-20">
          <h2 className="text-lg font-extrabold text-white tracking-tight truncate drop-shadow">
            {currentSong.title}
          </h2>
          <p className="text-xs text-purple-300/80 truncate mt-0.5">
            {currentSong.artist} • {currentSong.category}
          </p>
        </div>

        {/* Spatial Engine Adjusters */}
        <div className="bg-[#120c24]/80 rounded-2xl p-3 border border-purple-500/25 space-y-2 z-20 shadow-inner">
          <div className="flex items-center justify-between text-[11px] text-purple-200">
            <span className="font-semibold text-cyan-300 flex items-center gap-1">
              <span>💫 Orbit Speed</span>
            </span>
            <div className="flex items-center gap-1.5 font-mono">
              {[0.5, 1.0, 1.5, 2.0].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setOrbitSpeed(speed)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                    orbitSpeed === speed
                      ? "bg-brand-cyan text-black shadow-neon-cyan"
                      : "bg-purple-900/50 text-purple-300 hover:text-white"
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-purple-200 pt-1">
            <span className="font-semibold text-purple-300">Spatial Depth ({spatialDepth}%)</span>
            <input
              type="range"
              min="20"
              max="100"
              value={spatialDepth}
              onChange={(e) => setSpatialDepth(Number(e.target.value))}
              className="w-36"
            />
          </div>
        </div>

        {/* Scrubber Progress Bar */}
        <div className="space-y-1.5 mt-3 z-20">
          <div
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const ratio = clickX / rect.width;
              seek(ratio * duration);
            }}
            className="w-full h-2 rounded-full bg-slate-800/80 cursor-pointer overflow-hidden relative border border-purple-500/20"
          >
            <div
              className="h-full bg-gradient-to-r from-brand-purple via-brand-accent to-brand-cyan rounded-full transition-all duration-100 shadow-neon-cyan"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center text-[11px] font-mono text-purple-300/60 px-0.5">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Transport Controls from Stitch */}
        <div className="flex items-center justify-between mt-2 z-20 px-2">
          <button className="text-purple-300/60 hover:text-cyan-300 transition-colors p-2">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
            </svg>
          </button>

          <button onClick={playPrev} className="text-white hover:text-cyan-300 transition-transform active:scale-90 p-2">
            <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </button>

          {/* Glowing Play/Pause FAB Button from Stitch */}
          <button
            onClick={togglePlay}
            className="w-16 h-16 rounded-full bg-gradient-to-tr from-brand-purple via-purple-600 to-brand-cyan flex items-center justify-center text-white shadow-glow-play hover:scale-105 active:scale-95 transition-all duration-200"
          >
            {isPlaying ? (
              <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg className="w-8 h-8 fill-current ml-1" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <button onClick={playNext} className="text-white hover:text-cyan-300 transition-transform active:scale-90 p-2">
            <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
          </button>

          <button
            onClick={() => setIs8DActive(!is8DActive)}
            className={`transition-colors p-2 ${is8DActive ? "text-cyan-300" : "text-purple-300/60"}`}
            title="8D Bilateral Stimulation"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
