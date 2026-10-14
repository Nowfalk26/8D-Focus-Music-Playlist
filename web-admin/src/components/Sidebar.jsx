import React from "react";

const APP_NAV_ITEMS = [
  { id: "home", label: "Flow 8D Home", icon: "🏠", badge: "Stitch UI" },
  { id: "taste", label: "Your Music Taste", icon: "🧬", badge: "ML Engine" },
  { id: "orbit", label: "360° Binaural Orbit", icon: "🎧", badge: "Stage" },
  { id: "studio", label: "AI 8D Studio", icon: "🎛️", badge: "Spatial" },
  { id: "library", label: "Music Library", icon: "📚", badge: "Archive" },
];

const ADMIN_NAV_ITEMS = [
  { id: "dashboard", label: "Admin Analytics", icon: "📊" },
  { id: "songs", label: "Songs Catalog", icon: "🎵" },
  { id: "categories", label: "Categories", icon: "📁" },
  { id: "users", label: "Users & Auth", icon: "👥" },
];

export default function Sidebar({ activeTab, onSelectTab }) {
  return (
    <aside className="w-64 bg-[#0c0817] border-r border-purple-500/20 flex flex-col justify-between shrink-0 p-5 h-screen sticky top-0 overflow-y-auto no-scrollbar">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 pb-6 border-b border-purple-500/20">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-purple to-brand-cyan p-[1.5px] shadow-neon-purple shrink-0">
            <div className="w-full h-full bg-[#0e0818] rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-brand-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
              </svg>
            </div>
          </div>
          <div>
            <div className="text-base font-extrabold text-white tracking-tight flex items-center gap-1 font-sans">
              Flow <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-brand-purple to-cyan-300">8D</span>
            </div>
            <div className="text-[10px] text-cyan-300 font-mono tracking-wider">
              SPATIAL AUDIO
            </div>
          </div>
        </div>

        {/* User Experience Navigation */}
        <div className="mt-6">
          <div className="text-[10px] font-bold text-purple-300/60 uppercase tracking-widest px-3 mb-2">
            Experience Layer
          </div>
          <nav className="space-y-1">
            {APP_NAV_ITEMS.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    active
                      ? "bg-gradient-to-r from-brand-purple/80 to-purple-800/60 text-white border border-cyan-400/50 shadow-neon-purple"
                      : "text-purple-200/70 hover:text-white hover:bg-purple-950/40"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-400/20 text-cyan-300 font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Administration Navigation */}
        <div className="mt-6">
          <div className="text-[10px] font-bold text-purple-300/60 uppercase tracking-widest px-3 mb-2">
            Management Portal
          </div>
          <nav className="space-y-1">
            {ADMIN_NAV_ITEMS.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    active
                      ? "bg-gradient-to-r from-brand-purple/80 to-purple-800/60 text-white border border-cyan-400/50 shadow-neon-purple"
                      : "text-purple-200/70 hover:text-white hover:bg-purple-950/40"
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer System Status */}
      <div className="pt-4 border-t border-purple-500/20">
        <div className="flex items-center gap-2 text-[11px] text-purple-200/80">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>MongoDB + Express Online</span>
        </div>
        <div className="text-[10px] text-cyan-300 font-mono mt-1">
          Port 5000 • Stitch Sync Active
        </div>
      </div>
    </aside>
  );
}
