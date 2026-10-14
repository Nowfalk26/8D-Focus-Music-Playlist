import React, { useState, useEffect } from "react";
import { usePlayer } from "../context/PlayerContext";
import { songsApi, categoriesApi, recommendationsApi } from "../api/api";
import TasteProfileModal from "./TasteProfileModal";
import MiloCatChat from "./MiloCatChat";

export default function HomeScreen({ onNavigate }) {
  const {
    currentSong,
    isPlaying,
    playSong,
    togglePlay,
    playNext,
    setShowFullPlayer,
    recommendations,
    tasteProfile,
    loadingRecs,
    refreshRecommendations,
    showMiloChat,
    setShowMiloChat,
    miloInitialQuery,
    setMiloInitialQuery,
    offlineNotice,
    setOfflineNotice,
    startOfflineSynth,
    audioMode,
    openModeSelector,
    cycleStatus,
    resetPlaybackCycle,
    favorites,
    toggleFavorite,
  } = usePlayer();

  const [songs, setSongs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTasteModal, setShowTasteModal] = useState(false);

  // Dynamic time-based greeting (Spotify style)
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const DEFAULT_COVER =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCYHY4hp0r-GSzPdesFf5Z5mHQjlDX8zkLIjOdCA_IqUU_uw_nFr73ANifvOdaM2Q0NTsbK9ZB4CakHGH5fOSwA-_HynlD80C-hNL1oquc1m9K6gETHr9tKwpVJsxr8i3yXt8MxzxgSfUOhVYLQ8IqgfrlSGKs-61qE80eejtCqn6bE6dEiNbaAVFjYTn5bXQizoK0XcGh2VyyPyVMbGgVbr-Vnz7APr5Vg8HSuKiI1D50YhAVg3lfgaQ";

  const handleImgError = (e) => {
    e.target.onerror = null;
    e.target.src = DEFAULT_COVER;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [songsRes, catsRes] = await Promise.all([
          songsApi.getAll({ mode: audioMode }).catch(() => ({ data: { data: [] } })),
          categoriesApi.getAll().catch(() => ({ data: { data: [] } })),
        ]);
        setSongs(songsRes.data?.data || []);
        setCategories(catsRes.data?.data || []);
      } catch (err) {
        console.error("Error loading home data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [audioMode]);

  // Mode header gradient
  const gradientStyles = {
    normal: "from-[#0d3b66]/60 via-[#121212]/90 to-[#121212]",
    "8d": "from-[#3a0ca3]/60 via-[#121212]/90 to-[#121212]",
    "9d": "from-[#831843]/60 via-[#121212]/90 to-[#121212]",
  }[audioMode || "8d"] || "from-[#3a0ca3]/60 via-[#121212]/90 to-[#121212]";

  // Top 6 Quick Cards for Spotify 2x3 Grid
  const quickCards = [
    {
      title: "Liked Songs",
      subtitle: `${favorites.size} songs`,
      isLiked: true,
      onClick: () => onNavigate("library"),
    },
    ...songs.slice(0, 5).map((s) => ({
      title: s.title,
      subtitle: s.artist,
      song: s,
      imageUrl: s.imageUrl,
      onClick: () => playSong(s, songs),
    })),
  ];

  return (
    <div className="w-full flex flex-col font-sans text-slate-200 select-none pb-28 md:pb-16">
      {/* Dynamic Spotify Top Gradient Header */}
      <div className={`p-6 pb-4 bg-gradient-to-b ${gradientStyles} transition-colors duration-700`}>
        {/* Top Notification / Cycle Status HUD */}
        {cycleStatus && (
          <div className="flex items-center justify-between px-3.5 py-1.5 rounded-full bg-black/40 border border-[#00f2fe]/30 backdrop-blur-md mb-4 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00f2fe] animate-pulse"></span>
              <span className="text-white font-bold">
                Smart No-Repeat Cycle #{cycleStatus.cycleId}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-[#00f2fe]">
                {cycleStatus.playedCount} of {cycleStatus.totalEligible || songs.length} Played
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 hidden sm:inline">
                Guaranteed 0 song repeats
              </span>
              <button
                onClick={resetPlaybackCycle}
                className="text-[10px] text-[#00f2fe] hover:underline font-bold"
              >
                Reset ↻
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Spotify Greeting */}
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-5">
          {getGreeting()}
        </h1>

        {/* ============================================================== */}
        {/* 🟩 SPOTIFY ICONIC 2x3 TOP QUICK-ACCESS CARDS */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickCards.map((card, idx) => {
            const isThisPlaying =
              card.song &&
              currentSong &&
              (currentSong._id || currentSong.id) === (card.song._id || card.song.id) &&
              isPlaying;

            return (
              <div
                key={idx}
                onClick={card.onClick}
                className="group relative flex items-center bg-[#242424]/70 hover:bg-[#2a2a2a] rounded-md overflow-hidden cursor-pointer transition-colors duration-200 shadow-md"
              >
                {/* Thumbnail */}
                <div className="w-16 h-16 shrink-0 relative bg-[#181818]">
                  {card.isLiked ? (
                    <div className="w-full h-full bg-gradient-to-br from-[#b026ff] via-indigo-600 to-[#00f2fe] flex items-center justify-center">
                      <span
                        className="material-symbols-outlined text-white text-2xl"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        favorite
                      </span>
                    </div>
                  ) : (
                    <img
                      src={card.imageUrl || DEFAULT_COVER}
                      alt={card.title}
                      className="w-full h-full object-cover"
                      onError={handleImgError}
                    />
                  )}
                </div>

                {/* Title */}
                <div className="flex-1 px-3 min-w-0 pr-12">
                  <h4 className="text-sm font-bold text-white truncate group-hover:text-[#00f2fe] transition-colors">
                    {card.title}
                  </h4>
                  {card.subtitle && (
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{card.subtitle}</p>
                  )}
                </div>

                {/* Spotify Floating Circular Play Button on Hover */}
                <div className="absolute right-3 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-1 transition-all duration-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (card.song) playSong(card.song, songs);
                      else onNavigate("library");
                    }}
                    className="w-10 h-10 rounded-full bg-[#00f2fe] text-obsidian-950 flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-transform"
                  >
                    <span className="material-symbols-outlined text-xl font-bold ml-0.5">
                      {isThisPlaying ? "pause" : "play_arrow"}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content Sections (Spotify Body) */}
      <div className="p-6 space-y-8">
        {/* ============================================================== */}
        {/* 🌟 SECTION 1: MADE FOR YOU • ML RECOMMENDATIONS */}
        {/* ============================================================== */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>Made For You</span>
                <span className="w-2 h-2 rounded-full bg-[#00f2fe] animate-pulse"></span>
              </h2>
              <p className="text-xs text-slate-400">
                Personalized sequential recommendations trained on your taste vectors
              </p>
            </div>
            <button
              onClick={() => onNavigate("taste")}
              className="text-xs font-bold text-slate-400 hover:text-white uppercase tracking-wider transition-colors"
            >
              Show all
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {(recommendations.length > 0 ? recommendations : songs.slice(0, 6).map((s) => ({ song: s, matchScore: 95 }))).slice(0, 6).map((item, idx) => {
              const song = item.song || item;
              const isThisPlaying =
                currentSong &&
                (currentSong._id || currentSong.id) === (song._id || song.id) &&
                isPlaying;

              return (
                <div
                  key={song._id || song.id || idx}
                  onClick={() => playSong(song, null, true)}
                  className="group p-3 rounded-lg bg-[#181818]/80 hover:bg-[#282828] cursor-pointer transition-all duration-200 flex flex-col justify-between shadow-md"
                >
                  <div className="relative w-full aspect-square rounded-md overflow-hidden mb-3 bg-[#242424] shadow-md">
                    <img
                      src={song.imageUrl || DEFAULT_COVER}
                      alt={song.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={handleImgError}
                    />

                    {/* Floating Circular Play Button on bottom-right of album art */}
                    <div className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2 transition-all duration-200">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playSong(song, null, true);
                        }}
                        className="w-11 h-11 rounded-full bg-[#00f2fe] text-obsidian-950 flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-transform"
                      >
                        <span className="material-symbols-outlined text-2xl font-bold ml-0.5">
                          {isThisPlaying ? "pause" : "play_arrow"}
                        </span>
                      </button>
                    </div>

                    {item.matchScore && (
                      <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-black/70 text-[#00f2fe] border border-[#00f2fe]/30">
                        {item.matchScore}% MATCH
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white truncate group-hover:underline">
                      {song.title}
                    </h3>
                    <p className="text-xs text-slate-400 truncate mt-1">
                      {song.artist} • {song.category}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ============================================================== */}
        {/* 🎧 SECTION 2: JUMP BACK IN • 8D FOCUS MUSIC */}
        {/* ============================================================== */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Jump Back In • {audioMode.toUpperCase()} Spatial
              </h2>
              <p className="text-xs text-slate-400">
                Precision binaural soundstage calibrated for flow state
              </p>
            </div>
            <button
              onClick={() => onNavigate("library")}
              className="text-xs font-bold text-slate-400 hover:text-white uppercase tracking-wider transition-colors"
            >
              Show all
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {songs.slice(6, 12).map((song, idx) => {
              const isThisPlaying =
                currentSong &&
                (currentSong._id || currentSong.id) === (song._id || song.id) &&
                isPlaying;

              return (
                <div
                  key={song._id || song.id || idx}
                  onClick={() => playSong(song, songs)}
                  className="group p-3 rounded-lg bg-[#181818]/80 hover:bg-[#282828] cursor-pointer transition-all duration-200 flex flex-col justify-between shadow-md"
                >
                  <div className="relative w-full aspect-square rounded-md overflow-hidden mb-3 bg-[#242424] shadow-md">
                    <img
                      src={song.imageUrl || DEFAULT_COVER}
                      alt={song.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={handleImgError}
                    />

                    <div className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2 transition-all duration-200">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playSong(song, songs);
                        }}
                        className="w-11 h-11 rounded-full bg-[#00f2fe] text-obsidian-950 flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-transform"
                      >
                        <span className="material-symbols-outlined text-2xl font-bold ml-0.5">
                          {isThisPlaying ? "pause" : "play_arrow"}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white truncate group-hover:underline">
                      {song.title}
                    </h3>
                    <p className="text-xs text-slate-400 truncate mt-1">
                      {song.artist}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ============================================================== */}
        {/* 📊 SECTION 3: SPOTIFY CANONICAL TRACK TABLE */}
        {/* ============================================================== */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Today's Top Tracks
            </h2>
            <span className="text-xs font-mono text-slate-400">
              {songs.length} Tracks Available
            </span>
          </div>

          <div className="w-full">
            {/* Table Header */}
            <div className="grid grid-cols-12 px-4 py-2 text-[11px] font-medium text-slate-400 uppercase tracking-wider border-b border-white/10">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-6 md:col-span-5">Title</div>
              <div className="hidden md:block md:col-span-3">Category</div>
              <div className="col-span-5 md:col-span-3 text-right pr-2">Duration</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-transparent mt-1">
              {songs.slice(0, 15).map((song, idx) => {
                const isThisPlaying =
                  currentSong &&
                  (currentSong._id || currentSong.id) === (song._id || song.id) &&
                  isPlaying;
                const isFav = favorites.has(song._id || song.id);

                return (
                  <div
                    key={song._id || song.id || idx}
                    onClick={() => playSong(song, songs)}
                    className={`grid grid-cols-12 items-center px-4 py-2.5 rounded-md hover:bg-[#282828] cursor-pointer group transition-colors text-xs ${
                      isThisPlaying ? "bg-[#282828] text-[#00f2fe]" : "text-slate-300"
                    }`}
                  >
                    {/* # or Play button */}
                    <div className="col-span-1 flex items-center justify-center font-mono text-slate-400 group-hover:hidden">
                      {isThisPlaying ? (
                        <span className="material-symbols-outlined text-[#00f2fe] text-base animate-pulse">
                          equalizer
                        </span>
                      ) : (
                        idx + 1
                      )}
                    </div>
                    <div className="col-span-1 hidden items-center justify-center group-hover:flex">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playSong(song, songs);
                        }}
                        className="text-white hover:text-[#00f2fe] transition-colors"
                      >
                        <span className="material-symbols-outlined text-xl">
                          {isThisPlaying ? "pause" : "play_arrow"}
                        </span>
                      </button>
                    </div>

                    {/* Title + Artist + Thumbnail */}
                    <div className="col-span-6 md:col-span-5 flex items-center gap-3 min-w-0 pr-3">
                      <div className="w-10 h-10 rounded overflow-hidden shrink-0 bg-[#242424]">
                        <img
                          src={song.imageUrl || DEFAULT_COVER}
                          alt={song.title}
                          className="w-full h-full object-cover"
                          onError={handleImgError}
                        />
                      </div>
                      <div className="min-w-0">
                        <h4
                          className={`font-semibold truncate text-sm ${
                            isThisPlaying ? "text-[#00f2fe]" : "text-white group-hover:text-white"
                          }`}
                        >
                          {song.title}
                        </h4>
                        <p className="text-xs text-slate-400 truncate mt-0.5">
                          {song.artist}
                        </p>
                      </div>
                    </div>

                    {/* Category */}
                    <div className="hidden md:block md:col-span-3 text-slate-400 text-xs truncate">
                      {song.category || "Focus Music"}
                    </div>

                    {/* Duration & Favorite */}
                    <div className="col-span-5 md:col-span-3 flex items-center justify-end gap-4 text-slate-400 font-mono text-xs pr-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(song._id || song.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-white"
                      >
                        <span
                          className={`material-symbols-outlined text-base ${
                            isFav ? "text-[#00f2fe] opacity-100" : "text-slate-400"
                          }`}
                          style={{ fontVariationSettings: isFav ? "'FILL' 1" : "'FILL' 0" }}
                        >
                          favorite
                        </span>
                      </button>
                      <span>{song.duration || "4:30"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      {/* Milo AI Chat Modal */}
      {showMiloChat && (
        <MiloCatChat
          initialQuery={miloInitialQuery}
          onClose={() => setShowMiloChat(false)}
        />
      )}

      {/* Taste Profile Modal */}
      {showTasteModal && (
        <TasteProfileModal onClose={() => setShowTasteModal(false)} />
      )}
    </div>
  );
}
