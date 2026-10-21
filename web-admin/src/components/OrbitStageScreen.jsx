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
  } = usePlayer();

  const [activeProfile, setActiveProfile] = useState("cosmic");
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [azimuth, setAzimuth] = useState(142);
  const [pinnaElevation, setPinnaElevation] = useState(12.4);
  const [dopplerIntensity, setDopplerIntensity] = useState(1.84);
  const [crossfeed, setCrossfeed] = useState(34);
  const [headShadow, setHeadShadow] = useState(4.2);

  // Live azimuth rotation simulation
  useEffect(() => {
    if (!isPlaying || !is8DActive) return;
    const interval = setInterval(() => {
      setAzimuth((prev) => (prev + 2 * speedMultiplier) % 360);
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying, is8DActive, speedMultiplier]);

  const acousticProfiles = [
    {
      id: "cosmic",
      name: "Cosmic Orbit (Infinite)",
      sub: "360° Rotational Decay",
      icon: "radar",
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
      icon: "mic",
    },
    {
      id: "drift",
      name: "Binaural Drift Stage",
      sub: "Asymmetric Pitch Mod",
      icon: "waves",
    },
  ];

  const queueStems = [
    {
      id: "stem-1",
      title: "Lo Vas a Olvidar",
      artist: "Billie Eilish, ROSALÍA",
      cover: "https://lh3.googleusercontent.com/aida-public/AB6AXuAzVUVREvvNyGV2-opN20BwhflJ5ANjjbO92PSmoZgt75waFzwf7ycoFTh1E203ZhwoMnRqWSHxqlcm9djUvNiut9Jm2mut4Kpg-dmyJucQddQ5EvHKmuNSKEwx0DncaAlonlYJNv1qJEoRrlsFyArp6OHgUQhZkQoOEGOcrhV3xybk5LYHYmGjY8-Q-DPlBhYHvRkedUovvQb9cyOt4QhTXd96SszkHyYUOb0LO0Ul14qx3UQs6EjXuw",
      audioUrl: "https://aac.saavncdn.com/001/cf795c655325785055b410f9e9cfda3a_160.mp4",
      audioMode: "8d",
    },
    {
      id: "stem-2",
      title: "No Time to Die",
      artist: "Billie Eilish",
      cover: "https://lh3.googleusercontent.com/aida-public/AB6AXuBuv8wtd72D6DboUEZHmbMCEnWaKu0OuruEOVevAe9XIlVLPBONTBGrWYp2ssFgOvSvbhetyPpwdLHNWO7FG9J7UiTPbeQ3ibrtZ3ZzyRCtWWXNElySaiYhlUUJoYEKGD55prp3ULFH15tXadqXDx-BAPvGEYpKggOEgeQVbN-CuMy0Nc8H2NMAhRk45UuVV1zhjmiYRK8igHajzqf90PIQqfPeQ4fYxxkGF041D-mJBtH41u43FSK9rg",
      audioUrl: "https://aac.saavncdn.com/267/35e80dc0e599d4db2f8d8b9d6a36f94b_160.mp4",
      audioMode: "8d",
    },
    {
      id: "stem-3",
      title: "Six Feet Under",
      artist: "Billie Eilish",
      cover: "https://lh3.googleusercontent.com/aida-public/AB6AXuBeYewvEhqIzh1P71lcNB7FPQMK0Qn8WZiYThaNZVEeZqUO6vX_gcM-wt5ZANcSP6NGsE1hA4A3oFxeJG332Q3790UVGZsfSrTazrRhMocLSM1hlvUY1whUXH5MmVnJF1vmFjUm3C3Y7f979ICi3L5MiNNlY8mWNvdxl_R0HblWIFPpOdiD_dQBx7AM1AdTIL_tOtM8krf6Wo9rBD5I1S6j_W0YD2_g583c65SNT2QHlxUag2uEpN2E1A",
      audioUrl: "https://aac.saavncdn.com/932/7cf7f8a9d9c3faa2633d1605e97ba4a5_160.mp4",
      audioMode: "8d",
    },
  ];

  const DEFAULT_COVER =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBbq2IY87kcKrKdlHbV0zxaJvwz7oO0gCp3WFNJOo8QhtFwzR-SGkl1LUUEwY29LAH_YF_gjmlFgRndcKRZtButEQGjTHjjuN5YnP8tZfPbkwJY5l_XTwiAZ1DXkSIFVzuTkjISCxoiJhvrouKKxzPnu8QuqnXGyYK471pcR3E9Q5hNHRffLGflEBgy-mftGwjbrMC_2kjybmWjo7UZdCjRfWuS09sB8X2lwEFhylpczzcR8irsuYiHDg";

  return (
    <div className="w-full flex flex-col min-h-screen text-on-surface font-sans p-4 sm:p-6 lg:p-7 space-y-6 pb-28 max-w-[1500px] mx-auto box-border select-none">
      {/* Top Studio Stage Sub-Header & Telemetry Strip */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-container/20 text-primary-container font-label-caps text-[11px] font-bold tracking-widest shadow-[0_0_12px_rgba(0,245,155,0.25)] border border-primary-container/30">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-ping" />
            STAGE 01
          </div>
          <h1 className="font-headline-lg text-2xl sm:text-3xl text-on-surface tracking-tight flex items-center gap-2">
            360° Binaural Orbit
            <button
              onClick={() => setAzimuth(0)}
              aria-label="Recalibrate Vector"
              className="text-outline hover:text-primary-container transition-colors cursor-pointer"
              title="Recalibrate spatial coordinates"
            >
              <span className="material-symbols-outlined text-xl">sync</span>
            </button>
          </h1>
          <div className="hidden xl:flex items-center gap-2 pl-2 text-outline font-label-caps text-[11px] tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            <span>HRTF BINAURAL MATRIX • 96kHz 32-bit FLOAT</span>
          </div>
        </div>

        {/* Right Controls / 8D DSP Status / Milo */}
        <div className="flex flex-wrap items-center gap-3">
          {/* 8D DSP Active Pill */}
          <div
            onClick={() => setIs8DActive(!is8DActive)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-high border border-white/5 shadow-sm cursor-pointer hover:bg-surface-bright transition-all"
          >
            <span className="font-label-caps text-[10px] font-bold tracking-wider text-secondary">
              {is8DActive ? "8D DSP ACTIVE" : "8D DSP BYPASSED"}
            </span>
            <div
              className={`w-7 h-4 rounded-full p-0.5 flex items-center transition-colors ${
                is8DActive ? "bg-primary-container justify-end shadow-[0_0_10px_rgba(0,245,155,0.4)]" : "bg-surface-container-highest justify-start"
              }`}
            >
              <div className="w-3 h-3 rounded-full bg-surface-container-lowest" />
            </div>
          </div>

          {/* MILO AI Action Pill */}
          <button
            onClick={() => setShowMiloChat(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-surface-container-high hover:bg-surface-bright text-tertiary-fixed-dim transition-all shadow-sm border border-white/5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">psychology</span>
            <span className="font-label-caps text-[10px] font-bold tracking-wider">MILO AI</span>
          </button>

          <div className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-low text-outline font-label-caps text-[10px] uppercase tracking-wider border border-white/5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-fixed-dim" />
            STUDIO ENGINEER
          </div>
        </div>
      </div>

      {/* Main 3-Column Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full">
        {/* Left Column: Spatial Telemetry & Acoustic Profiles (Col span: 3) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {/* Spatial Vector Field Card */}
          <div className="p-4 rounded-xl bg-surface-container-low flex flex-col gap-2.5 shadow-md border border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary-container text-base">explore</span>
                <span className="font-label-caps text-[11px] text-on-surface uppercase tracking-wider font-bold">
                  Spatial Vector Field
                </span>
              </div>
              <span className="material-symbols-outlined text-outline text-sm">sensors</span>
            </div>

            {/* 3-Axis Readout Grid */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
              <div className="p-2 rounded-lg bg-surface-container-high flex flex-col items-center">
                <span className="font-label-caps text-[9px] text-outline uppercase tracking-wider">Axis X</span>
                <span className="font-headline-sm text-sm text-secondary font-bold tracking-tight">
                  {isPlaying ? (Math.sin((azimuth * Math.PI) / 180) * 0.85).toFixed(2) : "-0.63"}
                </span>
                <span className="font-label-caps text-[8px] text-outline uppercase">Lateral</span>
              </div>
              <div className="p-2 rounded-lg bg-surface-container-high flex flex-col items-center">
                <span className="font-label-caps text-[9px] text-outline uppercase tracking-wider">Axis Y</span>
                <span className="font-headline-sm text-sm text-tertiary-fixed-dim font-bold tracking-tight">
                  {(pinnaElevation / 50).toFixed(2)}
                </span>
                <span className="font-label-caps text-[8px] text-outline uppercase">Elevation</span>
              </div>
              <div className="p-2 rounded-lg bg-surface-container-high flex flex-col items-center">
                <span className="font-label-caps text-[9px] text-outline uppercase tracking-wider">Axis Z</span>
                <span className="font-headline-sm text-sm text-primary-container font-bold tracking-tight">
                  {isPlaying ? (Math.cos((azimuth * Math.PI) / 180) * 0.9).toFixed(2) : "+0.88"}
                </span>
                <span className="font-label-caps text-[8px] text-outline uppercase">Depth</span>
              </div>
            </div>

            {/* Ear Phase Balance Bar */}
            <div className="flex flex-col gap-1.5 pt-2">
              <div className="flex items-center justify-between font-label-caps text-[10px] text-outline">
                <span>EAR PHASE BALANCE</span>
                <span className="text-on-surface font-semibold font-mono">
                  <span className="text-tertiary-fixed-dim">L {crossfeed}%</span> /{" "}
                  <span className="text-secondary">R {100 - crossfeed}%</span>
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-surface-container-highest overflow-hidden flex">
                <div className="h-full bg-tertiary-fixed-dim rounded-l-full" style={{ width: `${crossfeed}%` }} />
                <div className="h-full bg-secondary rounded-r-full" style={{ width: `${100 - crossfeed}%` }} />
              </div>
            </div>
          </div>

          {/* Realtime Spectrum Intensity Card */}
          <div className="p-4 rounded-xl bg-surface-container-low flex flex-col gap-2.5 shadow-md border border-white/5">
            <div className="flex items-center justify-between">
              <span className="font-label-caps text-[11px] text-on-surface uppercase tracking-wider font-bold">
                Realtime Spectrum Intensity
              </span>
              <span className="font-label-caps text-[9px] text-primary-container font-mono">64 BANDS</span>
            </div>

            {/* 15-Bar Audio Spectrum Graphic */}
            <div className="h-16 w-full flex items-end justify-between gap-1 pt-2 px-1">
              {[38, 65, 88, 94, 72, 54, 68, 82, 60, 76, 48, 32, 52, 25, 18].map((h, i) => (
                <div
                  key={i}
                  className={`w-full rounded-t-sm transition-all duration-150 ${
                    i % 3 === 0
                      ? "bg-primary-container shadow-[0_0_6px_rgba(0,245,155,0.4)]"
                      : i % 2 === 0
                      ? "bg-secondary"
                      : "bg-tertiary-fixed-dim"
                  }`}
                  style={{
                    height: isPlaying ? `${Math.min(100, Math.max(15, h + (Math.sin(azimuth + i) * 20)))}%` : `${h * 0.4}%`,
                  }}
                />
              ))}
            </div>
            <div className="flex justify-between font-label-caps text-[9px] text-outline pt-1 font-mono">
              <span>20Hz</span>
              <span>1kHz</span>
              <span>8kHz</span>
              <span>24kHz</span>
            </div>
          </div>

          {/* Acoustic Room Profiles */}
          <div className="p-4 rounded-xl bg-surface-container-low flex flex-col gap-2 shadow-md border border-white/5 flex-1">
            <div className="flex items-center justify-between pb-1">
              <span className="font-label-caps text-[11px] text-on-surface uppercase tracking-wider font-bold">
                Acoustic Room Profiles
              </span>
              <span className="material-symbols-outlined text-outline text-sm">tune</span>
            </div>

            <div className="flex flex-col gap-1.5">
              {acousticProfiles.map((prof) => {
                const isActive = activeProfile === prof.id;
                return (
                  <div
                    key={prof.id}
                    onClick={() => setActiveProfile(prof.id)}
                    className={`p-2 rounded-lg flex items-center justify-between cursor-pointer transition-all border ${
                      isActive
                        ? "bg-surface-container-high border-primary-container/30 shadow-inner"
                        : "bg-surface-container hover:bg-surface-container-high border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isActive
                            ? "bg-primary-container/20 text-primary-container shadow-[0_0_8px_rgba(0,245,155,0.3)]"
                            : "bg-surface-container-highest text-outline"
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm">{prof.icon}</span>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className={`font-label-md text-xs truncate ${isActive ? "text-primary-container font-semibold" : "text-on-surface"}`}>
                          {prof.name}
                        </span>
                        <span className="font-body-sm text-[10px] text-outline truncate">{prof.sub}</span>
                      </div>
                    </div>
                    {isActive ? (
                      <span className="w-2 h-2 rounded-full bg-primary-container shadow-[0_0_6px_rgba(0,245,155,0.8)]" />
                    ) : (
                      <span className="material-symbols-outlined text-outline text-sm">chevron_right</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center Column: Interactive 360° Soundstage Orbit Canvas (Col span: 6) */}
        <div className="lg:col-span-6 flex flex-col gap-3">
          <div className="relative w-full rounded-2xl bg-surface-container-lowest p-5 flex flex-col justify-between overflow-hidden shadow-2xl min-h-[520px] border border-white/5">
            {/* Ambient Orbit Glow Backdrop */}
            <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-secondary/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-primary-container/10 blur-3xl pointer-events-none" />

            {/* Canvas Top Overlay Controls */}
            <div className="relative z-10 flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high text-primary-container shadow-sm border border-white/5">
                  <span className="material-symbols-outlined text-sm">headphones</span>
                  <span className="font-label-caps text-[9px] font-bold tracking-wider uppercase">
                    Binaural Head Tracking ON
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => currentSong && toggleFavorite(currentSong._id || currentSong.id)}
                  className="w-8 h-8 rounded-full bg-surface-container-high hover:bg-surface-container text-primary-container flex items-center justify-center transition-colors border border-white/5"
                >
                  <span className="material-symbols-outlined text-base">favorite</span>
                </button>
              </div>
            </div>

            {/* 360° Circular Orbit Visualization Field */}
            <div className="relative z-10 my-auto flex items-center justify-center py-6">
              <div className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-92 md:h-92 flex items-center justify-center">
                {/* Concentric Orbital Grid Rings */}
                <div className="absolute inset-0 rounded-full bg-surface-container-low/40 flex items-center justify-center border border-white/5">
                  <div
                    className="w-full h-full rounded-full opacity-30 shadow-[inset_0_0_20px_rgba(0,245,155,0.15)]"
                    style={{ background: "radial-gradient(circle, transparent 65%, rgba(0,245,155,0.08) 100%)" }}
                  />
                </div>
                <div className="absolute w-[82%] h-[82%] rounded-full bg-surface-container-high/30 opacity-40 border border-white/5" />
                <div className="absolute w-[60%] h-[60%] rounded-full bg-surface-container-highest/30 opacity-50 border border-white/5" />

                {/* SVG Orbit Ellipse Vectors */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 400">
                  <ellipse
                    className="text-primary-container opacity-40"
                    cx="200"
                    cy="200"
                    fill="none"
                    rx="170"
                    ry="85"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    transform="rotate(-25 200 200)"
                  />
                  <ellipse
                    className="text-tertiary-fixed-dim opacity-35"
                    cx="200"
                    cy="200"
                    fill="none"
                    rx="160"
                    ry="75"
                    stroke="currentColor"
                    strokeDasharray="4 6"
                    strokeWidth="1.2"
                    transform="rotate(35 200 200)"
                  />
                  <line className="text-outline opacity-20" stroke="currentColor" strokeDasharray="3 4" strokeWidth="1" x1="200" x2="200" y1="20" y2="380" />
                  <line className="text-outline opacity-20" stroke="currentColor" strokeDasharray="3 4" strokeWidth="1" x1="20" x2="380" y1="200" y2="200" />
                </svg>

                {/* Orbiting Primary Sound Node */}
                <div
                  className="absolute z-20 flex flex-col items-center transition-all duration-100"
                  style={{
                    transform: `translate(${Math.cos((azimuth * Math.PI) / 180) * 130}px, ${Math.sin((azimuth * Math.PI) / 180) * 85}px)`,
                  }}
                >
                  <div className="relative flex items-center justify-center">
                    <span className="w-5 h-5 rounded-full bg-primary-container animate-ping absolute opacity-75" />
                    <span className="w-4 h-4 rounded-full bg-primary-fixed shadow-[0_0_16px_rgba(0,245,155,0.9)]" />
                  </div>
                  <span className="mt-1 px-1.5 py-0.2 rounded bg-surface-container-lowest text-primary-container font-label-caps text-[8px] font-bold shadow-md">
                    STEM 01
                  </span>
                </div>

                {/* Orbiting Secondary Stem Node */}
                <div
                  className="absolute z-20 flex flex-col items-center transition-all duration-100"
                  style={{
                    transform: `translate(${Math.cos(((azimuth + 180) * Math.PI) / 180) * 110}px, ${Math.sin(((azimuth + 180) * Math.PI) / 180) * 75}px)`,
                  }}
                >
                  <div className="relative flex items-center justify-center">
                    <span className="w-3.5 h-3.5 rounded-full bg-secondary shadow-[0_0_12px_rgba(110,251,190,0.8)]" />
                  </div>
                  <span className="mt-1 px-1.5 py-0.2 rounded bg-surface-container-lowest text-secondary font-label-caps text-[8px]">
                    STEM 02
                  </span>
                </div>

                {/* Center Stage Core Hologram & Album Card */}
                <div className="relative z-10 w-36 h-36 sm:w-44 sm:h-44 rounded-2xl bg-surface-container-high/90 backdrop-blur-md p-2 flex flex-col items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.8)] group hover:scale-[1.02] transition-transform border border-white/10">
                  <div className="relative w-full h-full rounded-xl overflow-hidden flex flex-col items-center justify-center bg-surface-container-lowest">
                    <img
                      className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:opacity-95 transition-opacity"
                      src={currentSong?.imageUrl || currentSong?.cover || DEFAULT_COVER}
                      alt={currentSong?.title || "Aurora Binaural"}
                    />
                    <div className="relative z-10 flex flex-col items-center text-center p-2 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/60 to-transparent w-full mt-auto">
                      <span className="font-label-caps text-[8px] text-primary-container tracking-widest uppercase font-bold">
                        FLOW 8D SPATIAL
                      </span>
                      <span className="font-label-md text-xs text-on-surface font-bold truncate w-full">
                        {currentSong?.title || "AURORA BINAURAL"}
                      </span>
                      <span className="font-body-sm text-[10px] text-outline">
                        {currentSong?.artist || "MAYA J."}
                      </span>
                    </div>
                  </div>
                  <div className="absolute -bottom-3 px-3 py-0.5 rounded-full bg-surface-container-lowest text-primary-container font-label-caps text-[9px] font-bold shadow-lg flex items-center gap-1 border border-primary-container/30">
                    <span className="material-symbols-outlined text-xs animate-spin">refresh</span>
                    <span>ORBIT: {Math.round(48 * speedMultiplier)} RPM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Soundstage Bottom Dynamic Vector Bar */}
            <div className="relative z-10 p-3 rounded-xl bg-surface-container-high/80 backdrop-blur-md flex flex-col gap-2 shadow-inner border border-white/5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-col min-w-0">
                  <span className="font-label-md text-xs text-on-surface font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-secondary" />
                    Track: {currentSong?.title || "Flow 8D Spatial Master"}
                  </span>
                  <span className="font-body-sm text-[10px] text-outline">
                    Stereo To Binaural Convolution Engine • 3D Field Map Active
                  </span>
                </div>

                {/* Orbit Speed Pills */}
                <div className="flex items-center gap-1 bg-surface-container-lowest p-1 rounded-full border border-white/5">
                  {[0.5, 1, 1.5, 2].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setSpeedMultiplier(spd)}
                      className={`px-2.5 py-0.5 rounded-full font-label-caps text-[10px] cursor-pointer transition-all ${
                        speedMultiplier === spd
                          ? "bg-primary-container text-on-primary-container font-bold shadow-sm"
                          : "text-outline hover:text-on-surface"
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Spatial Depth & Azimuth */}
              <div className="flex items-center gap-3 pt-1">
                <div className="flex-1 flex flex-col gap-1">
                  <div className="flex justify-between font-label-caps text-[9px] text-outline">
                    <span>SPATIAL DEPTH</span>
                    <span className="text-primary-container font-semibold">{Math.round(spatialDepth || 85)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-container-lowest rounded-full overflow-hidden">
                    <div className="h-full bg-primary-container rounded-full" style={{ width: `${spatialDepth || 85}%` }} />
                  </div>
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container-lowest text-tertiary-fixed-dim font-label-caps text-[10px] font-bold border border-white/5">
                  <span className="material-symbols-outlined text-xs">navigation</span>
                  <span>AZIMUTH: {azimuth}° ORBITING</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Up Next Queue & DSP Parameter Matrix (Col span: 3) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {/* Up Next in 360° Queue */}
          <div className="p-4 rounded-xl bg-surface-container-low flex flex-col gap-2.5 shadow-md border border-white/5">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-secondary text-base">queue_music</span>
                <span className="font-label-caps text-[11px] text-on-surface uppercase tracking-wider font-bold">
                  Up Next in 360° Queue
                </span>
              </div>
              <span className="font-label-caps text-[9px] px-1.5 py-0.5 rounded bg-surface-container text-outline font-bold">
                {queueStems.length} STEMS
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              {queueStems.map((stem) => (
                <div
                  key={stem.id}
                  onClick={() => playSong(stem, queueStems)}
                  className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high transition-all flex items-center justify-between group cursor-pointer border border-white/5"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img className="w-8 h-8 rounded-md object-cover shrink-0" src={stem.cover} alt={stem.title} />
                    <div className="flex flex-col min-w-0">
                      <span className="font-label-md text-xs text-on-surface truncate group-hover:text-primary-container transition-colors">
                        {stem.title}
                      </span>
                      <span className="font-body-sm text-[10px] text-outline truncate">{stem.artist}</span>
                    </div>
                  </div>
                  <button className="w-7 h-7 rounded-full bg-surface-container-high group-hover:bg-primary-container group-hover:text-on-primary-container text-on-surface-variant flex items-center justify-center transition-all">
                    <span className="material-symbols-outlined text-xs">play_arrow</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* DSP Parameter Matrix */}
          <div className="p-4 rounded-xl bg-surface-container-low flex flex-col gap-3 shadow-md border border-white/5 flex-1">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary-container text-base">instant_mix</span>
                <span className="font-label-caps text-[11px] text-on-surface uppercase tracking-wider font-bold">
                  DSP Parameter Matrix
                </span>
              </div>
              <span className="material-symbols-outlined text-outline text-sm">tune</span>
            </div>

            {/* Sliders */}
            <div className="flex flex-col gap-3 pt-1">
              {/* Slider 1: HRTF Pinna Elevation */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between font-label-caps text-[9px]">
                  <span className="text-outline uppercase">HRTF Pinna Elevation</span>
                  <span className="text-primary-container font-bold font-mono">+{pinnaElevation}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="0.5"
                  value={pinnaElevation}
                  onChange={(e) => setPinnaElevation(Number(e.target.value))}
                  className="w-full h-1.5 bg-surface-container-highest accent-primary-container rounded-full cursor-pointer"
                />
              </div>

              {/* Slider 2: Doppler Intensity */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between font-label-caps text-[9px]">
                  <span className="text-outline uppercase">Doppler Intensity</span>
                  <span className="text-secondary font-bold font-mono">{dopplerIntensity}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.05"
                  value={dopplerIntensity}
                  onChange={(e) => setDopplerIntensity(Number(e.target.value))}
                  className="w-full h-1.5 bg-surface-container-highest accent-secondary rounded-full cursor-pointer"
                />
              </div>

              {/* Slider 3: Binaural Crossfeed */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between font-label-caps text-[9px]">
                  <span className="text-outline uppercase">Binaural Crossfeed</span>
                  <span className="text-tertiary-fixed-dim font-bold font-mono">{crossfeed}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={crossfeed}
                  onChange={(e) => setCrossfeed(Number(e.target.value))}
                  className="w-full h-1.5 bg-surface-container-highest accent-tertiary-fixed-dim rounded-full cursor-pointer"
                />
              </div>

              {/* Slider 4: Head Shadow Attenuation */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between font-label-caps text-[9px]">
                  <span className="text-outline uppercase">Head Shadow Attenuation</span>
                  <span className="text-error font-bold font-mono">-{headShadow} dB</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.2"
                  value={headShadow}
                  onChange={(e) => setHeadShadow(Number(e.target.value))}
                  className="w-full h-1.5 bg-surface-container-highest accent-error rounded-full cursor-pointer"
                />
              </div>
            </div>

            {/* Preset Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2 mt-auto">
              <button
                onClick={() => {
                  setCrossfeed(10);
                  setPinnaElevation(0);
                  setIs8DActive(false);
                }}
                className="py-1.5 px-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface font-label-caps text-[9px] text-center font-bold transition-all border border-white/5 cursor-pointer"
              >
                FLAT STEREO
              </button>
              <button
                onClick={() => {
                  setCrossfeed(34);
                  setPinnaElevation(14);
                  setIs8DActive(true);
                }}
                className="py-1.5 px-2 rounded-lg bg-primary-container/20 text-primary-container font-label-caps text-[9px] text-center font-bold shadow-sm transition-all border border-primary-container/30 cursor-pointer"
              >
                FULL 8D SPHERIC
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Session Overview Bar */}
      <div className="w-full p-4 rounded-xl bg-surface-container-low flex flex-col md:flex-row items-center justify-between gap-4 shadow-md border border-white/5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary-container shrink-0 shadow-sm border border-white/5">
            <span className="material-symbols-outlined text-2xl">surround_sound</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-label-lg text-xs sm:text-sm text-on-surface font-bold truncate">
              Acoustic Sphere Session: {currentSong?.title || "Billie Eilish - Ocean Eyes (8D Remaster)"}
            </span>
            <span className="font-body-sm text-[11px] text-outline truncate">
              Spatial engine synchronizing 8 binaural channels at 24-bit/96kHz ultra-low latency playback
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => onNavigate("library")}
            className="px-4 py-1.5 rounded-full bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-md text-xs transition-colors flex items-center gap-1.5 cursor-pointer border border-white/5"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            Export Spatial Stem
          </button>
          <button
            onClick={togglePlay}
            className="px-5 py-1.5 rounded-full bg-primary-container hover:bg-primary-fixed text-on-primary-container font-label-md text-xs font-bold shadow-[0_0_16px_rgba(0,245,155,0.35)] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">graphic_eq</span>
            {isPlaying ? "Pause Stage Monitor" : "Live Stage Monitor"}
          </button>
        </div>
      </div>
    </div>
  );
}
