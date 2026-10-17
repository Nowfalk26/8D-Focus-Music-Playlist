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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  const mobileNavTabs = [
    { id: "home", label: "Home", icon: "home" },
    { id: "search", label: "Search", icon: "search" },
    { id: "library", label: "Library", icon: "library_music" },
    { id: "orbit", label: "360° Orbit", icon: "spatial_audio_off" },
    { id: "milo", label: "Milo AI", icon: "smart_toy", isAction: true, action: () => setShowMiloChat(true) },
  ];

  return (
    <div className="flex flex-col w-screen h-[100dvh] bg-[#000000] p-1.5 sm:p-2.5 gap-1.5 sm:gap-2.5 overflow-hidden text-white font-sans select-none">
      {/* Top Global Navigation Bar (Spanning across top with Image 2 search bar) */}
      <SpotifyTopBar
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        user={user}
        onLogout={onLogout}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
      />

      {/* Middle Section: Floating Left Sidebar Card + Floating Main Content Card */}
      <div className="flex-1 flex gap-2 sm:gap-2.5 min-h-0 overflow-hidden">
        {/* Left Card: Spotify Sidebar (Black Rounded Square Shape) */}
        <SpotifySidebar
          activeTab={activeTab}
          onSelectTab={onSelectTab}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={toggleSidebar}
        />

        {/* Center Card: Main Stage (Black Rounded Square Shape containing all UI options) */}
        <div className="flex-1 flex flex-col bg-[#121212] rounded-2xl overflow-hidden shadow-2xl relative border border-white/10 transition-all duration-300 min-h-0">
          {/* Main Scrollable View Area: all UI design & options are inside this black card */}
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
