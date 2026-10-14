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
    { dimension: "Tempo (BPM)", value: 41, color: "from-indigo-500 to-[#4facfe]", shadow: "rgba(79,172,254,0.7)", textCol: "text-[#4facfe]" },
    { dimension: "Acoustic Energy", value: 72, color: "from-purple-500 to-[#f72585]", shadow: "rgba(247,37,133,0.7)", textCol: "text-[#f72585]" },
    { dimension: "Danceability / Rhythm", value: 78, color: "from-blue-600 to-[#4facfe]", shadow: "rgba(79,172,254,0.7)", textCol: "text-[#4facfe]" },
    { dimension: "Valence / Positivity", value: 81, color: "from-amber-600 to-[#f59e0b]", shadow: "rgba(245,158,11,0.7)", textCol: "text-[#f59e0b]" },
    { dimension: "Acousticness", value: 47, color: "from-teal-600 to-teal-400", shadow: "rgba(45,212,191,0.7)", textCol: "text-teal-400" },
    { dimension: "Spectral Brightness", value: 56, color: "from-purple-700 to-[#b026ff]", shadow: "rgba(176,38,255,0.7)", textCol: "text-[#b026ff]" },
    { dimension: "Harmonic Contrast", value: 62, color: "from-cyan-600 to-[#00f2fe]", shadow: "rgba(0,242,254,0.7)", textCol: "text-[#00f2fe]" },
    { dimension: "Binaural Alignment", value: 69, color: "from-violet-600 to-violet-400", shadow: "rgba(167,139,250,0.7)", textCol: "text-violet-400" },
    { dimension: "8D Spatial Depth", value: 85, color: "from-cyan-400 via-sky-400 to-[#00f2fe]", shadow: "rgba(0,242,254,0.9)", textCol: "text-[#00f2fe]", isSpatial: true },
    { dimension: "Calmness / Focus", value: 48, color: "from-emerald-600 to-[#10b981]", shadow: "rgba(16,185,129,0.7)", textCol: "text-[#10b981]" },
  ];

  const dimensions = tasteProfile?.dimensionBreakdown
    ? tasteProfile.dimensionBreakdown.map((d, i) => ({
        ...defaultDimensions[i % defaultDimensions.length],
        dimension: d.dimension,
        value: Math.round(d.value),
      }))
    : defaultDimensions;

  const recentEvents = tasteProfile?.recentInteractions || [
    { title: "Kadhaippoma (8D Audio)", category: "Tamil Melodies 8D", type: "PLAY", score: "+1.2", badgeColor: "purple" },
    { title: "Senjitaley", category: "Tamil Melodies", type: "RECOMMENDATION_CLICK", score: "+1.8", badgeColor: "blue" },
    { title: "Kalyana Vayasu", category: "Tamil High Energy", type: "RECOMMENDATION_CLICK", score: "+1.8", badgeColor: "blue" },
    { title: "Don'u Don'u Don'u", category: "Tamil High Energy", type: "SKIP", score: "-1.2", badgeColor: "coral" },
    { title: "Don'u Don'u Don'u", category: "Tamil High Energy", type: "PLAY", score: "+1.2", badgeColor: "purple" },
    { title: "Bae (8D Binaural)", category: "Tamil Melodies 8D", type: "RECOMMENDATION_CLICK", score: "+1.8", badgeColor: "blue" },
    { title: "Kanna Veesi (8D Panning)", category: "Tamil Indie & Creators 8D", type: "COMPLETED", score: "+2", badgeColor: "emerald" },
  ];

  const shiftDetected = tasteProfile?.lastShiftDetected;
  const shiftMagnitude = tasteProfile?.shiftMagnitude || 0.67;
  const totalInteractions = tasteProfile?.totalInteractions || 36;

  return (
    <div className="w-full flex flex-col space-y-6 pb-28 text-slate-200 font-sans">
      {/* Section Title & Meta Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-400 to-[#b026ff] p-0.5 flex items-center justify-center shadow-glow-cyan">
            <div className="w-full h-full bg-[#0a0a14] rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-[#00f2fe]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
            </div>
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#00f2fe] font-semibold">
              MACHINE LEARNING MODEL
            </span>
            <h2 className="text-2xl font-display font-extrabold text-white tracking-tight">
              Your Music Taste Profile
            </h2>
          </div>
        </div>

        {/* Telemetry Count Badge */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#131322] border border-[#00f2fe]/40 text-[#00f2fe] font-mono text-xs shadow-sm self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-[#00f2fe] animate-ping"></span>
          <span>{totalInteractions} Interactions Processed</span>
        </div>
      </div>

      {/* Dynamic Shift Alert Card from Stitch */}
      <section className="glass-panel-glow rounded-2xl p-5 relative overflow-hidden border border-[#00f2fe]/30 bg-gradient-to-r from-[#120b22]/90 via-[#0a0a14]/90 to-[#0c1428]/90">
        <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-[#00f2fe]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-[#00f2fe]/10 border border-[#00f2fe]/30 text-[#00f2fe] mt-0.5 shrink-0">
            <svg
              className={`w-5 h-5 ${shiftDetected ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              style={{ animationDuration: "9s" }}
              viewBox="0 0 24 24"
            >
              <path
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              ></path>
            </svg>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-display font-bold text-sm tracking-wide text-[#00f2fe]">
                {shiftDetected ? "DYNAMIC PREFERENCE SHIFT DETECTED!" : "STABLE FOCUS TRAJECTORY EQUILIBRIUM"}
              </h3>
              <span className="font-mono text-xs text-white bg-[#131322] px-2.5 py-0.5 rounded border border-[#00f2fe]/30 font-semibold">
                SHIFT MAGNITUDE: {shiftMagnitude}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans pt-0.5">
              {shiftDetected
                ? "The model recognized that your latest selection departs from prior tracks (e.g. switching from high-energy crunch tracks to a calm acoustic/rain melody). The engine has boosted short-term recency weighting (85%) to immediately adapt recommendations to your new mood direction, while preserving foundational long-term preferences."
                : "Your sequential listening patterns demonstrate harmonic consistency. The dual-horizon ML model maintains an optimal 60/40 balance between core acoustic affinity and subtle adaptive exploratory discovery."}
            </p>
          </div>
        </div>
      </section>

      {/* Acoustic Feature Fingerprint Matrix */}
      <section className="glass-panel-stitch rounded-2xl p-6 border border-white/5 shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-3 gap-2">
          <div>
            <h3 className="text-base font-display font-bold text-white tracking-wide">
              Acoustic Feature Fingerprint (10-Dimensional Vector)
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Real-time weights mapped from audio neural embeddings and binaural spatial analysis
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-400 bg-[#131322] px-2.5 py-1 rounded border border-white/5 self-start sm:self-auto">
            Digital Signal Processing Normalized
          </span>
        </div>

        {/* 10-Dimensional Vector Telemetry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4 pt-1">
          {dimensions.map((m, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-slate-200 flex items-center gap-1.5">
                  {m.dimension}
                  {m.isSpatial && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00f2fe] animate-pulse"></span>
                  )}
                </span>
                <span className={`font-mono font-bold ${m.textCol}`}>{m.value}%</span>
              </div>
              <div className="w-full bg-[#131322] h-2 rounded-full overflow-hidden p-0.5 border border-white/5">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${m.color}`}
                  style={{
                    width: `${m.value}%`,
                    boxShadow: `0 0 12px ${m.shadow}`,
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Selection Sequence & Learning Event Log */}
      <section className="glass-panel-stitch rounded-2xl p-6 border border-white/5 shadow-2xl space-y-4">
        <div className="border-b border-white/5 pb-3">
          <h3 className="text-base font-display font-bold text-white tracking-wide">
            Selection Sequence & Learning Event Log
          </h3>
          <p className="text-xs text-slate-400">
            Chronological sequence of songs played, skipped, and favorited that trained this model profile:
          </p>
        </div>

        {/* Event Log Table */}
        <div className="space-y-2 font-mono text-xs">
          {recentEvents.map((evt, idx) => {
            const badgeStyles = {
              purple: "bg-purple-950/80 text-[#b026ff] border-[#b026ff]/50",
              blue: "bg-blue-950/80 text-[#4facfe] border-[#4facfe]/50",
              coral: "bg-rose-950/80 text-[#f43f5e] border-[#f43f5e]/50",
              emerald: "bg-emerald-950/80 text-[#10b981] border-[#10b981]/50",
            };
            const currentBadge = badgeStyles[evt.badgeColor] || badgeStyles.purple;

            return (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#0a0a14] hover:bg-[#131322] border border-white/5 transition-colors"
              >
                <div className="flex items-center gap-3 truncate pr-2">
                  <span className="text-[#b026ff] font-bold">#{idx + 1}</span>
                  <span className="font-sans font-semibold text-white truncate">{evt.title}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#131322] text-slate-400 border border-white/5 font-sans truncate hidden sm:inline">
                    {evt.category}
                  </span>
                </div>
                <div className="shrink-0">
                  <span
                    className={`px-2.5 py-1 rounded border font-bold tracking-wider text-[11px] ${currentBadge}`}
                  >
                    {evt.type} ({evt.score})
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Reset Action Footer */}
        <div className="mt-6 pt-4 border-t border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-semibold text-white">Reset Learned Musical Preferences</h4>
            <p className="text-[11px] text-slate-400">
              Clears your sequential listening trajectory and restores the recommendation engine to neutral cold-start priors.
            </p>
          </div>
          {showConfirm ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                disabled={resetting}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold transition-all shadow-md"
              >
                {resetting ? "Resetting..." : "Confirm Reset"}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="px-3 py-2 rounded-lg bg-[#1b1b30] hover:bg-[#252542] text-slate-300 font-mono text-xs transition-all"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirm(true)}
              className="px-4 py-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 hover:text-red-100 border border-red-700/50 hover:border-red-500 font-mono text-xs font-semibold tracking-wide transition-all shadow-sm flex items-center gap-2"
            >
              <svg className="w-3.5 h-3.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                ></path>
              </svg>
              <span>Clear History & Reset</span>
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
