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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto select-none">
      <div className="relative w-full max-w-2xl bg-[#181818] rounded-3xl border border-white/10 shadow-2xl overflow-hidden p-6 md:p-8 flex flex-col space-y-6">
        {/* Subtle Ambient Glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#1DB954]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1DB954]/15 border border-[#1DB954]/30 text-[#1DB954] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-xl">insights</span>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Your Music Taste &amp; ML Fingerprint
              </h2>
              <p className="text-xs text-neutral-400">
                Learned from sequential listening history ({totalInteractions} interactions recorded)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Dynamic Shift Indicator */}
        <div className="p-4 rounded-xl bg-[#242424] border border-white/5 flex items-start gap-3 relative z-10">
          <div className="p-2 rounded-lg bg-[#1DB954]/15 text-[#1DB954] mt-0.5 shrink-0">
            <span className="material-symbols-outlined text-lg">autorenew</span>
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-[#1DB954] uppercase tracking-wide">
              {shiftDetected ? "Dynamic Preference Shift Active" : "Stable Trajectory Equilibrium"}
            </h4>
            <p className="text-xs text-neutral-300 mt-0.5 leading-relaxed">
              {shiftDetected
                ? `Recent track choices shifted listening vibe (magnitude: ${shiftMagnitude}). Recommendations are dynamically weighting recent mood while honoring your long-term preferences.`
                : "Your listening patterns show harmonic focus balance. Recommendations blend your core acoustic vectors with exploratory gems."}
            </p>
          </div>
        </div>

        {/* 10-D Dimension Breakdown */}
        <div className="space-y-3 relative z-10">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            10-D Acoustic Vector Weights
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
            {dimensions.map((d, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-300 font-medium">{d.dimension}</span>
                  <span className="font-mono text-[#1DB954] font-bold">{Math.round(d.value)}%</span>
                </div>
                <div className="w-full bg-[#242424] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#1DB954] rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(5, d.value))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10 relative z-10">
          <button
            onClick={() => setShowConfirm(true)}
            className="text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            Reset Taste Data
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold text-xs transition-all shadow-md active:scale-95"
          >
            Done
          </button>
        </div>

        {/* Confirm Reset Popup */}
        {showConfirm && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-6 z-20">
            <div className="bg-[#242424] border border-white/10 rounded-2xl p-6 max-w-sm text-center">
              <span className="material-symbols-outlined text-3xl text-red-400 mb-2 block">warning</span>
              <h4 className="text-sm font-bold text-white">Reset Taste Profile?</h4>
              <p className="text-xs text-neutral-400 mt-1">
                This will reset your 10-D ML acoustic vectors back to defaults.
              </p>
              <div className="flex justify-center gap-3 mt-5">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-1.5 rounded-full bg-white/10 text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReset}
                  disabled={resetting}
                  className="px-4 py-1.5 rounded-full bg-red-500 hover:bg-red-600 text-white text-xs font-bold"
                >
                  {resetting ? "Resetting..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
