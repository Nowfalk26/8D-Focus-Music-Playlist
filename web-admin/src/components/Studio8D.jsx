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
  } = usePlayer();

  const [activePreset, setActivePreset] = useState("chill");
  const [bassBoost, setBassBoost] = useState(65);
  const [azimuth, setAzimuth] = useState(142);

  // Live azimuth angle update
  useEffect(() => {
    if (!isPlaying || !is8DActive) return;
    const interval = setInterval(() => {
      setAzimuth((prev) => (prev + Math.round(orbitSpeed * 2.5)) % 360);
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
      color: "text-mint-400 bg-mint-400/20",
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
      icon: "psychology",
      color: "text-indigo-400 bg-indigo-500/20",
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
      color: "text-rose-400 bg-rose-500/20",
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
      color: "text-purple-400 bg-purple-500/20",
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
    <div className="w-full flex-1 bg-surface flex flex-col overflow-y-auto min-w-0 font-sans text-on-surface select-none pb-28">
      {/* Studio Header Bar with DSP Telemetry */}
      <div className="p-4 sm:p-5 pb-3 border-b border-white/[0.05] flex flex-wrap items-center justify-between gap-3 bg-gradient-to-b from-[#14171f] to-transparent shrink-0">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              AI 8D Studio &amp; Customizer
            </h1>
            <button
              onClick={() => setIs8DActive(!is8DActive)}
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                is8DActive
                  ? "bg-mint-400/10 text-mint-400 border border-mint-400/30 shadow-[0_0_12px_rgba(0,245,155,0.2)]"
                  : "bg-surface-container-high text-on-surface-variant border border-outline/20"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${is8DActive ? "bg-mint-400 animate-pulse" : "bg-neutral-500"}`} />
              {is8DActive ? "8D DSP Active" : "8D DSP Bypassed"}
            </button>
          </div>
          {/* Telemetry Badges Strip */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-[11px] font-mono text-zinc-400">
            <span className="flex items-center gap-1.5 text-mint-400">
              <span className="material-symbols-outlined text-sm">sensors</span>
              Bilateral HRTF: 360° Sphere
            </span>
            <span className="text-zinc-600">•</span>
            <span>Latency: <strong className="text-zinc-300">1.2ms</strong></span>
            <span className="text-zinc-600">•</span>
            <span>Azimuth: <strong className="text-zinc-300">{azimuth}°</strong></span>
            <span className="text-zinc-600">•</span>
            <span>Phase Sync: <strong className="text-mint-400">99.4%</strong></span>
          </div>
        </div>

        {/* Studio Quick Modes */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onNavigate && onNavigate("orbit")}
            className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest border border-white/[0.06] text-xs font-medium text-zinc-300 flex items-center gap-1.5 transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm text-mint-400">tune</span>
            <span>DSP Config</span>
          </button>
          <button
            onClick={() => setIs8DActive(!is8DActive)}
            className="px-3 py-1.5 rounded-lg bg-mint-400/20 hover:bg-mint-400/30 border border-mint-400/40 text-xs font-semibold text-mint-400 flex items-center gap-1.5 transition shadow-[0_0_15px_rgba(0,245,155,0.15)] cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">sync</span>
            <span>Auto Orbit</span>
          </button>
        </div>
      </div>

      {/* Studio Inner Body */}
      <div className="p-4 sm:p-5 space-y-5 flex-1 flex flex-col justify-between max-w-[1400px] w-full mx-auto">
        {/* BEGIN: 360° Bilateral Soundstage Radar Sphere */}
        <div className="relative w-full h-[360px] lg:h-[400px] rounded-2xl bg-gradient-to-b from-[#0c0e12] via-[#0f1117] to-[#0c0e12] border border-white/[0.07] overflow-hidden flex items-center justify-center shadow-inner">
          {/* Background Radar Ambient Grids */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />
          
          {/* Radar Crosshairs */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-full h-px bg-white/[0.05]" />
            <div className="h-full w-px bg-white/[0.05] absolute" />
          </div>

          {/* Outer Radar Ring 3 (Spatial Perimeter) */}
          <div className="absolute w-[310px] h-[310px] sm:w-[360px] sm:h-[360px] rounded-full border border-white/[0.06] flex items-center justify-center pointer-events-none">
            <span className="absolute top-2 text-[9px] font-mono text-zinc-500 uppercase tracking-widest">0° Front</span>
            <span className="absolute bottom-2 text-[9px] font-mono text-zinc-500 uppercase tracking-widest">180° Rear</span>
            <span className="absolute left-2 text-[9px] font-mono text-zinc-500 uppercase tracking-widest">270° L</span>
            <span className="absolute right-2 text-[9px] font-mono text-zinc-500 uppercase tracking-widest">90° R</span>
          </div>

          {/* Middle Radar Ring 2 (Active Orbit Path) */}
          <div className="absolute w-[220px] h-[220px] sm:w-[260px] sm:h-[260px] rounded-full border border-dashed border-mint-400/25 flex items-center justify-center">
            {/* Animated Rotating Orbital Container for Audio Sources */}
            <div
              className="absolute inset-0 transition-transform duration-100"
              style={{ transform: `rotate(${azimuth}deg)` }}
            >
              {/* Moving Sound Node 1 (Green Stereo Node) */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center space-x-1.5 bg-[#0c0e12]/90 border border-mint-400 px-2 py-0.5 rounded-full shadow-[0_0_15px_rgba(0,245,155,0.6)]">
                <span className="w-2 h-2 rounded-full bg-mint-400 animate-ping" />
                <span className="text-[9px] font-mono font-bold text-mint-400 tracking-wider">
                  {Math.round(48 * orbitSpeed)} RPM
                </span>
                <span className="text-[8px] bg-mint-400 text-black px-1 rounded font-bold">L-R</span>
              </div>
              {/* Moving Sound Node 2 (Opposite Purple Satellite Node) */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-purple-500 border-2 border-white shadow-[0_0_12px_rgba(168,85,247,0.9)] pulse-glow" />
            </div>
          </div>

          {/* Inner Radar Ring 1 (Near Field) */}
          <div className="absolute w-[120px] h-[120px] rounded-full border border-white/[0.08] bg-white/[0.01]" />

          {/* Central LISTENER Node (Headphones Icon) */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-surface-container border border-mint-400/40 shadow-[0_0_25px_rgba(0,245,155,0.2)] flex items-center justify-center group hover:scale-105 transition cursor-pointer">
              <span className="material-symbols-outlined text-2xl text-mint-400">headphones</span>
            </div>
            <span className="mt-2 text-[10px] font-mono font-bold tracking-widest text-zinc-400 uppercase">
              Listener
            </span>
          </div>

          {/* Top-Left Corner HRTF Metric Badge */}
          <div className="absolute top-4 left-4 flex items-center space-x-2 text-[10px] font-mono bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/[0.06]">
            <span className="w-2 h-2 rounded-full bg-mint-400 animate-pulse" />
            <span className="text-zinc-300">Binaural Panning Matrix</span>
          </div>

          {/* Bottom-Right Sound Field Mode Selector */}
          <div className="absolute bottom-4 right-4 flex items-center space-x-2 bg-black/70 backdrop-blur-md p-1 rounded-lg border border-white/[0.08]">
            <button
              onClick={() => onNavigate && onNavigate("orbit")}
              className="px-2.5 py-1 rounded text-[11px] font-medium bg-mint-400/20 text-mint-400 border border-mint-400/30 flex items-center gap-1.5 cursor-pointer hover:bg-mint-400/30 transition"
            >
              <span className="material-symbols-outlined text-xs">orbit</span>
              <span>360° Stage</span>
            </button>
            <span className="px-2.5 py-1 rounded text-[11px] font-medium text-zinc-400">
              Binaural 3D
            </span>
          </div>
        </div>

        {/* Active Track Banner */}
        <div className="bg-surface-container/80 border border-white/[0.06] rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-mint-400/10 border border-mint-400/30 flex items-center justify-center text-mint-400 shadow-[0_0_10px_rgba(0,245,155,0.2)] shrink-0">
              <span className="material-symbols-outlined text-lg">volume_up</span>
            </div>
            <div className="min-w-0">
              <div className="text-xs text-zinc-400 font-mono truncate">
                Active Track: <span className="text-white font-semibold">{currentSong?.title || "Flow 8D Spatial Track"}</span>
              </div>
              <div className="text-[11px] text-zinc-500 truncate">
                Processed via 64-bit Floating Binaural Synthesis • {currentSong?.artist || "Master Audio"}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={togglePlay}
              className="px-3.5 py-1.5 rounded-lg bg-mint-400 text-black font-semibold text-xs flex items-center gap-1.5 hover:bg-mint-300 transition shadow-[0_0_15px_rgba(0,245,155,0.4)] cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm font-bold">
                {isPlaying ? "pause" : "play_arrow"}
              </span>
              <span>{isPlaying ? "Pause" : "Play"}</span>
            </button>
            <button
              onClick={() => onNavigate && onNavigate("orbit")}
              className="px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-xs text-zinc-300 flex items-center gap-1.5 transition cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm text-mint-400">spatial_audio</span>
              <span>360° Stage</span>
            </button>
          </div>
        </div>

        {/* 8D Spatial Presets Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="material-symbols-outlined text-mint-400 text-base">auto_awesome</span>
              <h2 className="text-sm font-semibold text-white tracking-wide">8D Spatial Presets</h2>
              <span className="text-zinc-500 text-xs hidden sm:inline">• 1-click acoustic tuning</span>
            </div>
            <span className="text-[11px] font-mono text-zinc-500">HRTF Profiles: 4 Loaded</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {presets.map((p) => {
              const isSelected = activePreset === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => handleApplyPreset(p)}
                  className={`relative rounded-xl p-3.5 cursor-pointer transition ${
                    isSelected
                      ? "bg-gradient-to-b from-[#1b2320] to-[#12161b] border-2 border-mint-400/80 shadow-[0_0_20px_rgba(0,245,155,0.15)]"
                      : "bg-surface-container/60 hover:bg-surface-container border border-white/[0.07] hover:border-white/[0.15]"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${p.color}`}>
                        <span className="material-symbols-outlined text-sm">{p.icon}</span>
                      </div>
                      <h3 className={`text-xs font-bold ${isSelected ? "text-white" : "text-zinc-200"}`}>{p.name}</h3>
                    </div>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-mint-400 shadow-[0_0_8px_#00f59b]" />
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-2 line-clamp-2">{p.desc}</p>
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/[0.08] text-[10px] font-mono">
                    <span className="text-mint-400 font-semibold">{p.speed}x</span>
                    <span className="text-zinc-400">{p.rpm} RPM</span>
                    <span className="text-zinc-300 font-medium">{p.depth}% Depth</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Orbit Dynamics & Harmonic EQ Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Orbit Angular Velocity Slider */}
          <div className="bg-surface-container/70 border border-white/[0.06] rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white tracking-wide">Orbit Dynamics &amp; Spatial Velocity</h4>
                <p className="text-[11px] text-zinc-400">Orbit Angular Velocity</p>
              </div>
              <span className="text-xs font-mono font-bold text-mint-400 bg-mint-400/10 px-2 py-0.5 rounded border border-mint-400/20">
                {orbitSpeed.toFixed(2)}x ({Math.round(48 * orbitSpeed)} RPM)
              </span>
            </div>
            <div className="flex items-center space-x-3 pt-1">
              <span className="material-symbols-outlined text-sm text-zinc-500">speed</span>
              <input
                className="w-full h-1.5 bg-zinc-700/80 rounded-lg appearance-none cursor-pointer accent-mint-400"
                max="2.5"
                min="0.2"
                step="0.05"
                type="range"
                value={orbitSpeed}
                onChange={(e) => setOrbitSpeed(parseFloat(e.target.value))}
              />
              <span className="material-symbols-outlined text-sm text-mint-400">bolt</span>
            </div>
          </div>

          {/* Acoustics & Harmonic EQ Slider */}
          <div className="bg-surface-container/70 border border-white/[0.06] rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white tracking-wide">Acoustics &amp; Harmonic EQ</h4>
                <p className="text-[11px] text-zinc-400">Acoustic Reverb Chamber</p>
              </div>
              <span className="text-xs font-mono font-bold text-mint-400 bg-mint-400/10 px-2 py-0.5 rounded border border-mint-400/20">
                {reverbRoom}%
              </span>
            </div>
            <div className="flex items-center space-x-3 pt-1">
              <span className="material-symbols-outlined text-sm text-zinc-500">speaker</span>
              <input
                className="w-full h-1.5 bg-zinc-700/80 rounded-lg appearance-none cursor-pointer accent-mint-400"
                max="100"
                min="0"
                step="1"
                type="range"
                value={reverbRoom}
                onChange={(e) => setReverbRoom(parseInt(e.target.value))}
              />
              <span className="material-symbols-outlined text-sm text-purple-400">auto_awesome</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

