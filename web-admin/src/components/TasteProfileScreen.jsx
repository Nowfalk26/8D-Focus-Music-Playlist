import React, { useState } from "react";
import { usePlayer } from "../context/PlayerContext";

export default function TasteProfileScreen() {
  const { tasteProfile, resetTasteProfile } = usePlayer();
  const [resetting, setResetting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [activeDspMode, setActiveDspMode] = useState("latent"); // 'latent' | 'cluster' | 'drift'

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
    { dimension: "Tempo (BPM)", value: 41, color: "from-blue-600 to-primary-container", textCol: "text-primary-container" },
    { dimension: "Acoustic Energy", value: 72, color: "from-secondary to-primary-container", textCol: "text-primary-container" },
    { dimension: "Danceability / Rhythm", value: 78, color: "from-teal-500 to-secondary", textCol: "text-secondary" },
    { dimension: "Valence / Positivity", value: 81, color: "from-amber-500 to-secondary-fixed", textCol: "text-secondary-fixed" },
    { dimension: "Acousticness", value: 47, color: "from-teal-600 to-tertiary-fixed-dim", textCol: "text-tertiary-fixed-dim" },
    { dimension: "Spectral Brightness", value: 56, color: "from-purple-600 to-tertiary-container", textCol: "text-tertiary-container" },
    { dimension: "Harmonic Contrast", value: 62, color: "from-cyan-600 to-secondary", textCol: "text-secondary" },
    { dimension: "Binaural Alignment", value: 69, color: "from-violet-600 to-secondary", textCol: "text-secondary" },
    { dimension: "8D Spatial Depth", value: 85, color: "from-primary-container via-secondary to-tertiary-fixed-dim", textCol: "text-primary-container", isSpatial: true },
    { dimension: "Calmness / Focus", value: 48, color: "from-emerald-600 to-primary-container", textCol: "text-primary-container" },
  ];

  const dimensions = tasteProfile?.dimensionBreakdown
    ? tasteProfile.dimensionBreakdown.map((d, i) => ({
        ...defaultDimensions[i % defaultDimensions.length],
        dimension: d.dimension,
        value: Math.round(d.value),
      }))
    : defaultDimensions;

  const recentEvents = tasteProfile?.recentInteractions || [
    { title: "Ocean Eyes (8D Audio)", category: "Billie Eilish 8D", type: "PLAY", score: "+1.2", badgeColor: "primary" },
    { title: "No Time to Die", category: "Billie Eilish", type: "RECOMMENDATION_CLICK", score: "+1.8", badgeColor: "secondary" },
    { title: "Lo Vas A Olvidar", category: "Spatial Vocal", type: "RECOMMENDATION_CLICK", score: "+1.8", badgeColor: "secondary" },
    { title: "Six Feet Under", category: "Submerged 8D", type: "PLAY", score: "+1.2", badgeColor: "primary" },
    { title: "Bad Guy (8D Panning)", category: "High Energy 8D", type: "COMPLETED", score: "+2.0", badgeColor: "primary" },
  ];

  const shiftDetected = tasteProfile?.lastShiftDetected;
  const shiftMagnitude = tasteProfile?.shiftMagnitude || 0.67;
  const totalInteractions = tasteProfile?.totalInteractions || 360;

  return (
    <div className="w-full flex flex-col font-sans text-on-surface select-none p-5 sm:p-7 space-y-7 pb-28 max-w-[1400px] mx-auto box-border">
      {/* TOP INTELLIGENCE BANNER & TELEMETRY */}
      <section className="flex flex-col space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-container shadow-sm animate-pulse" />
              <span className="font-label-caps text-xs uppercase tracking-wider text-primary-container font-bold">
                Machine Learning Vector Space
              </span>
              <span className="text-outline/60">•</span>
              <span className="font-label-caps text-xs uppercase tracking-wider text-on-surface-variant font-mono">
                Kernel v4.19-BINAURAL
              </span>
            </div>
            <div className="flex items-center gap-4">
              <h1 className="font-display-hero text-3xl sm:text-4xl text-on-surface tracking-tight font-extrabold">
                Music Taste DNA
              </h1>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high shadow-inner border border-white/5">
                <span className="w-2 h-2 rounded-full bg-secondary-fixed animate-ping" />
                <span className="font-label-caps text-[10px] text-secondary font-mono tracking-widest uppercase font-bold">
                  {totalInteractions} Interactions Processed
                </span>
              </div>
            </div>
          </div>

          {/* Live DSP Mode Selector from Stitch */}
          <div className="flex items-center gap-2 bg-surface-container-low p-1.5 rounded-xl shadow-sm border border-white/5">
            <button
              onClick={() => setActiveDspMode("latent")}
              className={`px-3 py-1.5 rounded-lg font-label-md text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeDspMode === "latent"
                  ? "bg-surface-container-highest text-on-surface shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-sm text-primary-container">memory</span>
              <span>Latent Vector</span>
            </button>
            <button
              onClick={() => setActiveDspMode("cluster")}
              className={`px-3 py-1.5 rounded-lg font-label-md text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeDspMode === "cluster"
                  ? "bg-surface-container-highest text-on-surface shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-sm text-secondary">hub</span>
              <span>Cluster Graph</span>
            </button>
            <button
              onClick={() => setActiveDspMode("drift")}
              className={`px-3 py-1.5 rounded-lg font-label-md text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeDspMode === "drift"
                  ? "bg-surface-container-highest text-on-surface shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-sm text-tertiary-fixed-dim">history_toggle_off</span>
              <span>Drift Analysis</span>
            </button>
          </div>
        </div>

        {/* Acoustic Intelligence Trajectory Card */}
        <div className="relative overflow-hidden rounded-2xl bg-surface-container-low p-6 shadow-xl border border-white/5">
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-primary-container/5 blur-3xl pointer-events-none" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Status & Summary */}
            <div className="lg:col-span-8 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary-container/15 flex items-center justify-center text-primary-container border border-primary-container/30">
                  <span className="material-symbols-outlined text-lg">sync_saved_locally</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-headline-sm text-sm sm:text-base text-on-surface tracking-tight font-bold">
                    {shiftDetected ? "DYNAMIC PREFERENCE SHIFT DETECTED" : "STABLE FOCUS TRAJECTORY EQUILIBRIUM"}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-surface-container-highest text-primary font-mono text-xs font-bold border border-white/5">
                    MAGNITUDE: {shiftMagnitude}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-secondary-container/20 text-secondary font-mono text-xs font-semibold border border-secondary/30">
                    CONFIDENCE 94.2%
                  </span>
                </div>
              </div>
              <p className="font-body-md text-xs sm:text-sm text-on-surface-variant max-w-3xl leading-relaxed">
                {shiftDetected
                  ? "The neural latent model recognized a recent shift in your acoustic orientation toward energetic rhythm and binaural panning. Short-term recency weighting (85%) has adapted recommendations to your new direction while preserving your core sonic identity."
                  : "Your sequential listening patterns demonstrate coherent harmonic consistency with an acoustic orientation toward spatial depth and vocal intimacies. The dual-horizon ML model maintains an optimal 60/40 balance between core acoustic affinity and subtle adaptive exploratory discovery."}
              </p>
            </div>

            {/* Telemetry Chips */}
            <div className="lg:col-span-4 grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-surface-container flex flex-col justify-between border border-white/5">
                <span className="font-label-caps text-[9px] text-outline uppercase font-bold">Vector Cluster</span>
                <span className="font-headline-sm text-base text-primary-container font-bold font-mono mt-1">
                  Cluster Alpha-8
                </span>
                <span className="font-body-sm text-[10px] text-on-surface-variant">Binaural Ambient</span>
              </div>
              <div className="p-3 rounded-xl bg-surface-container flex flex-col justify-between border border-white/5">
                <span className="font-label-caps text-[9px] text-outline uppercase font-bold">Exploration Rate</span>
                <span className="font-headline-sm text-base text-secondary font-bold font-mono mt-1">
                  18.4%
                </span>
                <span className="font-body-sm text-[10px] text-on-surface-variant">Optimal Discovery</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Acoustic Feature Fingerprint Matrix */}
      <section className="bg-surface-container-low border border-white/5 rounded-2xl p-6 sm:p-7 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-4 gap-3">
          <div className="space-y-1">
            <h3 className="font-headline-md text-base sm:text-lg font-bold text-on-surface tracking-tight">
              Acoustic Feature Fingerprint (10-Dimensional Vector)
            </h3>
            <p className="font-body-sm text-xs text-outline font-mono">
              Real-time weights mapped from audio neural embeddings and binaural spatial analysis
            </p>
          </div>
          <span className="font-label-caps text-[10px] text-secondary bg-surface-container px-3 py-1 rounded-full border border-secondary/30 font-bold self-start sm:self-auto">
            DSP Normalized
          </span>
        </div>

        {/* 10-Dimensional Vector Progress Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dimensions.map((dim, idx) => (
            <div
              key={dim.dimension || idx}
              className={`p-3.5 rounded-xl bg-surface-container border transition-all ${
                dim.isSpatial
                  ? "border-primary-container/40 shadow-[0_0_12px_rgba(0,245,155,0.15)]"
                  : "border-white/5"
              }`}
            >
              <div className="flex items-center justify-between font-label-md text-xs mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-on-surface font-semibold">{dim.dimension}</span>
                  {dim.isSpatial && (
                    <span className="px-1.5 py-0.2 rounded bg-primary-container/20 text-primary-container font-label-caps text-[8px] font-bold">
                      PRO 8D
                    </span>
                  )}
                </div>
                <span className={`font-mono font-bold ${dim.textCol}`}>{dim.value}%</span>
              </div>
              <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${dim.color} rounded-full transition-all duration-500`}
                  style={{ width: `${dim.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Interactions & Calibration Events */}
      <section className="bg-surface-container-low border border-white/5 rounded-2xl p-6 sm:p-7 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-xl">sensors</span>
            <h3 className="font-headline-sm text-base font-bold text-on-surface">
              Recent Interactions & Neural Weight Shifts
            </h3>
          </div>
          <button
            onClick={() => setShowConfirm(true)}
            className="px-3.5 py-1.5 rounded-full bg-surface-container hover:bg-surface-bright text-error font-label-md text-xs border border-error/30 transition-all cursor-pointer"
          >
            Reset DNA Model
          </button>
        </div>

        <div className="space-y-1.5">
          {recentEvents.map((evt, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container hover:bg-surface-bright transition-colors border border-white/5"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-2 h-2 rounded-full bg-primary-container" />
                <div className="flex flex-col min-w-0">
                  <span className="font-label-md text-xs text-on-surface truncate font-semibold">
                    {evt.title}
                  </span>
                  <span className="font-body-sm text-[10px] text-outline truncate">{evt.category}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-label-caps text-[9px] px-2 py-0.5 rounded bg-surface-container-highest text-on-surface-variant font-mono font-bold">
                  {evt.type}
                </span>
                <span className="font-mono text-xs font-bold text-primary-container">{evt.score}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Confirmation Modal for Reset */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-surface-container-low border border-white/10 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-headline-md text-lg font-bold text-on-surface">Reset Music Taste DNA?</h3>
            <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">
              This will clear the accumulated 10-dimensional acoustic vector and restart the Bayesian preference learning algorithm from default factory priors.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-1.5 rounded-full bg-surface-container hover:bg-surface-bright text-xs text-on-surface cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                disabled={resetting}
                className="px-4 py-1.5 rounded-full bg-error text-on-error font-bold text-xs shadow-md hover:opacity-90 cursor-pointer"
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
