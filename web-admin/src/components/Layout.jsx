import React, { useState } from "react";
import SpotifySidebar from "./SpotifySidebar";
import SpotifyTopBar from "./SpotifyTopBar";
import SpotifyPlayerBar from "./SpotifyPlayerBar";
import Player360 from "./Player360";
import MobileNowPlayingModal from "./MobileNowPlayingModal";
import MobilePlayQueueModal from "./MobilePlayQueueModal";
import DeviceConnectModal from "./DeviceConnectModal";
import ScreenCatPet from "./ScreenCatPet";
import AudioModeSelector from "./AudioModeSelector";
import ModeTransitionOverlay from "./ModeTransitionOverlay";
import MiloCatChat from "./MiloCatChat";
import { usePlayer } from "../context/PlayerContext";

export default function Layout({ activeTab, onSelectTab, user, onLogout, children }) {
  const {
    showFullPlayer,
    setShowFullPlayer,
    audioMode,
    switchAudioMode,
    isModeSelectorOpen,
    closeModeSelector,
    isTransitioningMode,
    transitionTargetMode,
    isSwitchingLocked,
    handleTransitionComplete,
    showMiloChat,
    setShowMiloChat,
  } = usePlayer();

  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [show360Visualizer, setShow360Visualizer] = useState(false);

  const mobileNavTabs = [
    { id: "home", label: "Home", icon: "home" },
    { id: "library", label: "Search", icon: "search" },
    { id: "orbit", label: "360° Orbit", icon: "spatial_audio_off" },
    { id: "queue", label: "Queue", icon: "queue_music", isAction: true, action: () => setIsQueueOpen(true) },
    { id: "milo", label: "Milo AI", icon: "smart_toy", isAction: true, action: () => setShowMiloChat(true) },
  ];

  return (
    <div className="flex flex-col w-screen h-[100dvh] bg-[#000000] p-0 sm:p-2 gap-0 sm:gap-2 overflow-hidden text-white font-sans select-none">
      {/* Upper Section: Spotify Sidebar + Main Content Stage */}
      <div className="flex-1 flex gap-2 min-h-0 overflow-hidden">
        {/* Spotify Sidebar (Left Navigation & Your Library Dock on Desktop) */}
        <SpotifySidebar activeTab={activeTab} onSelectTab={onSelectTab} />

        {/* Spotify Main Content Window */}
        <div className="flex-1 flex flex-col bg-[#121212] sm:rounded-lg overflow-hidden shadow-2xl relative border-0 sm:border border-white/5">
          {/* Top Sticky Bar with History, Search, Mode Pill, Profile */}
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

      {/* Floating Mini-Player on Mobile / Persistent Player Bar on Desktop */}
      <SpotifyPlayerBar
        onNavigate={onSelectTab}
        onOpenNowPlaying={() => setShowFullPlayer(true)}
        onOpenConnect={() => setIsConnectOpen(true)}
        onOpenQueue={() => setIsQueueOpen(true)}
      />

      {/* Mobile Bottom Navigation Bar (Stitch Spotify Android UX) */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden flex items-center justify-around bg-[#121212] border-t border-white/10 py-2 px-1 shrink-0 z-40 pb-safe shadow-[0_-4px_16px_rgba(0,0,0,0.5)]"
      >
        {mobileNavTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.isAction) {
                  tab.action();
                } else {
                  onSelectTab(tab.id);
                }
              }}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-all active:scale-95 ${
                isActive ? "text-[#1DB954]" : "text-neutral-400 hover:text-white"
              }`}
            >
              <span
                className={`material-symbols-outlined text-[22px] transition-transform ${
                  isActive ? "text-[#1DB954] scale-110" : ""
                }`}
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {tab.icon}
              </span>
              <span className={`text-[10px] font-semibold leading-tight tracking-tight ${isActive ? "text-white" : ""}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Mobile Now Playing Screen with Synchronized Lyrics (Stitch screen f9bc52519fb44d55834c9cd09d26d5de) */}
      <MobileNowPlayingModal
        isOpen={showFullPlayer && !show360Visualizer}
        onClose={() => setShowFullPlayer(false)}
        onOpenQueue={() => setIsQueueOpen(true)}
        onOpenConnect={() => setIsConnectOpen(true)}
      />

      {/* Play Queue Sheet / Modal (Stitch screen 73f2302eb0084120899787808af30392) */}
      <MobilePlayQueueModal
        isOpen={isQueueOpen}
        onClose={() => setIsQueueOpen(false)}
      />

      {/* Device Connect Sheet (Stitch screen 1a3e166d80e94ff2b3adf09a8875ae1e) */}
      <DeviceConnectModal
        isOpen={isConnectOpen}
        onClose={() => setIsConnectOpen(false)}
      />

      {/* Optional Full 360 Binaural Orbit 3D Visualizer */}
      {showFullPlayer && show360Visualizer && (
        <Player360 onClose={() => setShow360Visualizer(false)} />
      )}

      {/* Screen Cat Pet */}
      <ScreenCatPet />

      {/* Milo AI Assistant Chat Modal */}
      {showMiloChat && <MiloCatChat onClose={() => setShowMiloChat(false)} />}

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
