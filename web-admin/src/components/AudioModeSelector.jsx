import React, { useState } from "react";

export default function AudioModeSelector({
  currentMode = "8d",
  isOpen = false,
  onSelectMode,
  onClose,
  canClose = false,
  isLocked = false,
}) {
  const [highlightedMode, setHighlightedMode] = useState(null);

  const modes = [
    {
      id: "normal",
      label: "Normal Music",
      tag: "Pure Sound",
      subtitle: "Pure sound. Your everyday vibe.",
      description: "Original studio master sound. Standard stereo fidelity without spatial modulation. Clean, authentic, and direct.",
      accent: "#00e5ff",
      accentRgb: "0, 229, 255",
      borderClass: "border-cyan-500/30 hover:border-cyan-400/80 hover:shadow-[0_0_25px_rgba(0,229,255,0.3)]",
      activeBorder: "border-cyan-400 shadow-[0_0_35px_rgba(0,229,255,0.5)] bg-cyan-950/30",
    },
    {
      id: "8d",
      label: "8D Audio",
      tag: "Spatial Orbit",
      subtitle: "Feel the sound move around you.",
      description: "Continuous circular binaural audio panning. Melodies and beats rotate smoothly around your head in 360° space.",
      accent: "#c026d3",
      accentRgb: "192, 38, 211",
      borderClass: "border-purple-500/30 hover:border-purple-400/80 hover:shadow-[0_0_25px_rgba(192,38,211,0.35)]",
      activeBorder: "border-purple-400 shadow-[0_0_35px_rgba(192,38,211,0.55)] bg-purple-950/30",
    },
    {
      id: "9d",
      label: "9D Dimension",
      tag: "Hyper Depth",
      subtitle: "Multi-dimensional holographic sound.",
      description: "Dual-orbital harmonics, micro-echo reflection and spatial frequency isolation create an otherworldly holographic dimension.",
      accent: "#f43f5e",
      accentRgb: "244, 63, 94",
      borderClass: "border-rose-500/30 hover:border-rose-400/80 hover:shadow-[0_0_25px_rgba(244,63,94,0.35)]",
      activeBorder: "border-rose-400 shadow-[0_0_35px_rgba(244,63,94,0.55)] bg-rose-950/30",
    },
  ];

  if (!isOpen) return null;

  const handleCardClick = (modeId) => {
    if (isLocked) return;

    setHighlightedMode(modeId);

    // If user clicks the mode that is already active, do not unnecessarily restart loading animation
    if (modeId === currentMode) {
      if (canClose && onClose) {
        onClose();
      }
      return;
    }

    // Trigger genuine mode switch
    if (onSelectMode) {
      onSelectMode(modeId);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Choose Your Audio Universe"
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 overflow-y-auto no-scrollbar backdrop-blur-2xl bg-black/90 transition-all duration-300"
    >
      {/* Background Ambient Glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          background: "radial-gradient(circle at 50% 30%, rgba(0, 229, 255, 0.12) 0%, rgba(192, 38, 211, 0.08) 45%, rgba(0, 0, 0, 0.95) 100%)",
        }}
      />

      {/* Dismiss button if mode was previously chosen */}
      {canClose && !isLocked && (
        <button
          onClick={onClose}
          className="absolute top-5 right-5 sm:top-7 sm:right-7 z-30 p-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white transition-all text-sm active:scale-90"
          title="Dismiss mode selector"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Main Content Modal */}
      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center my-auto py-6">
        {/* Header Branding */}
        <div className="text-center space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900/80 border border-neutral-700/60 text-[#00e5ff] text-xs font-mono font-medium shadow-[0_0_15px_rgba(0,229,255,0.15)]">
            <span className="w-2 h-2 rounded-full bg-[#00e5ff] animate-ping" />
            <span>FLOW 8D AUDIO MODES</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white font-['Plus_Jakarta_Sans',sans-serif]">
            Select Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00e5ff] via-[#c084fc] to-[#f43f5e]">Listening Universe</span>
          </h2>

          <p className="text-sm sm:text-base text-neutral-400 leading-relaxed font-normal">
            Choose your spatial audio experience. Each mode unlocks a dedicated catalog, tailored playback dynamics, and ML recommendations.
          </p>
        </div>

        {/* Selectable Audio Mode Cards (3 Modes: Normal, 8D Audio, 9D Dimension) */}
        <div className="grid grid-cols-1 md:grid-cols-3 max-w-5xl mx-auto gap-5 sm:gap-6 w-full mt-6 sm:mt-10">
          {modes.map((mode) => {
            const isCurrent = currentMode === mode.id;
            const isSelected = (highlightedMode || currentMode) === mode.id;

            return (
              <div
                key={mode.id}
                role="button"
                tabIndex={0}
                onClick={() => handleCardClick(mode.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleCardClick(mode.id);
                  }
                }}
                className={`group relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between min-h-[380px] sm:min-h-[420px] cursor-pointer transition-all duration-300 bg-neutral-950/70 backdrop-blur-xl border ${
                  isSelected ? mode.activeBorder : mode.borderClass
                } hover:-translate-y-2 active:scale-[0.98] overflow-hidden ${
                  isLocked ? "pointer-events-none opacity-80" : ""
                }`}
              >
                {/* Subtle Glow Burst */}
                <div
                  className="absolute -right-16 -top-16 w-40 h-40 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"
                  style={{ backgroundColor: mode.accent }}
                />

                {/* Top Pill Badges */}
                <div className="flex items-center justify-between z-10">
                  <span
                    className="text-[11px] font-mono uppercase tracking-wider font-bold px-3 py-1 rounded-full border shadow-sm inline-flex items-center justify-center text-center"
                    style={{
                      color: mode.accent,
                      borderColor: `rgba(${mode.accentRgb}, 0.4)`,
                      backgroundColor: `rgba(${mode.accentRgb}, 0.1)`,
                    }}
                  >
                    {mode.tag}
                  </span>

                  {isCurrent && (
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 inline-flex items-center justify-center text-center gap-1.5 shadow-sm font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>CURRENT</span>
                    </span>
                  )}
                </div>

                {/* Center Visual Representation */}
                <div className="my-auto py-6 flex flex-col items-center justify-center text-center z-10">
                  {mode.id === "normal" && <NormalModeVisual />}
                  {mode.id === "8d" && <EightDModeVisual />}
                  {mode.id === "9d" && <NineDModeVisual />}

                  <h3 className="text-2xl font-black text-white mt-5 tracking-tight group-hover:scale-105 transition-transform duration-300 font-['Plus_Jakarta_Sans',sans-serif] text-center">
                    {mode.label}
                  </h3>

                  <p
                    className="text-xs font-semibold mt-1 tracking-wide text-center"
                    style={{ color: mode.accent }}
                  >
                    "{mode.subtitle}"
                  </p>
                </div>

                {/* Bottom Details & Action Button */}
                <div className="space-y-4 z-10 pt-2 border-t border-white/5 flex flex-col items-center justify-center text-center">
                  <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed text-center">
                    {mode.description}
                  </p>

                  <button
                    type="button"
                    disabled={isLocked}
                    className="w-full py-3 px-4 rounded-2xl text-xs font-bold tracking-wider uppercase transition-all duration-300 flex items-center justify-center text-center gap-2 shadow-lg active:scale-95 group-hover:brightness-125 font-mono"
                    style={{
                      backgroundColor: isCurrent ? mode.accent : `rgba(${mode.accentRgb}, 0.18)`,
                      color: isCurrent ? "#000000" : "#ffffff",
                      border: `1px solid rgba(${mode.accentRgb}, 0.45)`,
                    }}
                  >
                    <span>{isCurrent ? "Active Experience" : `Enter ${mode.label}`}</span>
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Normal Mode Icon Visual (Sound Waveform with cyan/silver light)
function NormalModeVisual() {
  return (
    <div className="w-24 h-24 rounded-full bg-cyan-950/30 border border-cyan-500/40 flex items-center justify-center relative overflow-hidden group-hover:scale-110 transition-transform duration-300 shadow-[0_0_20px_rgba(0,229,255,0.2)]">
      <div className="flex items-center gap-1.5 h-10 px-2 z-10">
        <div className="w-1 rounded-full bg-cyan-400 h-3 animate-pulse" style={{ animationDelay: "0ms" }} />
        <div className="w-1 rounded-full bg-cyan-300 h-6 animate-pulse" style={{ animationDelay: "150ms" }} />
        <div className="w-1 rounded-full bg-white h-9 animate-pulse" style={{ animationDelay: "300ms" }} />
        <div className="w-1 rounded-full bg-cyan-200 h-10 animate-pulse" style={{ animationDelay: "450ms" }} />
        <div className="w-1 rounded-full bg-white h-7 animate-pulse" style={{ animationDelay: "200ms" }} />
        <div className="w-1 rounded-full bg-cyan-300 h-5 animate-pulse" style={{ animationDelay: "350ms" }} />
        <div className="w-1 rounded-full bg-cyan-400 h-2.5 animate-pulse" style={{ animationDelay: "500ms" }} />
      </div>
    </div>
  );
}

// 8D Audio Mode Visual (Rotating circular sound field with particles around headphones)
function EightDModeVisual() {
  return (
    <div className="w-24 h-24 rounded-full bg-purple-950/30 border border-purple-500/40 flex items-center justify-center relative overflow-hidden group-hover:scale-110 transition-transform duration-300 shadow-[0_0_25px_rgba(192,38,211,0.25)]">
      {/* Rotating Spatial Ring */}
      <div
        className="absolute inset-2 rounded-full border-2 border-dashed border-purple-400/80 animate-spin"
        style={{ animationDuration: "6s" }}
      />
      {/* Orbiting Particle Nodes */}
      <div
        className="absolute inset-0 animate-spin flex items-center justify-between"
        style={{ animationDuration: "4s" }}
      >
        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00e5ff] -ml-1" />
        <span className="w-2.5 h-2.5 rounded-full bg-pink-400 shadow-[0_0_8px_#ec4899] -mr-1" />
      </div>
      {/* Headphone Core */}
      <div className="w-10 h-10 rounded-full bg-purple-900/60 flex items-center justify-center text-purple-200 z-10 shadow-neon-purple">
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12 1a9 9 0 0 0-9 9v7c0 2.21 1.79 4 4 4h1a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2H6v-2a6 6 0 0 1 12 0v2h-2a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h1c2.21 0 4-1.79 4-4v-7a9 9 0 0 0-9-9z" />
        </svg>
      </div>
    </div>
  );
}

// 9D Dimension Mode Visual (Holographic multi-layered orbital field)
function NineDModeVisual() {
  return (
    <div className="w-24 h-24 rounded-full bg-rose-950/30 border border-rose-500/40 flex items-center justify-center relative overflow-hidden group-hover:scale-110 transition-transform duration-300 shadow-[0_0_25px_rgba(244,63,94,0.3)]">
      {/* Outer Rotating Dotted Ring */}
      <div
        className="absolute inset-1 rounded-full border-2 border-dotted border-rose-400/70 animate-spin"
        style={{ animationDuration: "8s" }}
      />
      {/* Reverse Dashed Ring */}
      <div
        className="absolute inset-3 rounded-full border border-dashed border-cyan-400/60 animate-spin"
        style={{ animationDuration: "3.5s", animationDirection: "reverse" }}
      />
      {/* Glowing 9D Dimensional Badge */}
      <div className="relative z-10 w-9 h-9 rounded-full bg-gradient-to-tr from-rose-500 to-purple-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(244,63,94,0.6)] text-xs font-black tracking-wider">
        9D
      </div>
    </div>
  );
}


