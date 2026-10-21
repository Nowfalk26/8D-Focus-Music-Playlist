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
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const categories = [
    { id: "all", label: "All", tab: "home" },
    { id: "music", label: "Music", tab: "home" },
    { id: "podcasts", label: "Podcasts", tab: "home" },
    { id: "spatial", label: "Spatial 8D", tab: "orbit" },
  ];

  return (
    <header className="w-full z-30 select-none shrink-0 px-3 sm:px-4 py-2 bg-surface/90 backdrop-blur-xl border-b border-white/5 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between gap-3 min-h-[48px] max-w-full">
        {/* Left: Mobile Sidebar Toggle & History Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="w-9 h-9 rounded-full md:hidden flex items-center justify-center bg-surface-container-high hover:bg-surface-bright text-on-surface-variant hover:text-on-surface transition-all shrink-0"
              title="Toggle sidebar"
            >
              <span className="material-symbols-outlined text-lg">menu</span>
            </button>
          )}

          <div className="hidden sm:flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="w-8 h-8 rounded-full bg-surface-container-high hover:bg-surface-bright text-outline hover:text-on-surface flex items-center justify-center transition-colors"
              title="Go back"
            >
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>
            <button
              type="button"
              onClick={() => window.history.forward()}
              className="w-8 h-8 rounded-full bg-surface-container-high hover:bg-surface-bright text-outline hover:text-on-surface flex items-center justify-center transition-colors"
              title="Go forward"
            >
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Center: Search Bar + Stitch Category Pills */}
        <div className="flex items-center gap-3 flex-1 max-w-2xl justify-center mx-auto min-w-0">
          <div className="relative flex-1 min-w-[180px] max-w-md">
            <LiveSearchAutocomplete
              variant="topbar"
              className="w-full"
              value={topSearch}
              onChange={setTopSearch}
              onNavigate={onSelectTab}
              placeholder="What do you want to play? ⌘K"
            />
          </div>

          {/* Stitch Category Filter Pills in Top Bar */}
          <nav className="hidden xl:flex items-center gap-1.5 shrink-0">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    if (cat.tab) onSelectTab(cat.tab);
                  }}
                  className={`px-3 py-1 rounded-full font-label-md text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-primary-container text-on-primary-container shadow-[0_0_12px_rgba(0,245,155,0.35)]"
                      : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Toolbar: Notifications, Settings, Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Notifications Bell */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-full hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors flex items-center justify-center relative"
              title="Notifications"
            >
              <span className="material-symbols-outlined text-xl">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary-container shadow-[0_0_8px_rgba(0,245,155,0.8)]" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-surface-container-low border border-white/10 rounded-2xl p-4 shadow-2xl z-50 animate-fadeIn">
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <h4 className="font-label-caps text-[11px] text-on-surface font-bold tracking-wider uppercase">
                    Notifications
                  </h4>
                  <span className="font-label-caps text-[10px] text-primary-container font-semibold">1 New</span>
                </div>
                <div className="space-y-2 pt-2">
                  <div className="p-2.5 rounded-xl bg-surface-container text-xs">
                    <p className="font-bold text-on-surface">✨ GreenWave 8D Spatial Platform</p>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">
                      Binaural 96kHz HRTF 8D audio engine is active with real-time orbit telemetry.
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
              className="p-2 rounded-full hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors flex items-center justify-center"
              title="Settings"
            >
              <span className="material-symbols-outlined text-xl">settings</span>
            </button>

            {showSettings && (
              <div className="absolute right-0 mt-2 w-56 bg-surface-container-low border border-white/10 rounded-2xl p-2 shadow-2xl z-50 animate-fadeIn space-y-1">
                <button
                  onClick={() => {
                    setShowSettings(false);
                    openModeSelector();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-on-surface hover:bg-surface-container flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-secondary">surround_sound</span>
                    <span>Spatial Sound</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold text-primary-container">{audioMode?.toUpperCase() || "8D"}</span>
                </button>
                <button
                  onClick={() => {
                    setShowSettings(false);
                    setShowMiloChat(true);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-on-surface hover:bg-surface-container flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base text-tertiary-fixed-dim">psychology</span>
                  <span>Milo AI Assistant</span>
                </button>
              </div>
            )}
          </div>

          {/* Right Panel Toggle (tablet/desktop) */}
          {onToggleRightPanel && (
            <button
              type="button"
              onClick={onToggleRightPanel}
              className="p-2 rounded-full hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface xl:hidden transition-colors flex items-center justify-center"
              title="Toggle Playlist & Player"
            >
              <span className="material-symbols-outlined text-xl">queue_music</span>
            </button>
          )}

          {/* User Profile Pill matching Stitch: Guest Listener @Robbi001 */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 pl-2 py-1 pr-3 rounded-full bg-surface-container-high hover:bg-surface-bright transition-all cursor-pointer border border-white/5 shadow-sm"
            >
              <img
                src={
                  user?.avatar ||
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuAh8b8uRtCx23v88V1_KqZHgFkR72p7ReXj-ql2oTyBNyvyklbuBMo6_iCWqzZPYbJK208v8K1pr1FEnxUeHKSQtv8iLUaiWtlWpFH7SAohsS30nKDOdHYTFwLWqWNswgksrtQArLp6cvgT-lArZ1sQnanRHD31ZNqMDG5wPwalvsQgadK9G5jnD8S5NMAseLchIlQMANvAu3p5HMkgXAvmLfKeWZY1A6u8iwPXAtmlHgh1yS2gNQeIxA"
                }
                alt="Profile"
                className="w-7 h-7 rounded-full object-cover border border-primary-container/40"
              />
              <div className="hidden sm:flex flex-col text-left leading-none">
                <span className="font-label-md text-xs text-on-surface font-semibold">
                  {user?.name || "Guest Listener"}
                </span>
                <span className="font-body-sm text-[10px] text-outline font-mono mt-0.5">
                  {user?.handle || "@Robbi001"}
                </span>
              </div>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-surface-container-low border border-white/10 rounded-2xl p-2 shadow-2xl z-50 animate-fadeIn">
                <div className="px-3 py-2 border-b border-white/5">
                  <p className="font-label-md text-xs font-bold text-on-surface truncate">
                    {user?.name || "Guest Listener"}
                  </p>
                  <p className="font-body-sm text-[10px] text-outline font-mono">
                    {user?.handle || "@Robbi001"}
                  </p>
                </div>
                <div className="pt-1 space-y-0.5">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onSelectTab("taste");
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">bubble_chart</span>
                    <span>Music Taste DNA</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onSelectTab("library", "Favorites");
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container flex items-center gap-2"
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
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-error hover:bg-error-container/20 flex items-center gap-2 border-t border-white/5 mt-1 pt-2"
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
