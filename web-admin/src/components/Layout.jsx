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

  return (
    <div className="flex flex-col w-screen h-screen bg-[#000000] p-2 gap-2 overflow-hidden text-white font-sans select-none">
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
