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
        {/* Left: Mobile Toggle & Desktop History Navigation Arrows */}
        <div className="flex items-center gap-2 shrink-0">
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="w-10 h-10 rounded-full md:hidden flex items-center justify-center bg-[#181818] hover:bg-[#222222] text-neutral-300 hover:text-white border border-[#262626] transition-all shrink-0"
              title="Toggle sidebar"
            >
              <span className="material-symbols-outlined text-xl">menu</span>
            </button>
          )}

          {/* Spotify-style Previous / Next History Buttons */}
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="w-8 h-8 rounded-full bg-[#181818] hover:bg-[#222222] text-neutral-400 hover:text-white border border-[#262626] flex items-center justify-center transition-colors"
              title="Go back"
            >
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>
            <button
              type="button"
              onClick={() => window.history.forward()}
              className="w-8 h-8 rounded-full bg-[#181818] hover:bg-[#222222] text-neutral-400 hover:text-white border border-[#262626] flex items-center justify-center transition-colors"
              title="Go forward"
            >
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Center: Spotify-Style Single Horizontal Navigation Group (Circular Home + Wider Search Bar) */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-1 max-w-xl sm:max-w-2xl justify-center mx-auto">
          {/* Circular Home Button */}
          <button
            type="button"
            onClick={() => onSelectTab("home")}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all shrink-0 shadow-sm ${
              activeTab === "home"
                ? "bg-[#282828] text-white ring-1 ring-white/20 shadow-md"
                : "bg-[#181818] hover:bg-[#222222] text-neutral-400 hover:text-white border border-[#262626]"
            }`}
            title="Home"
          >
            <span
              className={`material-symbols-outlined text-2xl ${
                activeTab === "home" ? "text-white" : "text-neutral-400"
              }`}
              style={{ fontVariationSettings: activeTab === "home" ? "'FILL' 1" : "'FILL' 0" }}
            >
              home
            </span>
          </button>

          {/* Wider Search Bar with balanced padding and rounded corners */}
          <div className="relative flex-1 min-w-0">
            <LiveSearchAutocomplete
              variant="topbar"
              className="w-full"
              value={topSearch}
              onChange={setTopSearch}
              onNavigate={onSelectTab}
              placeholder="What do you want to play?"
            />
          </div>
        </div>

        {/* Right Toolbar: Notifications, Settings, Profile Controls neatly aligned */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Notifications Bell */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-10 h-10 rounded-full bg-[#181818] hover:bg-[#222222] border border-[#262626] text-neutral-300 hover:text-white flex items-center justify-center relative transition-colors shadow-sm"
              title="Notifications"
            >
              <span className="material-symbols-outlined text-lg">notifications</span>
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#10b981]" />
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
              className="w-10 h-10 rounded-full bg-[#181818] hover:bg-[#222222] border border-[#262626] text-neutral-300 hover:text-white flex items-center justify-center transition-colors shadow-sm"
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
              className="w-10 h-10 rounded-full bg-[#181818] hover:bg-[#222222] border border-[#262626] text-neutral-300 hover:text-white flex items-center justify-center xl:hidden transition-colors shadow-sm"
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
              className="h-10 flex items-center gap-2.5 p-1 pr-3.5 rounded-full bg-[#181818] hover:bg-[#222222] border border-[#262626] text-left transition-colors shadow-sm"
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
