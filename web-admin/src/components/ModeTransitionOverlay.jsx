import React, { useEffect, useState } from "react";
import SpatialAudioAnimation from "./SpatialAudioAnimation";

/**
 * ModeTransitionOverlay
 * Immersive full-screen dark loading screen shown whenever switching audio modes:
 * - Displays the authentic Stitch spatial audio artwork (stationary human silhouette,
 *   animated neon orbital rings, harmonic waveform, particles)
 * - Mode-specific loading typography:
 *     Normal Music: "Preparing Your Music Experience"
 *     8D Audio: "Entering the 8D Universe"
 *     9D Audio: "Entering the 9D Dimension"
 * - Small, elegant loading indicator and smooth progress beam (without fake percentage numbers)
 * - Cinematic 1.8s timing with smooth fade-in and fade-out
 */
export default function ModeTransitionOverlay({
  isOpen = false,
  targetMode = "8d",
  onComplete,
}) {
  const [phase, setPhase] = useState("enter"); // enter | active | exit

  const MODE_TITLES = {
    normal: "Preparing Your Music Experience",
    "8d": "Entering the 8D Universe",
    "9d": "Entering the 9D Dimension",
  };

  const MODE_SUBTITLES = {
    normal: "Configuring Studio Master Stereo Fidelity",
    "8d": "Calibrating 360° Binaural Audio Orbit",
    "9d": "Calibrating Multi-Dimensional Acoustic Harmonics",
  };

  const title = MODE_TITLES[targetMode] || MODE_TITLES["8d"];
  const subtitle = MODE_SUBTITLES[targetMode] || MODE_SUBTITLES["8d"];

  useEffect(() => {
    if (!isOpen) {
      setPhase("enter");
      return;
    }

    setPhase("enter");
    const activeTimer = setTimeout(() => {
      setPhase("active");
    }, 50);

    // 1.8 seconds transition duration (within requested 1.5s - 2.5s window)
    const exitTimer = setTimeout(() => {
      setPhase("exit");
    }, 1800);

    const completeTimer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 2100);

    return () => {
      clearTimeout(activeTimer);
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [isOpen, targetMode, onComplete]);

  if (!isOpen) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={title}
      className={`fixed inset-0 z-[200] bg-black flex flex-col items-center justify-between px-6 py-10 transition-opacity duration-300 ${
        phase === "exit" ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Top Brand Tag */}
      <div className="w-full flex items-center justify-between max-w-5xl z-10">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold tracking-wider font-['Plus_Jakarta_Sans',sans-serif] text-white">
            FLOW
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wider bg-gradient-to-r from-[#00e5ff] to-[#a855f7] text-black uppercase">
            8D
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-400">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] animate-ping" />
          <span className="hidden sm:inline">HRTF Binaural Engine</span>
        </div>
      </div>

      {/* Centerpiece: Stitch Reference Artwork with Live Animation */}
      <div className="my-auto w-full flex flex-col items-center justify-center relative">
        <SpatialAudioAnimation mode={targetMode} />

        {/* Mode-Specific Loading Typography */}
        <div className="text-center mt-6 space-y-2 z-10 max-w-md">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-wide font-['Plus_Jakarta_Sans',sans-serif] drop-shadow-[0_0_20px_rgba(0,229,255,0.4)]">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 tracking-wider font-mono">
            {subtitle}
          </p>
        </div>

        {/* Small, Elegant Smooth Progress Indicator (No fake percentage) */}
        <div className="w-48 sm:w-64 h-1 bg-neutral-900 rounded-full mt-7 overflow-hidden relative border border-white/10">
          <div
            className="h-full bg-gradient-to-r from-[#00e5ff] via-[#c084fc] to-[#f43f5e] rounded-full transition-all duration-[1700ms] ease-out shadow-[0_0_10px_#00e5ff]"
            style={{
              width: phase === "enter" ? "10%" : "100%",
            }}
          />
        </div>
      </div>

      {/* Footer Ambient Info */}
      <div className="text-[10px] text-neutral-500 font-mono tracking-widest uppercase z-10">
        Flow 8D • Acoustic Precision
      </div>
    </div>
  );
}
