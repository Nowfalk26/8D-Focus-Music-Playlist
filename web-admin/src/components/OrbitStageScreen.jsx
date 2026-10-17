import React, { useState, useEffect } from "react";
import { usePlayer } from "../context/PlayerContext";
import MiloCatChat from "./MiloCatChat";

export default function OrbitStageScreen({ onNavigate }) {
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
    orbitSpeed,
    setOrbitSpeed,
    spatialDepth,
    setSpatialDepth,
    favorites,
    toggleFavorite,
    audioMode,
    recommendations,
    playSong,
    showMiloChat,
    setShowMiloChat,
    miloInitialQuery,
    setMiloInitialQuery,
    cycleStatus,
  } = usePlayer();

  const [activeProfile, setActiveProfile] = useState("cosmic");
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [azimuth, setAzimuth] = useState(142);
  const [pinnaElevation, setPinnaElevation] = useState(12.4);
  const [dopplerIntensity, setDopplerIntensity] = useState(1.84);
  const [crossfeed, setCrossfeed] = useState(34);
  const [headShadow, setHeadShadow] = useState(4.2);

  const formatTime = (secs) => {
    if (isNaN(secs)) return "00:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const isFav = currentSong ? favorites.has(currentSong._id || currentSong.id) : false;
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Live azimuth rotation simulation
  useEffect(() => {
    if (!isPlaying || !is8DActive) return;
    const interval = setInterval(() => {
      setAzimuth((prev) => (prev + 2) % 360);
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying, is8DActive]);

  const acousticProfiles = [
    {
      id: "cosmic",
      name: "Cosmic Orbit (Infinite)",
      sub: "360° Rotational Decay",
      icon: "blur_circular",
    },
    {
      id: "albert",
      name: "Royal Albert Hall",
      sub: "Pre-delay 42ms • RT60 2.2s",
      icon: "stadium",
    },
    {
      id: "studio_b",
      name: "Studio B Intimate Dry",
      sub: "Damped Walls • Close Mic",
      icon: "graphic_eq",
    },
    {
      id: "drift",
      name: "Binaural Drift Stage",
      sub: "Asymmetric Pitch Mod",
      icon: "explore",
    },
  ];

  const DEFAULT_COVER =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBJzfIrngvyWKGooeq-g6tZChw8oYnythmtW12SCMjbs9Owm1PH0pP7lL3ZFByOQ-_jIJk7r83py0YjVUHEuyG0eXpgRTHXsdiRN1c-4d79W_6huQXCX4EqT3oRh9MFgPgRfed6OSj_Ylqx6THm-B-NV59C19abE9xNVX3xCWCKUPFh1TImwBqdMsXfI6kUAtryFqKoEETWrf45SdUP3HtJjf_RM6vLaB7mFuqg9v8PW-9dc6QgeXafjw";

  return (
    <div className="w-full flex flex-col min-h-screen text-slate-200 font-sans pb-24">
      {/* Top Header / Telemetry Bar */}
      <div className="px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 bg-[#0a0a14]/80 backdrop-blur-xl border-b border-white/5 rounded-2xl mb-6">
        <div className="flex items-center gap-4 flex-1 max-w-xl w-full">
          <div className="relative w-full flex items-center">
            <span className="material-symbols-outlined absolute left-4 text-slate-400 text-lg flex items-center justify-center leading-none">search</span>
            <input
              className="w-full bg-[#131322] text-white placeholder:text-slate-400 text-xs rounded-full py-2.5 pl-11 pr-14 focus:outline-none focus:ring-1 focus:ring-cyan-400 border border-white/10 shadow-inner leading-none"
              placeholder="Search spatial stems, binaural tracks, HRTF presets..."
              type="text"
            />
            <span className="absolute right-3.5 text-[10px] font-mono text-slate-400 bg-[#1b1b30] px-2.5 py-1 rounded-full border border-white/10 leading-none">
              ⌘K
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap justify-end">
          {/* 8D DSP Active Toggle */}
          <div className="inline-flex items-center justify-center text-center gap-2.5 bg-[#131322] border border-cyan-400/40 px-4 py-2 rounded-full shadow-glow-cyan leading-none min-h-[34px]">
            <span className={`w-2 h-2 rounded-full ${is8DActive ? "bg-cyan-400 animate-ping" : "bg-slate-500"}`}></span>
            <span className="text-[11px] font-mono font-bold text-cyan-300 tracking-wider leading-none">
              {is8DActive ? "8D DSP ACTIVE" : "8D DSP OFF"}
            </span>
            <button
              onClick={() => setIs8DActive(!is8DActive)}
              aria-label="Toggle DSP"
              className={`w-7 h-4 rounded-full relative flex items-center px-0.5 transition-colors ${
                is8DActive ? "bg-cyan-500" : "bg-slate-700"
              }`}
            >
              <span
                className={`w-3 h-3 rounded-full bg-white shadow transition-transform ${
                  is8DActive ? "translate-x-3" : "translate-x-0"
                }`}
              ></span>
            </button>
          </div>

          {/* Milo AI Assistant */}
          <button
            onClick={() => setShowMiloChat(true)}
            className="inline-flex items-center justify-center text-center gap-2 bg-[#1b1b30] hover:bg-purple-900/40 border border-purple-500/30 text-purple-200 px-4 py-2 rounded-full text-xs font-semibold leading-none min-h-[34px] transition-all shadow-glow-purple active:scale-95"
          >
            <span className="material-symbols-outlined text-pink-400 text-sm leading-none">smart_toy</span>
            <span className="inline-flex items-center justify-center leading-none">MILO AI</span>
            <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse"></span>
          </button>

          <div className="h-5 w-px bg-white/10 hidden sm:block"></div>

          {/* Admin Profile */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center font-bold text-xs text-white ring-2 ring-cyan-400/20 leading-none">
              A
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-bold text-white leading-tight">Admin Master</span>
              <span className="text-[10px] font-mono text-cyan-400 leading-tight">STUDIO ENGINEER</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stage Sub-header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center text-center px-4 py-1.5 rounded-full text-[11px] font-mono font-bold text-cyan-400 bg-[#131322] border border-cyan-400/30 tracking-widest uppercase leading-none min-h-[30px]">
            STAGE 01
          </span>
          <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2 font-display">
            <span>360° Binaural Orbit</span>
            <span
              className={`material-symbols-outlined text-cyan-400 text-lg ${
                isPlaying ? "animate-spin" : ""
              }`}
              style={{ animationDuration: "8s" }}
            >
              sync
            </span>
          </h2>
        </div>
        <div className="inline-flex items-center justify-center text-center gap-2 bg-[#0a0a14] border border-white/10 px-4 py-2 rounded-full text-[10px] font-mono text-slate-300 leading-none min-h-[30px]">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>HRTF BINAURAL MATRIX • 96kHz 32-bit FLOAT</span>
        </div>
      </div>

      {/* Main 3-Column Workstation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Vector Field & Acoustic Room Profiles */}
        <div className="lg:col-span-3 flex flex-col gap-5">
          {/* Spatial Vector Field Card */}
          <div className="glass-card rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                SPATIAL VECTOR FIELD
              </span>
              <span className="material-symbols-outlined text-cyan-400 text-base">spatial_audio_off</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="bg-[#0a0a14] border border-white/5 rounded-xl p-2.5 flex flex-col items-center">
                <span className="text-[10px] font-mono text-slate-400">AXIS X</span>
                <span className="text-base font-bold text-cyan-300 font-mono">
                  {(Math.cos((azimuth * Math.PI) / 180) * 0.8).toFixed(2)}
                </span>
                <span className="text-[9px] font-mono text-slate-400">LATERAL</span>
              </div>
              <div className="bg-[#0a0a14] border border-white/5 rounded-xl p-2.5 flex flex-col items-center">
                <span className="text-[10px] font-mono text-slate-400">AXIS Y</span>
                <span className="text-base font-bold text-purple-300 font-mono">
                  {(Math.sin((azimuth * Math.PI) / 180) * 0.4).toFixed(2)}
                </span>
                <span className="text-[9px] font-mono text-slate-400">ELEVATION</span>
              </div>
              <div className="bg-[#0a0a14] border border-white/5 rounded-xl p-2.5 flex flex-col items-center">
                <span className="text-[10px] font-mono text-slate-400">AXIS Z</span>
                <span className="text-base font-bold text-pink-300 font-mono">+0.88</span>
                <span className="text-[9px] font-mono text-slate-400">DEPTH</span>
              </div>
            </div>

            {/* Ear Phase Balance */}
            <div className="bg-[#0a0a14]/60 rounded-xl p-3 flex flex-col gap-2 border border-white/5">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-300">
                <span>EAR PHASE BALANCE</span>
                <span className="text-cyan-400 font-bold">
                  L {Math.round(50 + Math.cos((azimuth * Math.PI) / 180) * 20)}% / R{" "}
                  {Math.round(50 - Math.cos((azimuth * Math.PI) / 180) * 20)}%
                </span>
              </div>
              <div className="h-2 w-full bg-[#131322] rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-cyan-400 transition-all duration-100"
                  style={{ width: `${50 + Math.cos((azimuth * Math.PI) / 180) * 20}%` }}
                ></div>
                <div
                  className="h-full bg-purple-500 transition-all duration-100"
                  style={{ width: `${50 - Math.cos((azimuth * Math.PI) / 180) * 20}%` }}
                ></div>
              </div>
            </div>

            {/* Realtime Spectrum Intensity */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase">
                REALTIME SPECTRUM INTENSITY
              </span>
              <div className="h-14 w-full flex items-end justify-between gap-1 px-2 bg-[#0a0a14] rounded-xl py-2 border border-white/5">
                {[45, 75, 30, 85, 60, 95, 40, 65, 80, 50, 70, 35].map((h, i) => (
                  <div
                    key={i}
                    className="w-1.5 rounded-t transition-all duration-300"
                    style={{
                      height: isPlaying ? `${Math.min(100, h * (0.8 + Math.random() * 0.4))}%` : "15%",
                      backgroundColor:
                        i < 4 ? "#00f2fe" : i < 8 ? "#b026ff" : "#f72585",
                    }}
                  ></div>
                ))}
              </div>
            </div>
          </div>

          {/* Acoustic Room Profiles */}
          <div className="glass-card rounded-2xl p-5 flex flex-col gap-3">
            <span className="text-[10px] font-mono font-bold text-slate-400 tracking-wider uppercase">
              ACOUSTIC ROOM PROFILES
            </span>
            <div className="flex flex-col gap-2.5">
              {acousticProfiles.map((p) => {
                const isSelected = activeProfile === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setActiveProfile(p.id)}
                    className={`flex items-center justify-between px-4 py-3 rounded-2xl text-left transition-all ${
                      isSelected
                        ? "bg-[#1b1b30] border-2 border-cyan-400 shadow-glow-cyan text-white"
                        : "bg-[#0a0a14] hover:bg-[#131322] border border-white/10 text-neutral-300 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40"
                            : "bg-white/5 text-slate-400 border border-white/5"
                        }`}
                      >
                        <span className="material-symbols-outlined text-lg leading-none">
                          {p.icon}
                        </span>
                      </div>
                      <div>
                        <div className="text-xs font-bold leading-tight">{p.name}</div>
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5 leading-tight">{p.sub}</div>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f2fe] shrink-0"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center Column: 360 Binaural Orbit Stage */}
        <div className="lg:col-span-6 glass-panel rounded-3xl relative overflow-hidden flex flex-col items-center justify-between p-6 shadow-2xl min-h-[580px] border border-white/10">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 via-transparent to-cyan-500/10 pointer-events-none"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full bg-purple-600/5 blur-3xl pointer-events-none"></div>

          {/* Orbit Stage Header HUD */}
          <div className="w-full flex items-center justify-between z-10">
            <button
              onClick={() => onNavigate("home")}
              className="w-9 h-9 rounded-full bg-[#131322] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <div className="flex items-center gap-2 bg-[#0a0a14]/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-cyan-400/30">
              <span className="material-symbols-outlined text-cyan-400 text-sm">headphones</span>
              <span className="text-[10px] font-mono font-bold text-cyan-300 tracking-widest uppercase">
                BINAURAL HEAD TRACKING ON
              </span>
            </div>
            <button
              onClick={() => currentSong && toggleFavorite(currentSong._id || currentSong.id)}
              className="w-9 h-9 rounded-full bg-[#131322] border border-white/10 flex items-center justify-center text-slate-300 hover:text-pink-400 transition-colors"
            >
              <span
                className={`material-symbols-outlined text-sm ${
                  isFav ? "text-pink-500" : "text-slate-400"
                }`}
                style={{ fontVariationSettings: isFav ? "'FILL' 1" : "'FILL' 0" }}
              >
                favorite
              </span>
            </button>
          </div>

          {/* Interactive Binaural Orbital Visualizer */}
          <div className="relative w-full flex-1 flex items-center justify-center py-8">
            {/* Outer animated concentric rings */}
            <div
              className={`absolute w-[380px] h-[380px] md:w-[440px] md:h-[440px] rounded-full border border-white/10 ${
                isPlaying ? "animate-spin" : ""
              }`}
              style={{ animationDuration: "40s" }}
            ></div>
            <div
              className={`absolute w-[300px] h-[300px] md:w-[340px] md:h-[340px] rounded-full border border-cyan-400/20 border-dashed ${
                isPlaying ? "animate-spin" : ""
              }`}
              style={{ animationDuration: "25s", animationDirection: "reverse" }}
            ></div>
            <div className="absolute w-[220px] h-[220px] md:w-[240px] md:h-[240px] rounded-full border border-purple-500/30"></div>
            <div className="absolute w-[360px] h-[140px] rounded-full border border-cyan-400/30 -rotate-12 pointer-events-none"></div>
            <div className="absolute w-[360px] h-[140px] rounded-full border border-purple-400/30 rotate-12 pointer-events-none"></div>

            {/* Orbiting sound node */}
            <div
              className="absolute w-full h-full flex items-center justify-center pointer-events-none transition-transform duration-100"
              style={{ transform: `rotate(${azimuth}deg)` }}
            >
              <div className="w-4 h-4 rounded-full bg-cyan-400 shadow-glow-cyan -translate-y-44">
                <span className="w-full h-full block rounded-full bg-cyan-300 animate-ping"></span>
              </div>
            </div>

            {/* Center Album Art & Listener */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-32 h-32 md:w-36 md:h-36 rounded-2xl overflow-hidden bg-[#131322] shadow-2xl relative group cursor-pointer p-1 bg-gradient-to-tr from-purple-500 via-transparent to-cyan-400">
                <img
                  className="w-full h-full object-cover rounded-xl"
                  src={currentSong?.imageUrl || DEFAULT_COVER}
                  alt={currentSong?.title || "Spatial Audio"}
                />
                <div
                  onClick={togglePlay}
                  className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"
                >
                  <span className="material-symbols-outlined text-white text-4xl">
                    {isPlaying ? "pause" : "play_arrow"}
                  </span>
                </div>
              </div>

              <div className="mt-3 px-3 py-1 bg-[#0a0a14]/90 backdrop-blur-md rounded-full flex items-center gap-2 border border-cyan-400/30 shadow-md">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                <span className="text-[10px] font-mono font-bold text-cyan-300 tracking-widest">
                  ORBIT: {Math.round(48 * speedMultiplier)} RPM
                </span>
              </div>
            </div>
          </div>

          {/* Active Track Controls & Playback Bar */}
          <div className="w-full flex flex-col gap-3 z-10 bg-[#0a0a14]/90 backdrop-blur-md p-4 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between">
              <div className="min-w-0 pr-3">
                <h3 className="text-sm font-bold text-white truncate font-display">
                  {currentSong?.title || "Select a Track"}
                </h3>
                <p className="text-[11px] text-slate-400 truncate font-mono">
                  {currentSong?.artist || "Flow 8D Spatial Master"}
                </p>
              </div>

              {/* Speed Pills */}
              <div className="flex items-center gap-1 shrink-0">
                {[0.5, 1, 1.5, 2].map((sp) => (
                  <button
                    key={sp}
                    onClick={() => {
                      setSpeedMultiplier(sp);
                      setOrbitSpeed(sp);
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                      speedMultiplier === sp
                        ? "bg-cyan-500 text-obsidian-950 font-bold"
                        : "bg-[#131322] text-slate-400 hover:text-white"
                    }`}
                  >
                    {sp}x
                  </button>
                ))}
              </div>
            </div>

            {/* Spatial Depth & Azimuth Readout */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-300">Spatial Depth ({spatialDepth}%)</span>
                <span className="text-cyan-400 font-bold">Azimuth: {azimuth}° Orbiting</span>
              </div>
              <div className="h-2 w-full bg-[#131322] rounded-full relative cursor-pointer overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full"
                  style={{ width: `${spatialDepth}%` }}
                ></div>
              </div>
            </div>

            {/* Transport Bar */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] font-mono text-slate-400">{formatTime(currentTime)}</span>
              <div className="flex items-center gap-4">
                <button
                  onClick={playPrev}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">skip_previous</span>
                </button>
                <button
                  onClick={togglePlay}
                  className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 flex items-center justify-center text-obsidian-950 font-bold shadow-glow-cyan hover:scale-105 active:scale-95 transition-transform"
                >
                  <span className="material-symbols-outlined text-xl">
                    {isPlaying ? "pause" : "play_arrow"}
                  </span>
                </button>
                <button
                  onClick={playNext}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">skip_next</span>
                </button>
              </div>
              <span className="text-[10px] font-mono text-slate-400">{formatTime(duration)}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Up Next in 360 Queue & DSP Parameter Matrix */}
        <div className="lg:col-span-3 flex flex-col gap-5">
          {/* Up Next in 360° Queue */}
          <div className="glass-card rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                UP NEXT IN 360° QUEUE
              </span>
              <span className="text-[10px] font-mono text-cyan-400 font-bold">
                {recommendations?.length || 3} STEMS
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              {(recommendations && recommendations.length > 0
                ? recommendations.slice(0, 3).map((r) => r.song)
                : [
                    {
                      title: "Kanna Veesi (8D Stems)",
                      artist: "Sid Sriram • Binaural Edit",
                      imageUrl:
                        "https://lh3.googleusercontent.com/aida-public/AB6AXuD_Ydg0dI3BvVA7CKGBL0rLBwHOOoPXzcZAUyvUiDpRwkHam06ntfBAEfBm3euZtkyW48E0yv-Ho2zKixEFSbEsTS79x6S9lEMdIhjs9Faw-AWmqtrWKs2lcoOrQqXRr5xF8eZ3eVdBld9RWB_2sTf0E6GZEW6r8lvsjLDM4vC-dswFz8ivB5r91W-nbI6BTaoZUSNuE6MzUw9l2WUjKlR22gdPTnm4wGhOwNXUoYEwwGdjViz0MeBtIA",
                    },
                    {
                      title: "Spark (Hyper-Spatial)",
                      artist: "Yuvan Shankar Raja",
                      imageUrl:
                        "https://lh3.googleusercontent.com/aida-public/AB6AXuAKdHhFn8hlptLhUboiEwEpvZ872ZJNj66LlvBYVmKFIXbVoC_u1iaxhEY66UqKfVEKqDefZTAj_tVB_K0BWt71mZfhE-eUmb-y0jFlWVMvmAPJkJnUYLfTrBChMBx0HWpjy4LXtiEL4TFoFRXzRsOihKnK2z7hKHPt3fAMvXp6TIl31nC_bB7PaxjESkeDSA1XaWjy1n9fTDN2s7zcWb910kpNAxE_as4iNgCncwdn0sJDoZtKAWolQQ",
                    },
                    {
                      title: "Bae (Acoustic 360°)",
                      artist: "Anirudh Ravichander",
                      imageUrl:
                        "https://lh3.googleusercontent.com/aida-public/AB6AXuBM2o3fhCCTwuTg2ADsAbesTyLSnUo6QHugtbOcqHzl2ws3sbyLv_IXJX_U6sT_4ND3wkoqz6lC95mTsa8RhFTIBICekEAHyW_Ur57cLIc189JcX8PEoLp5FTAXBKGwc36GhBpWlw9vLUHCIep9wQMRYZA1yus0Suu7A4LwCYNVLLAqTWYNmBWD5pvUsWkqb-8-mM9wFbcuRy--hqb3EGA1q9P5jU4A4L9ekJTW0gsj9tO82jJqszUgwg",
                    },
                  ]
              ).map((song, idx) => (
                <div
                  key={idx}
                  onClick={() => song._id && playSong(song, null, true)}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-[#0a0a14] hover:bg-[#1b1b30] border border-white/5 transition-all group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#131322] shrink-0 border border-white/10">
                    <img
                      className="w-full h-full object-cover"
                      src={song.imageUrl || DEFAULT_COVER}
                      alt={song.title}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                      {song.title}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 truncate">
                      {song.artist}
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-cyan-400 text-sm">
                    play_arrow
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* DSP Parameter Matrix */}
          <div className="glass-card rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                DSP PARAMETER MATRIX
              </span>
              <span className="material-symbols-outlined text-slate-400 text-base">tune</span>
            </div>

            {/* HRTF Elevation */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-slate-300">HRTF PINNA ELEVATION</span>
                <span className="text-cyan-400 font-bold">+{pinnaElevation}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="0.5"
                value={pinnaElevation}
                onChange={(e) => setPinnaElevation(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-[#131322] rounded-full appearance-none cursor-pointer"
              />
            </div>

            {/* Doppler Intensity */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-slate-300">DOPPLER INTENSITY</span>
                <span className="text-purple-400 font-bold">{dopplerIntensity}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={dopplerIntensity}
                onChange={(e) => setDopplerIntensity(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-[#131322] rounded-full appearance-none cursor-pointer"
              />
            </div>

            {/* Binaural Crossfeed */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-slate-300">BINAURAL CROSSFEED</span>
                <span className="text-cyan-400 font-bold">{crossfeed}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={crossfeed}
                onChange={(e) => setCrossfeed(parseInt(e.target.value))}
                className="w-full h-1.5 bg-[#131322] rounded-full appearance-none cursor-pointer"
              />
            </div>

            {/* Head Shadow Attenuation */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-slate-300">HEAD SHADOW ATTENUATION</span>
                <span className="text-pink-400 font-bold">-{headShadow} dB</span>
              </div>
              <input
                type="range"
                min="0"
                max="12"
                step="0.2"
                value={headShadow}
                onChange={(e) => setHeadShadow(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-[#131322] rounded-full appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
