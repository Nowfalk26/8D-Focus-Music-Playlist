import React, { useState } from "react";
import SpotifySidebar from "./SpotifySidebar";
import SpotifyTopBar from "./SpotifyTopBar";
import SpotifyPlayerBar from "./SpotifyPlayerBar";
import RightSidebarPanel from "./RightSidebarPanel";
import Player360 from "./Player360";
import MobileNowPlayingModal from "./MobileNowPlayingModal";
import MobilePlayQueueModal from "./MobilePlayQueueModal";
import DeviceConnectModal from "./DeviceConnectModal";
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
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const toggleRightPanel = () => setIsRightPanelOpen((prev) => !prev);

  const mobileNavTabs = [
    { id: "home", label: "Dashboard", icon: "dashboard" },
    { id: "search", label: "Browse", icon: "folder_open" },
    { id: "library", label: "Library", icon: "folder_special" },
    { id: "orbit", label: "360° Orbit", icon: "videocam" },
    { id: "milo", label: "Milo AI", icon: "smart_toy", isAction: true, action: () => setShowMiloChat(true) },
  ];

  return (
    <div className="flex flex-col w-screen h-[100dvh] bg-[#0a0a0a] p-2 sm:p-3.5 gap-3 sm:gap-3.5 overflow-hidden text-white font-sans select-none">
      {/* Top Global Navigation Bar */}
      <SpotifyTopBar
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        user={user}
        onLogout={onLogout}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
        onToggleRightPanel={toggleRightPanel}
      />

      {/* Middle Section: 3-Panel Audio Dashboard with 24px-28px Gutters */}
      <div className="flex-1 flex gap-4 lg:gap-6 xl:gap-7 min-h-0 overflow-hidden">
        {/* Panel 1: Left Navigation & Library Sidebar */}
        <SpotifySidebar
          activeTab={activeTab}
          onSelectTab={onSelectTab}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={toggleSidebar}
          onLogout={onLogout}
        />

        {/* Panel 2: Center Main Stage (Hero Banner, Trending Albums, Top Artist) */}
        <div className="flex-1 flex flex-col bg-[#121212] rounded-2xl overflow-hidden shadow-2xl relative border border-[#282828] transition-all duration-300 min-h-0">
          <main className="flex-1 overflow-y-auto no-scrollbar">
            {children}
          </main>
        </div>

        {/* Panel 3: Right Queue & Play List Panel (Persistent on wide screens >1200px) */}
        <div className="hidden xl:flex h-full">
          <RightSidebarPanel onNavigate={onSelectTab} />
        </div>
      </div>

      {/* Slide-over Right Panel Drawer for Tablets & Mobile */}
      {isRightPanelOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm xl:hidden flex justify-end"
          onClick={() => setIsRightPanelOpen(false)}
        >
          <div
            className="w-full max-w-sm h-full p-2 bg-[#0a0d0b]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-full relative">
              <button
                onClick={() => setIsRightPanelOpen(false)}
                className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
              <RightSidebarPanel onNavigate={onSelectTab} />
            </div>
          </div>
        </div>
      )}

      {/* Floating Mini-Player on Mobile / Persistent Player Bar on Desktop */}
      <SpotifyPlayerBar
        onNavigate={onSelectTab}
        onOpenNowPlaying={() => setShowFullPlayer(true)}
        onOpenConnect={() => setIsConnectOpen(true)}
        onOpenQueue={() => setIsRightPanelOpen(true)}
      />

      {/* Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden flex items-center justify-around bg-[#121614] border-t border-white/10 py-2 px-1 shrink-0 z-40 pb-safe shadow-[0_-4px_16px_rgba(0,0,0,0.5)]"
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
                isActive ? "text-[#10b981]" : "text-neutral-400 hover:text-white"
              }`}
            >
              <span
                className={`material-symbols-outlined text-[22px] transition-transform ${
                  isActive ? "text-[#10b981] scale-110" : ""
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

      {/* Mobile Now Playing Screen with Synchronized Lyrics */}
      <MobileNowPlayingModal
        isOpen={showFullPlayer && !show360Visualizer}
        onClose={() => setShowFullPlayer(false)}
        onOpenQueue={() => setIsQueueOpen(true)}
        onOpenConnect={() => setIsConnectOpen(true)}
      />

      {/* Play Queue Sheet / Modal */}
      <MobilePlayQueueModal
        isOpen={isQueueOpen}
        onClose={() => setIsQueueOpen(false)}
      />

      {/* Device Connect Sheet */}
      <DeviceConnectModal
        isOpen={isConnectOpen}
        onClose={() => setIsConnectOpen(false)}
      />

      {/* Optional Full 360 Binaural Orbit 3D Visualizer */}
      {showFullPlayer && show360Visualizer && (
        <Player360 onClose={() => setShow360Visualizer(false)} />
      )}

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
        mode={transitionTargetMode}
        onComplete={handleTransitionComplete}
      />
    </div>
  );
}
