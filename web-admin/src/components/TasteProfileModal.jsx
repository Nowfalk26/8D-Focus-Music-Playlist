import React, { useState } from "react";
import { usePlayer } from "../context/PlayerContext";

export default function TasteProfileModal({ onClose }) {
  const { tasteProfile, resetTasteProfile } = usePlayer();
  const [resetting, setResetting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleReset = async () => {
    try {
      setResetting(true);
      await resetTasteProfile();
      setShowConfirm(false);
    } catch (e) {
      console.error("Error resetting profile:", e);
    } finally {
      setResetting(false);
    }
  };

  const dimensions = tasteProfile?.dimensionBreakdown || [
    { dimension: "Tempo (BPM)", value: 42 },
    { dimension: "Acoustic Energy", value: 50 },
    { dimension: "Danceability / Rhythm", value: 50 },
    { dimension: "Valence / Positivity", value: 50 },
    { dimension: "Acousticness", value: 50 },
    { dimension: "Spectral Brightness", value: 38 },
    { dimension: "Harmonic Contrast", value: 50 },
    { dimension: "Binaural Alignment", value: 50 },
    { dimension: "8D Spatial Depth", value: 85 },
    { dimension: "Calmness / Focus", value: 50 },
  ];

  const recentEvents = tasteProfile?.recentInteractions || [];
  const shiftDetected = tasteProfile?.lastShiftDetected;
  const shiftMagnitude = tasteProfile?.shiftMagnitude || 0;
  const totalInteractions = tasteProfile?.totalInteractions || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0e0818]/95 rounded-3xl border border-purple-500/30 shadow-[0_25px_80px_rgba(0,0,0,0.9)] overflow-hidden p-6 md:p-8 flex flex-col space-y-6">
        {/* Ambient Glows */}
        <div className="absolute -top-16 -right-16 w-52 h-52 bg-purple-600/25 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-16 -left-16 w-52 h-52 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-purple-500/20 pb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-purple to-brand-cyan p-[1.5px] shadow-neon-purple flex items-center justify-center">
              <span className="text-xl">🧬</span>
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
                Your Music Taste & ML Fingerprint
              </h2>
              <p className="text-xs text-purple-300/70 font-medium">
                Learned from sequential listening history ({totalInteractions} interactions recorded)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-purple-900/40 text-purple-300 hover:text-white flex items-center justify-center border border-purple-500/30 text-sm"
          >
            ✕
          </button>
        </div>

        {/* Adaptive Shift Detector Indicator */}
        <div className="relative z-10">
          {shiftDetected ? (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/80 to-cyan-950/80 border border-cyan-400/60 shadow-neon-cyan flex items-start gap-3">
              <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping mt-1 shrink-0"></span>
              <div>
                <div className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                  <span>Dynamic Preference Shift Detected!</span>
                  <span className="px-2 py-0.5 rounded bg-cyan-400/20 font-mono text-[10px]">
                    Magnitude: {shiftMagnitude}
                  </span>
                </div>
                <p className="text-xs text-purple-200/90 mt-1 leading-relaxed">
                  The model recognized that your latest selection departs from prior tracks. The engine has boosted short-term recency weighting (85%) to immediately adapt recommendations to your new mood direction, while preserving foundational long-term preferences.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs font-semibold text-purple-200">
                  Stable Focus Trajectory: Coherent listening sequence
                </span>
              </div>
              <span className="text-[11px] font-mono text-cyan-300 bg-purple-900/60 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                Balanced Dual-Horizon
              </span>
            </div>
          )}
        </div>

        {/* 10-Dimensional Feature Breakdown */}
        <div className="space-y-3 relative z-10">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white tracking-wide">
              Acoustic Trait Balance (10-Dimensional Vector)
            </h3>
            <span className="text-[10px] text-purple-300/60 font-mono">
              DSP Normalized [0 - 100%]
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {dimensions.map((dim, idx) => {
              // Color gradient selection
              const colors = [
                "from-purple-500 to-indigo-500",
                "from-pink-500 to-rose-500",
                "from-cyan-400 to-blue-500",
                "from-amber-400 to-orange-500",
                "from-emerald-400 to-teal-500",
                "from-violet-500 to-purple-600",
                "from-cyan-500 to-teal-400",
                "from-indigo-400 to-violet-500",
                "from-brand-purple to-brand-cyan",
                "from-teal-400 to-emerald-500",
              ];
              const grad = colors[idx % colors.length];

              return (
                <div
                  key={dim.dimension}
                  className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/20 flex flex-col space-y-1.5"
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-purple-200/90 truncate">
                      {dim.dimension}
                    </span>
                    <span className="font-mono text-cyan-300 font-bold ml-2">
                      {dim.value}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${grad} rounded-full transition-all duration-500`}
                      style={{ width: `${dim.value}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Interaction Sequence Trail */}
        {recentEvents.length > 0 && (
          <div className="space-y-2.5 relative z-10">
            <h3 className="text-sm font-bold text-white tracking-wide">
              Recent Selection Sequence & Learning Feedback
            </h3>
            <div className="space-y-1.5 max-h-40 overflow-y-auto no-scrollbar pr-1">
              {recentEvents.map((ev, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded-xl bg-[#130b26]/70 border border-purple-500/20 text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-mono text-[10px] text-purple-400/80">#{i + 1}</span>
                    <span className="font-semibold text-white truncate max-w-[200px]">
                      {ev.songTitle || "Track"}
                    </span>
                    <span className="text-[10px] text-purple-300/60 truncate">({ev.category})</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        ev.weight < 0
                          ? "bg-red-500/20 text-red-300 border border-red-500/30"
                          : ev.weight >= 2
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-purple-900/40 text-cyan-300 border border-purple-500/30"
                      }`}
                    >
                      {ev.eventType} ({ev.weight > 0 ? `+${ev.weight}` : ev.weight})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reset / Clear History Action */}
        <div className="pt-2 border-t border-purple-500/20 flex items-center justify-between relative z-10">
          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              className="text-xs text-red-400 hover:text-red-300 underline font-semibold transition-colors"
            >
              Clear History & Reset Learned Taste
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-300 font-semibold">Confirm Reset?</span>
              <button
                onClick={handleReset}
                disabled={resetting}
                className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
              >
                {resetting ? "Resetting..." : "Yes, Reset"}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="px-2 py-1 rounded-lg bg-purple-900/40 text-purple-200 text-xs"
              >
                Cancel
              </button>
            </div>
          )}

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-purple to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-neon-purple"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
