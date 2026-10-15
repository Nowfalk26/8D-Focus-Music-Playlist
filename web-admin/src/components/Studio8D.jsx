import React, { useState, useEffect } from "react";
import { usePlayer } from "../context/PlayerContext";

export default function Studio8D({ onNavigate }) {
  const {
    currentSong,
    isPlaying,
    orbitSpeed,
    spatialDepth,
    reverbRoom,
    is8DActive,
    setOrbitSpeed,
    setSpatialDepth,
    setReverbRoom,
    setIs8DActive,
    togglePlay,
    setShowFullPlayer,
  } = usePlayer();

  const [activePreset, setActivePreset] = useState("chill");
  const [bassBoost, setBassBoost] = useState(65);
  const [crossfeed, setCrossfeed] = useState(42);
  const [azimuth, setAzimuth] = useState(142);

  // Live azimuth angle update
  useEffect(() => {
    if (!isPlaying || !is8DActive) return;
    const interval = setInterval(() => {
      setAzimuth((prev) => (prev + Math.round(orbitSpeed * 2)) % 360);
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying, is8DActive, orbitSpeed]);

  const presets = [
    {
      id: "chill",
      name: "Chill Orbit",
      desc: "Slow relaxation pan, soothing acoustics",
      speed: 0.6,
      rpm: 36,
      depth: 75,
      reverb: 60,
      bass: 50,
      icon: "spa",
    },
    {
      id: "trance",
      name: "Deep Trance",
      desc: "Alpha wave synchronization for deep focus",
      speed: 1.0,
      rpm: 48,
      depth: 85,
      reverb: 45,
      bass: 65,
      icon: "cyclone",
    },
    {
      id: "hyperspace",
      name: "Hyperspace",
      desc: "High velocity multi-dimensional revolution",
      speed: 1.8,
      rpm: 72,
      depth: 100,
      reverb: 30,
      bass: 85,
      icon: "rocket_launch",
    },
    {
      id: "bloom",
      name: "Holographic Bloom",
      desc: "Lush harmonic ambient reverb expansion",
      speed: 0.8,
      rpm: 42,
      depth: 65,
      reverb: 80,
      bass: 45,
      icon: "filter_vintage",
    },
  ];

  const handleApplyPreset = (p) => {
    setActivePreset(p.id);
    setOrbitSpeed(p.speed);
    setSpatialDepth(p.depth);
    setReverbRoom(p.reverb);
    setBassBoost(p.bass);
  };

  return (
    <div className="w-full flex flex-col font-sans text-neutral-200 select-none p-4 sm:p-8 space-y-6 pb-28">
      {/* Top Header & Telemetry */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#1DB954]">
              Spatial Engine Lab
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#1DB954] animate-pulse" />
            <span className="text-xs font-mono text-neutral-400">v4.2 Binaural HRTF DSP</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            AI 8D Studio &amp; Customizer
          </h1>
        </div>

        {/* 8D DSP Toggle Pill */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIs8DActive(!is8DActive)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono font-bold transition-all shadow-sm active:scale-95 ${
              is8DActive
                ? "bg-[#1DB954]/20 border border-[#1DB954]/50 text-[#1DB954] shadow-md shadow-[#1DB954]/20"
                : "bg-white/10 border border-white/10 text-neutral-400"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${is8DActive ? "bg-[#1DB954] animate-ping" : "bg-neutral-500"}`} />
            <span>{is8DActive ? "8D DSP Active" : "8D DSP Bypassed"}</span>
          </button>
        </div>
      </div>

      {/* Main Soundstage Radar Canvas */}
      <div className="relative w-full rounded-3xl bg-[#181818] border border-white/5 p-6 sm:p-8 overflow-hidden shadow-2xl flex flex-col items-center justify-between min-h-[380px]">
        {/* Ambient Radial Aurora Glow */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#1DB954]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 left-1/3 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* HUD Telemetry Overlay */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between text-neutral-400 font-mono text-xs z-10 pointer-events-none gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-white">
              <span className="material-symbols-outlined text-sm text-[#1DB954]">sensors</span>
              Bilateral HRTF: 360° Sphere
            </span>
            <span className="text-neutral-600">•</span>
            <span>Latency: 1.2ms</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Azimuth: {azimuth}°</span>
            <span className="text-neutral-600">•</span>
            <span className="text-[#1DB954] font-semibold">Phase Sync: 99.4%</span>
          </div>
        </div>

        {/* Interactive Binaural Orbital Soundstage */}
        <div className="relative w-56 h-56 sm:w-64 sm:h-64 my-6 flex items-center justify-center">
          {/* Outer Orbit Ring */}
          <div className="absolute inset-0 rounded-full border border-white/10 bg-black/30" />
          {/* Middle Ring */}
          <div className="absolute inset-6 rounded-full border border-[#1DB954]/20 bg-[#242424]/20" />
          {/* Inner Ring */}
          <div className="absolute inset-12 rounded-full border border-white/10 bg-[#242424]/30" />

          {/* Center Listener Avatar */}
          <div className="relative z-20 w-16 h-16 rounded-full bg-[#242424] border border-[#1DB954]/40 flex flex-col items-center justify-center text-[#1DB954] shadow-lg">
            <span className="material-symbols-outlined text-2xl">headphones</span>
            <span className="text-[8px] font-mono tracking-wider -mt-0.5 text-neutral-300 font-bold">
              LISTENER
            </span>
          </div>

          {/* Animated Orbiting Node Carrier */}
          <div
            className="absolute inset-0 transition-transform duration-100"
            style={{ transform: `rotate(${azimuth}deg)` }}
          >
            {/* Spatial Audio Emitter Node */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex flex-col items-center group cursor-pointer">
              <div className="relative w-5 h-5 rounded-full bg-[#1DB954] shadow-lg shadow-[#1DB954]/50 flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-black" />
                <span className="absolute -inset-1 rounded-full bg-[#1DB954]/40 animate-ping" />
              </div>
              <span className="text-[9px] font-mono text-[#1DB954] px-1.5 py-0.5 mt-1 rounded bg-black/80 border border-[#1DB954]/40 font-bold">
                L·R
              </span>
            </div>
          </div>

          {/* Secondary Harmonic Orbit Node */}
          <div
            className="absolute inset-8 transition-transform duration-100"
            style={{ transform: `rotate(${-azimuth * 0.7}deg)` }}
          >
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 flex items-center justify-center">
              <div className="w-3.5 h-3.5 rounded-full bg-purple-400 shadow-md shadow-purple-400/50" />
            </div>
          </div>

          {/* RPM Floating Badge */}
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#242424] border border-white/10 shadow-md flex items-center gap-1.5 z-20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1DB954] animate-pulse" />
            <span className="font-mono text-xs font-bold text-white">
              {Math.round(48 * orbitSpeed)} RPM
            </span>
          </div>
        </div>

        {/* Active Track Status & Action Controls */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/5 z-10">
          <div className="flex items-center gap-2.5 text-center sm:text-left">
            <span className="material-symbols-outlined text-[#1DB954] text-xl">graphic_eq</span>
            <p className="text-xs text-neutral-400">
              Active Track:{" "}
              <span className="text-sm text-white font-bold">
                {currentSong?.title || "Flow 8D Spatial Track"}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={togglePlay}
              className="px-4 py-2 rounded-full bg-[#242424] hover:bg-[#2e2e2e] border border-white/10 text-white text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-base text-[#1DB954]">
                {isPlaying ? "pause" : "play_arrow"}
              </span>
              <span>{isPlaying ? "Pause" : "Play"}</span>
            </button>
            <button
              onClick={() => onNavigate("orbit")}
              className="px-4 py-2 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-black text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-base font-bold">spatial_audio_off</span>
              <span>360° Stage</span>
            </button>
          </div>
        </div>
      </div>

      {/* 8D Spatial Presets Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#1DB954] text-lg">auto_awesome</span>
            <h2 className="text-base font-bold text-white">8D Spatial Presets</h2>
            <span className="text-xs text-neutral-400 font-mono hidden sm:inline">• 1-click acoustic tuning</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {presets.map((p) => {
            const isSelected = activePreset === p.id;
            return (
              <div
                key={p.id}
                onClick={() => handleApplyPreset(p)}
                className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                  isSelected
                    ? "bg-[#242424] border-[#1DB954] shadow-md shadow-[#1DB954]/20"
                    : "bg-[#181818] hover:bg-[#202020] border-white/5"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`material-symbols-outlined text-xl ${
                      isSelected ? "text-[#1DB954]" : "text-neutral-400"
                    }`}
                  >
                    {p.icon}
                  </span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-[#1DB954] shadow-sm shadow-[#1DB954]" />
                  )}
                </div>
                <h3 className="text-sm font-bold text-white">{p.name}</h3>
                <p className="text-xs text-neutral-400 mt-0.5 mb-3 leading-relaxed">{p.desc}</p>
                <div className="flex items-center justify-between text-[11px] font-mono pt-2 border-t border-white/5">
                  <span className="text-[#1DB954] font-bold">{p.speed}x</span>
                  <span className="text-neutral-400">{p.rpm} RPM</span>
                  <span className="text-neutral-300">{p.depth}% Depth</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DSP Controls Slider Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sliders Block 1 */}
        <div className="bg-[#181818] border border-white/5 rounded-2xl p-6 shadow-md space-y-5">
          <h3 className="text-sm font-bold text-white border-b border-white/5 pb-2">
            Orbit Dynamics &amp; Spatial Velocity
          </h3>

          <div>
            <div className="flex justify-between text-xs text-neutral-300 mb-1.5 font-medium">
              <span>Orbit Angular Velocity</span>
              <span className="font-mono text-[#1DB954] font-bold">{orbitSpeed.toFixed(2)}x ({Math.round(48 * orbitSpeed)} RPM)</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="2.5"
              step="0.05"
              value={orbitSpeed}
              onChange={(e) => setOrbitSpeed(parseFloat(e.target.value))}
              className="w-full accent-[#1DB954] h-1.5 bg-neutral-700 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-neutral-300 mb-1.5 font-medium">
              <span>Binaural Soundstage Depth</span>
              <span className="font-mono text-[#1DB954] font-bold">{spatialDepth}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              value={spatialDepth}
              onChange={(e) => setSpatialDepth(parseInt(e.target.value))}
              className="w-full accent-[#1DB954] h-1.5 bg-neutral-700 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Sliders Block 2 */}
        <div className="bg-[#181818] border border-white/5 rounded-2xl p-6 shadow-md space-y-5">
          <h3 className="text-sm font-bold text-white border-b border-white/5 pb-2">
            Acoustics &amp; Harmonic EQ
          </h3>

          <div>
            <div className="flex justify-between text-xs text-neutral-300 mb-1.5 font-medium">
              <span>Acoustic Reverb Chamber</span>
              <span className="font-mono text-[#1DB954] font-bold">{reverbRoom}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={reverbRoom}
              onChange={(e) => setReverbRoom(parseInt(e.target.value))}
              className="w-full accent-[#1DB954] h-1.5 bg-neutral-700 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-neutral-300 mb-1.5 font-medium">
              <span>Sub-Bass Harmonic Boost</span>
              <span className="font-mono text-[#1DB954] font-bold">{bassBoost}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={bassBoost}
              onChange={(e) => setBassBoost(parseInt(e.target.value))}
              className="w-full accent-[#1DB954] h-1.5 bg-neutral-700 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
