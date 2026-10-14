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
    <div className="w-full flex flex-col space-y-6 max-w-7xl mx-auto pb-28 text-slate-200 font-sans">
      {/* Top Navigation & Telemetry Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-semibold">
              Spatial Engine Lab
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-xs font-mono text-slate-400">v4.2.8 Binaural HRTF DSP</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-extrabold text-white tracking-tight">
            AI 8D Studio &amp; Customizer
          </h1>
        </div>

        {/* Mode Badges & Live Status */}
        <div className="flex items-center flex-wrap gap-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#131322] border border-white/5 text-slate-300 text-xs font-medium shadow-sm">
            <span className="material-symbols-outlined text-[15px] text-purple-400">headphones</span>
            <span>8D Audio Engine</span>
            <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-purple-900/50 text-purple-300 border border-purple-500/30">
              Pro
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#131322] border border-white/5 text-slate-300 text-xs font-medium shadow-sm">
            <span className="material-symbols-outlined text-[15px] text-pink-400">smart_toy</span>
            <span>Milo AI Assist</span>
          </div>
          <button
            onClick={() => setIs8DActive(!is8DActive)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-bold transition-all shadow-sm ${
              is8DActive
                ? "bg-cyan-950/60 border border-cyan-400/40 text-cyan-300 shadow-glow-cyan"
                : "bg-[#131322] border border-white/10 text-slate-400"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${is8DActive ? "bg-cyan-400 animate-ping" : "bg-slate-500"}`}
            ></span>
            <span>{is8DActive ? "8D DSP Active" : "8D DSP Bypassed"}</span>
          </button>
        </div>
      </div>

      {/* Main Soundstage Radar / Visualizer Canvas */}
      <div className="relative w-full rounded-3xl bg-[#080812] border border-white/10 p-6 md:p-8 overflow-hidden shadow-2xl flex flex-col items-center justify-between min-h-[420px]">
        {/* Ambient Radial Aurora Glow */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-16 left-1/3 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>

        {/* HUD Telemetry Overlay */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between text-slate-400 font-mono text-[11px] z-10 pointer-events-none gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-slate-200">
              <span className="material-symbols-outlined text-sm text-cyan-400">sensors</span>
              Bilateral HRTF: 360° Sphere
            </span>
            <span className="text-slate-600">•</span>
            <span>Lat: 1.2ms</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Azimuth: {azimuth}°</span>
            <span className="text-slate-600">•</span>
            <span className="text-purple-400 font-semibold">Phase Sync: 99.4%</span>
          </div>
        </div>

        {/* Interactive Binaural Orbital Soundstage */}
        <div className="relative w-64 h-64 md:w-72 md:h-72 my-6 flex items-center justify-center">
          {/* Outer Orbit Ring with markers */}
          <div className="absolute inset-0 rounded-full border border-white/10 bg-[#0a0a14]/40"></div>
          {/* Concentric Ring 2 */}
          <div className="absolute inset-6 rounded-full border border-cyan-400/20 bg-[#131322]/20"></div>
          {/* Concentric Ring 3 */}
          <div className="absolute inset-12 rounded-full border border-purple-500/30 bg-[#1b1b30]/30"></div>

          {/* Center Listener Avatar */}
          <div className="relative z-20 w-16 h-16 rounded-full bg-[#131322] border border-cyan-400/40 flex flex-col items-center justify-center shadow-glow-cyan text-cyan-300">
            <span className="material-symbols-outlined text-2xl">headphones</span>
            <span className="text-[8px] font-mono tracking-wider -mt-0.5 text-slate-300 font-bold">
              LISTENER
            </span>
          </div>

          {/* Animated Orbiting Node Carrier (Outer Track) */}
          <div
            className="absolute inset-0 transition-transform duration-100"
            style={{ transform: `rotate(${azimuth}deg)` }}
          >
            {/* Spatial Audio Emitter Node */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex flex-col items-center group cursor-pointer">
              <div className="relative w-5 h-5 rounded-full bg-cyan-400 shadow-glow-cyan flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-obsidian-950"></span>
                <span className="absolute -inset-1 rounded-full bg-cyan-400/40 animate-ping"></span>
              </div>
              <span className="text-[9px] font-mono text-cyan-300 px-1.5 py-0.5 mt-1 rounded bg-[#0a0a14]/90 border border-cyan-400/40">
                L·R
              </span>
            </div>
          </div>

          {/* Secondary Harmonic Orbit Node (Inner Track) */}
          <div
            className="absolute inset-8 transition-transform duration-100"
            style={{ transform: `rotate(${-azimuth * 0.7}deg)` }}
          >
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 flex items-center justify-center">
              <div className="w-3.5 h-3.5 rounded-full bg-purple-500 shadow-glow-purple"></div>
            </div>
          </div>

          {/* Orbit Speed Readout Center Floating Badge */}
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#131322] border border-white/10 shadow-md flex items-center gap-1.5 z-20">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="font-mono text-xs font-bold text-white">
              {Math.round(48 * orbitSpeed)} RPM
            </span>
          </div>
        </div>

        {/* Active Track Status Bar & Action Switch */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/5 z-10">
          <div className="flex items-center gap-2.5 text-center sm:text-left">
            <span className="material-symbols-outlined text-cyan-400 text-base">graphic_eq</span>
            <p className="text-xs text-slate-400">
              Playing:{" "}
              <span className="text-sm text-white font-bold font-display">
                {currentSong?.title || "Usure Neethaney (8D Panning)"}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={togglePlay}
              className="px-4 py-2 rounded-full bg-[#131322] hover:bg-[#1b1b30] border border-white/10 text-white text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
            >
              <span className="material-symbols-outlined text-sm text-cyan-400">
                {isPlaying ? "pause" : "play_arrow"}
              </span>
              <span>{isPlaying ? "Pause" : "Play"}</span>
            </button>
            <button
              onClick={() => onNavigate("orbit")}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 hover:brightness-110 text-obsidian-950 text-xs font-bold flex items-center gap-1.5 shadow-glow-cyan active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-sm">360</span>
              <span>360° Stage</span>
            </button>
          </div>
        </div>
      </div>

      {/* 8D Spatial Presets Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-cyan-400 text-lg">auto_awesome</span>
            <h2 className="text-lg font-bold font-display text-white">8D Spatial Presets</h2>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">• One-tap acoustic tuning</span>
          </div>
          <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider font-semibold">
            Adaptive DSP Matrix
          </span>
        </div>

        {/* Presets Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {presets.map((p) => {
            const isSelected = activePreset === p.id;
            return (
              <div
                key={p.id}
                onClick={() => handleApplyPreset(p)}
                className={`group relative p-4 rounded-2xl cursor-pointer transition-all duration-200 border ${
                  isSelected
                    ? "bg-[#1b1b30] border-cyan-400 shadow-glow-cyan"
                    : "bg-[#0d0d18] hover:bg-[#131322] border-white/5"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-cyan-400 shadow-glow-cyan"></div>
                )}
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className={`material-symbols-outlined text-lg ${
                      isSelected ? "text-cyan-400" : "text-slate-400 group-hover:text-cyan-300"
                    }`}
                  >
                    {p.icon}
                  </span>
                  <h3 className="text-sm font-bold text-white">{p.name}</h3>
                </div>
                <p className="text-xs text-slate-400 mb-3 leading-relaxed">{p.desc}</p>
                <div className="flex items-center justify-between text-[10px] font-mono pt-2 border-t border-white/5">
                  <span className="text-cyan-400 font-bold">{p.speed}x Speed</span>
                  <span className="text-slate-400">{p.rpm} RPM</span>
                  <span className="text-purple-400">{p.depth}% Depth</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DSP Controls Slider Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Sliders Block 1 */}
        <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-5">
          <h3 className="text-sm font-bold font-display text-white tracking-wide border-b border-white/5 pb-2">
            Orbit Dynamics &amp; Spatial Velocity
          </h3>

          {/* Orbit Speed Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-slate-200">Orbit Velocity (RPM)</span>
              <span className="font-mono text-cyan-400 font-bold">
                {orbitSpeed.toFixed(1)}x ({Math.round(48 * orbitSpeed)} RPM)
              </span>
            </div>
            <input
              type="range"
              min="0.2"
              max="2.5"
              step="0.1"
              value={orbitSpeed}
              onChange={(e) => setOrbitSpeed(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0.2x (Ambient Meditation)</span>
              <span>1.0x (Standard Focus)</span>
              <span>2.5x (Hyper Orbit)</span>
            </div>
          </div>

          {/* Spatial Depth Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-slate-200">Spatial Depth / Field Width</span>
              <span className="font-mono text-purple-400 font-bold">{spatialDepth}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={spatialDepth}
              onChange={(e) => setSpatialDepth(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>Narrow Stereo</span>
              <span>Expanded Binaural</span>
              <span>Full 360° Sphere</span>
            </div>
          </div>
        </div>

        {/* Sliders Block 2 */}
        <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-5">
          <h3 className="text-sm font-bold font-display text-white tracking-wide border-b border-white/5 pb-2">
            Acoustic Chamber &amp; Frequency Resonance
          </h3>

          {/* Reverb Room Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-slate-200">Reverb Chamber Decay</span>
              <span className="font-mono text-cyan-400 font-bold">{reverbRoom}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={reverbRoom}
              onChange={(e) => setReverbRoom(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>Dry Studio</span>
              <span>Cathedral Hall</span>
              <span>Cosmic Void</span>
            </div>
          </div>

          {/* Bass & Sub-Harmonic Boost */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-slate-200">Bass &amp; Sub-Harmonic Warmth</span>
              <span className="font-mono text-pink-400 font-bold">{bassBoost}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={bassBoost}
              onChange={(e) => setBassBoost(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>Neutral Flat</span>
              <span>Warm Binaural</span>
              <span>Subwoofer Punch</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
