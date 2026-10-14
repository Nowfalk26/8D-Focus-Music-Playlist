import React from "react";
import SpotifySidebar from "./SpotifySidebar";
import SpotifyTopBar from "./SpotifyTopBar";
import SpotifyPlayerBar from "./SpotifyPlayerBar";
import Player360 from "./Player360";
import ScreenCatPet from "./ScreenCatPet";
import AudioModeSelector from "./AudioModeSelector";
import ModeTransitionOverlay from "./ModeTransitionOverlay";
import { usePlayer } from "../context/PlayerContext";

export default function Layout({ activeTab, onSelectTab, user, onLogout, children }) {
  const {
    showFullPlayer,
    audioMode,
    switchAudioMode,
    isModeSelectorOpen,
    closeModeSelector,
    isTransitioningMode,
    transitionTargetMode,
    isSwitchingLocked,
    handleTransitionComplete,
  } = usePlayer();

  const mobileNavTabs = [
    { id: "home", label: "Home", icon: "home" },
    { id: "library", label: "Search", icon: "search" },
    { id: "orbit", label: "360° Orbit", icon: "spatial_audio_off" },
    { id: "taste", label: "Taste DNA", icon: "insights" },
    { id: "studio", label: "8D Studio", icon: "tune" },
  ];

  return (
    <div className="flex flex-col w-screen h-[100dvh] bg-[#000000] p-1 sm:p-2 gap-1.5 sm:gap-2 overflow-hidden text-white font-sans select-none">
      {/* Upper Section: Spotify Sidebar + Main Content Window */}
      <div className="flex-1 flex gap-2 min-h-0 overflow-hidden">
        {/* Spotify Sidebar (Left Navigation & Your Library Dock) */}
        <SpotifySidebar activeTab={activeTab} onSelectTab={onSelectTab} />

        {/* Spotify Center Window (Main Stage & Views) */}
        <div className="flex-1 flex flex-col bg-[#121212] rounded-lg overflow-hidden shadow-2xl relative border border-white/5">
          {/* Top Sticky Bar with Back/Forward, Search, Mode Pill, Profile */}
          <SpotifyTopBar
            activeTab={activeTab}
            onSelectTab={onSelectTab}
            user={user}
            onLogout={onLogout}
          />

          {/* Main Scrollable View Area */}
          <main className="flex-1 overflow-y-auto no-scrollbar">
            {children}
          </main>
        </div>
      </div>

      {/* Bottom: Spotify Persistent Player Bar */}
      <SpotifyPlayerBar onNavigate={onSelectTab} />

      {/* Mobile Bottom Navigation Bar (Spotify mobile style) */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden flex items-center justify-around bg-[#121212] border-t border-white/10 py-1.5 px-2 shrink-0 z-40 rounded-t-lg"
      >
        {mobileNavTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-all ${
                isActive ? "text-[#00f2fe]" : "text-neutral-400 hover:text-white"
              }`}
            >
              <span className={`material-symbols-outlined text-xl ${isActive ? "text-[#00f2fe] scale-110" : ""}`}>
                {tab.icon}
              </span>
              <span className="text-[10px] font-medium leading-none tracking-tight">
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Full 360 Binaural Orbit Player Modal */}
      {showFullPlayer && <Player360 />}

      {/* Screen Cat Pet - Walks freely across the screen */}
      <ScreenCatPet />

      {/* Audio Universe Mode Selector Modal */}
      <AudioModeSelector
        isOpen={isModeSelectorOpen}
        currentMode={audioMode}
        onSelectMode={switchAudioMode}
        onClose={closeModeSelector}
        canClose={Boolean(audioMode)}
        isLocked={isSwitchingLocked}
      />

      {/* Cinematic Mode Transition Overlay */}
      <ModeTransitionOverlay
        isOpen={isTransitioningMode}
        targetMode={transitionTargetMode || audioMode || "8d"}
        onComplete={handleTransitionComplete}
      />
    </div>
  );
}
