import React, { useState } from "react";
import { usePlayer } from "../context/PlayerContext";

export default function TasteProfileScreen() {
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

  const defaultDimensions = [
    { dimension: "Tempo (BPM)", value: 41, color: "from-blue-600 to-[#1DB954]", shadow: "rgba(29,185,84,0.5)", textCol: "text-[#1DB954]" },
    { dimension: "Acoustic Energy", value: 72, color: "from-emerald-500 to-[#1DB954]", shadow: "rgba(29,185,84,0.5)", textCol: "text-[#1DB954]" },
    { dimension: "Danceability / Rhythm", value: 78, color: "from-teal-500 to-cyan-400", shadow: "rgba(0,242,254,0.5)", textCol: "text-cyan-400" },
    { dimension: "Valence / Positivity", value: 81, color: "from-amber-500 to-yellow-400", shadow: "rgba(245,158,11,0.5)", textCol: "text-amber-400" },
    { dimension: "Acousticness", value: 47, color: "from-teal-600 to-teal-400", shadow: "rgba(45,212,191,0.5)", textCol: "text-teal-400" },
    { dimension: "Spectral Brightness", value: 56, color: "from-purple-600 to-pink-500", shadow: "rgba(176,38,255,0.5)", textCol: "text-purple-400" },
    { dimension: "Harmonic Contrast", value: 62, color: "from-cyan-600 to-[#00f2fe]", shadow: "rgba(0,242,254,0.5)", textCol: "text-[#00f2fe]" },
    { dimension: "Binaural Alignment", value: 69, color: "from-violet-600 to-violet-400", shadow: "rgba(167,139,250,0.5)", textCol: "text-violet-400" },
    { dimension: "8D Spatial Depth", value: 85, color: "from-[#1DB954] via-cyan-400 to-[#00f2fe]", shadow: "rgba(29,185,84,0.6)", textCol: "text-[#1DB954]", isSpatial: true },
    { dimension: "Calmness / Focus", value: 48, color: "from-emerald-600 to-[#10b981]", shadow: "rgba(16,185,129,0.5)", textCol: "text-[#10b981]" },
  ];

  const dimensions = tasteProfile?.dimensionBreakdown
    ? tasteProfile.dimensionBreakdown.map((d, i) => ({
        ...defaultDimensions[i % defaultDimensions.length],
        dimension: d.dimension,
        value: Math.round(d.value),
      }))
    : defaultDimensions;

  const recentEvents = tasteProfile?.recentInteractions || [
    { title: "Kadhaippoma (8D Audio)", category: "Tamil Melodies 8D", type: "PLAY", score: "+1.2", badgeColor: "emerald" },
    { title: "Senjitaley", category: "Tamil Melodies", type: "RECOMMENDATION_CLICK", score: "+1.8", badgeColor: "blue" },
    { title: "Kalyana Vayasu", category: "Tamil High Energy", type: "RECOMMENDATION_CLICK", score: "+1.8", badgeColor: "blue" },
    { title: "Don'u Don'u Don'u", category: "Tamil High Energy", type: "SKIP", score: "-1.2", badgeColor: "coral" },
    { title: "Don'u Don'u Don'u", category: "Tamil High Energy", type: "PLAY", score: "+1.2", badgeColor: "emerald" },
    { title: "Bae (8D Binaural)", category: "Tamil Melodies 8D", type: "RECOMMENDATION_CLICK", score: "+1.8", badgeColor: "blue" },
    { title: "Kanna Veesi (8D Panning)", category: "Tamil Indie & Creators 8D", type: "COMPLETED", score: "+2.0", badgeColor: "emerald" },
  ];

  const shiftDetected = tasteProfile?.lastShiftDetected;
  const shiftMagnitude = tasteProfile?.shiftMagnitude || 0.67;
  const totalInteractions = tasteProfile?.totalInteractions || 36;

  return (
    <div className="w-full flex flex-col font-sans text-neutral-200 select-none p-4 sm:p-6 lg:p-8 space-y-6 pb-32 max-w-[1700px] mx-auto">
      {/* Section Title & Meta Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-5 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#1DB954]/15 text-[#1DB954] flex items-center justify-center shrink-0 border border-[#1DB954]/25 shadow-md">
            <span className="material-symbols-outlined text-3xl">insights</span>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1DB954] font-mono block">
              Machine Learning Vector Space
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
              Music Taste DNA
            </h1>
          </div>
        </div>

        {/* Telemetry Count Badge */}
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#181818] border border-white/10 text-[#1DB954] font-mono text-xs shadow-sm self-start sm:self-auto leading-none">
          <span className="w-2 h-2 rounded-full bg-[#1DB954] animate-ping" />
          <span className="font-semibold">{totalInteractions} Interactions Processed</span>
        </div>
      </div>

      {/* Dynamic Shift Alert Card */}
      <section className="bg-[#181818] border border-white/10 rounded-2xl p-6 sm:p-7 relative overflow-hidden shadow-lg">
        <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-[#1DB954]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-start gap-4 sm:gap-5">
          <div className="p-3 rounded-xl bg-[#1DB954]/15 border border-[#1DB954]/30 text-[#1DB954] shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-2xl">autorenew</span>
          </div>
          <div className="space-y-3 min-w-0 flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="font-bold text-sm sm:text-base text-[#1DB954] tracking-wide leading-normal">
                {shiftDetected ? "DYNAMIC PREFERENCE SHIFT DETECTED!" : "STABLE FOCUS TRAJECTORY EQUILIBRIUM"}
              </h3>
              <span className="font-mono text-[11px] text-white bg-black/60 px-2.5 py-1 rounded-md border border-white/10 font-bold tracking-wider">
                MAGNITUDE: {shiftMagnitude}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed sm:leading-loose">
              {shiftDetected
                ? "The model recognized that your latest selection departs from prior tracks (e.g. switching from energetic rhythm to calm melody). Short-term recency weighting (85%) has adapted recommendations to your new mood direction, while preserving foundational preferences."
                : "Your sequential listening patterns demonstrate harmonic consistency. The dual-horizon ML model maintains an optimal 60/40 balance between core acoustic affinity and subtle adaptive exploratory discovery."}
            </p>
          </div>
        </div>
      </section>

      {/* Acoustic Feature Fingerprint Matrix */}
      <section className="bg-[#181818] border border-white/5 rounded-2xl p-6 sm:p-8 shadow-lg space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 gap-3">
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
              Acoustic Feature Fingerprint (10-Dimensional Vector)
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 font-mono leading-normal">
              Real-time weights mapped from audio neural embeddings and binaural spatial analysis
            </p>
          </div>
          <span className="text-xs font-mono text-neutral-300 bg-[#242424] px-3.5 py-1.5 rounded-full border border-white/5 self-start sm:self-auto leading-none">
            DSP Normalized
          </span>
        </div>

        {/* 10-Dimensional Vector Telemetry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-7 sm:gap-y-8 pt-3 pb-2">
          {dimensions.map((m, idx) => (
            <div key={idx} className="space-y-2.5">
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className="font-semibold text-neutral-200 flex items-center gap-2">
                  {m.dimension}
                  {m.isSpatial && (
                    <span className="w-2 h-2 rounded-full bg-[#1DB954] animate-pulse" />
                  )}
                </span>
                <span className={`font-mono font-bold ${m.textCol}`}>{m.value}%</span>
              </div>
              <div className="w-full bg-[#242424] h-2.5 rounded-full overflow-hidden p-0.5 border border-white/5">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${m.color} transition-all duration-500`}
                  style={{
                    width: `${m.value}%`,
                    boxShadow: `0 0 10px ${m.shadow}`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Selection Sequence & Learning Event Log */}
      <section className="bg-[#181818] border border-white/5 rounded-2xl p-6 sm:p-8 shadow-lg space-y-6">
        <div className="border-b border-white/10 pb-4 space-y-1">
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
            Selection Sequence &amp; Learning Event Log
          </h3>
          <p className="text-xs sm:text-sm text-neutral-400 leading-normal">
            Chronological sequence of tracks played, skipped, and favorited that trained this model profile:
          </p>
        </div>

        {/* Event Log Table */}
        <div className="space-y-3 font-mono text-xs">
          {recentEvents.map((evt, idx) => {
            const badgeStyles = {
              emerald: "bg-[#1DB954]/15 text-[#1DB954] border-[#1DB954]/30",
              blue: "bg-blue-500/15 text-blue-400 border-blue-500/30",
              coral: "bg-red-500/15 text-red-400 border-red-500/30",
            }[evt.badgeColor] || "bg-white/10 text-neutral-300 border-white/10";

            return (
              <div
                key={idx}
                className="p-3.5 sm:p-4 rounded-xl bg-[#242424] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-white/15 transition-all shadow-sm"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className="w-6 text-neutral-500 text-center font-bold text-xs">{idx + 1}</span>
                  <div className="min-w-0 space-y-1">
                    <p className="text-white font-sans font-bold text-xs sm:text-sm truncate leading-snug">{evt.title}</p>
                    <p className="text-neutral-400 text-[11px] sm:text-xs truncate leading-normal">{evt.category}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 shrink-0 self-end sm:self-auto">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border leading-none ${badgeStyles}`}>
                    {evt.type}
                  </span>
                  <span
                    className={`font-bold text-xs sm:text-sm ${
                      evt.score.startsWith("+") ? "text-[#1DB954]" : "text-red-400"
                    }`}
                  >
                    {evt.score}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Model Reset Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 sm:p-7 rounded-2xl bg-[#181818] border border-white/5 gap-4">
        <div className="space-y-1">
          <h4 className="text-sm sm:text-base font-bold text-white leading-snug">Reset Neural Taste Profile</h4>
          <p className="text-xs sm:text-sm text-neutral-400 leading-normal">Clear interaction history and re-calibrate from scratch</p>
        </div>
        <button
          onClick={() => setShowConfirm(true)}
          className="px-5 py-2.5 rounded-full bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white text-xs sm:text-sm font-semibold transition-all active:scale-95 border border-red-500/20 self-start sm:self-auto leading-none min-h-[38px] inline-flex items-center justify-center text-center"
        >
          Reset Profile
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="relative w-full max-w-sm bg-[#181818] border border-white/10 rounded-3xl p-6 shadow-2xl text-center select-none">
            <span className="material-symbols-outlined text-4xl text-red-400 mb-2 block">warning</span>
            <h3 className="text-lg font-bold text-white tracking-tight">Reset Taste Profile?</h3>
            <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
              This will reset your 10-D acoustic vector profile back to initial default weights. This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                disabled={resetting}
                className="px-5 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                {resetting ? "Resetting..." : "Confirm Reset"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
