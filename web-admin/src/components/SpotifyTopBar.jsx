import React, { useState } from "react";
import { usePlayer } from "../context/PlayerContext";
import LiveSearchAutocomplete from "./LiveSearchAutocomplete";

export default function SpotifyTopBar({
  activeTab,
  onSelectTab,
  user,
  onLogout,
  isSidebarOpen,
  onToggleSidebar,
  onToggleRightPanel,
}) {
  const { audioMode, openModeSelector, setShowMiloChat } = usePlayer();
  const [topSearch, setTopSearch] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="w-full z-30 select-none shrink-0 px-2 sm:px-4 py-2">
      <div className="flex items-center justify-between gap-3 min-h-[48px]">
        {/* Left: Sidebar Toggle (on mobile / smaller screens) + Search Bar */}
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="w-9 h-9 rounded-xl md:hidden flex items-center justify-center bg-[#181818] hover:bg-[#222222] text-neutral-300 hover:text-white border border-[#262626] transition-all shrink-0"
              title="Toggle sidebar"
            >
              <span className="material-symbols-outlined text-xl">menu</span>
            </button>
          )}

          {/* Search Input matching GreenWave screenshot */}
          <div className="relative flex-1">
            <LiveSearchAutocomplete
              variant="topbar"
              className="w-full"
              value={topSearch}
              onChange={setTopSearch}
              onNavigate={onSelectTab}
              placeholder="Search your Song"
            />
          </div>
        </div>

        {/* Right Toolbar: Notifications, Settings, User Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Notifications Bell */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-9 h-9 rounded-full bg-[#181818] hover:bg-[#222222] border border-[#262626] text-neutral-300 hover:text-white flex items-center justify-center relative transition-colors"
              title="Notifications"
            >
              <span className="material-symbols-outlined text-lg">notifications</span>
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#10b981]" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-[#181818] border border-[#262626] rounded-2xl p-4 shadow-2xl z-50 animate-fadeIn">
                <div className="flex items-center justify-between pb-2 border-b border-[#262626]">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Notifications
                  </h4>
                  <span className="text-[10px] text-[#10b981] font-semibold">1 New</span>
                </div>
                <div className="space-y-2 pt-2">
                  <div className="p-2.5 rounded-xl bg-white/5 text-xs">
                    <p className="font-bold text-white">✨ 8D Spatial Audio Engine</p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      3-Panel GreenWave layout with synchronized binaural audio is active.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Settings Gear */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className="w-9 h-9 rounded-full bg-[#181818] hover:bg-[#222222] border border-[#262626] text-neutral-300 hover:text-white flex items-center justify-center transition-colors"
              title="Settings"
            >
              <span className="material-symbols-outlined text-lg">settings</span>
            </button>

            {showSettings && (
              <div className="absolute right-0 mt-2 w-56 bg-[#181818] border border-[#262626] rounded-2xl p-3 shadow-2xl z-50 animate-fadeIn space-y-1">
                <button
                  onClick={() => {
                    setShowSettings(false);
                    openModeSelector();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-neutral-200 hover:text-white hover:bg-white/5 flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-cyan-400">graphic_eq</span>
                    <span>Audio Universe</span>
                  </span>
                  <span className="text-[10px] font-mono text-[#10b981]">{audioMode?.toUpperCase()}</span>
                </button>
                <button
                  onClick={() => {
                    setShowSettings(false);
                    setShowMiloChat(true);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-neutral-200 hover:text-white hover:bg-white/5 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base text-purple-400">smart_toy</span>
                  <span>Milo AI Assistant</span>
                </button>
              </div>
            )}
          </div>

          {/* Right Panel Toggle (for tablet/desktop) */}
          {onToggleRightPanel && (
            <button
              type="button"
              onClick={onToggleRightPanel}
              className="w-9 h-9 rounded-full bg-[#181818] hover:bg-[#222222] border border-[#262626] text-neutral-300 hover:text-white flex items-center justify-center xl:hidden transition-colors"
              title="Toggle Playlist & Player"
            >
              <span className="material-symbols-outlined text-lg">queue_music</span>
            </button>
          )}

          {/* User Profile Pill matching screenshot "Robbi Darwis @Robbi001" */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2.5 p-1 pr-3 rounded-full bg-[#181818] hover:bg-[#222222] border border-[#262626] text-left transition-colors"
            >
              <img
                src={
                  user?.avatar ||
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80"
                }
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover border border-[#10b981]/40"
              />
              <div className="hidden sm:flex flex-col">
                <span className="text-xs font-bold text-white leading-tight">
                  {user?.name || "Robbi Darwis"}
                </span>
                <span className="text-[10px] text-neutral-400 font-mono leading-tight">
                  {user?.handle || "@Robbi001"}
                </span>
              </div>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-[#181818] border border-[#262626] rounded-2xl p-2 shadow-2xl z-50 animate-fadeIn">
                <div className="px-3 py-2 border-b border-[#262626]">
                  <p className="text-xs font-bold text-white truncate">
                    {user?.name || "Robbi Darwis"}
                  </p>
                  <p className="text-[10px] text-neutral-400 font-mono">
                    {user?.handle || "@Robbi001"}
                  </p>
                </div>
                <div className="pt-1 space-y-0.5">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onSelectTab("taste");
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-neutral-200 hover:text-white hover:bg-white/5 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">insights</span>
                    <span>Music Taste DNA</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onSelectTab("library", "Favorites");
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-neutral-200 hover:text-white hover:bg-white/5 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">favorite</span>
                    <span>Liked Songs</span>
                  </button>
                  {onLogout && (
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onLogout();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 border-t border-white/5 mt-1 pt-2"
                    >
                      <span className="material-symbols-outlined text-sm">logout</span>
                      <span>Log out</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
