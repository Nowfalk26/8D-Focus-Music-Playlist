import React, { useState, useEffect } from "react";
import { usePlayer } from "../context/PlayerContext";
import { songsApi, categoriesApi } from "../api/api";

const DEFAULT_COVER =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCYHY4hp0r-GSzPdesFf5Z5mHQjlDX8zkLIjOdCA_IqUU_uw_nFr73ANifvOdaM2Q0NTsbK9ZB4CakHGH5fOSwA-_HynlD80C-hNL1oquc1m9K6gETHr9tKwpVJsxr8i3yXt8MxzxgSfUOhVYLQ8IqgfrlSGKs-61qE80eejtCqn6bE6dEiNbaAVFjYTn5bXQizoK0XcGh2VyyPyVMbGgVbr-Vnz7APr5Vg8HSuKiI1D50YhAVg3lfgaQ";

export default function MusicLibrary({ onNavigate }) {
  const {
    currentSong,
    isPlaying,
    playSong,
    toggleFavorite,
    favorites,
    setShowFullPlayer,
    audioMode,
    openModeSelector,
  } = usePlayer();

  const [songs, setSongs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeFilterTab, setActiveFilterTab] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

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
        console.error("Error loading library data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [audioMode]);

  const filteredSongs = songs.filter((song) => {
    const matchesSearch =
      song.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.category?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || song.category === selectedCategory;

    const matchesTab =
      activeFilterTab === "all" ||
      (activeFilterTab === "favorites" && favorites.has(song._id || song.id)) ||
      (activeFilterTab === "mode_only" && (song.audioMode === audioMode || (!song.audioMode && audioMode === "8d")));

    return matchesSearch && matchesCategory && matchesTab;
  });

  const categoryList = [
    "All Categories",
    ...Array.from(new Set(categories.map((c) => c.name || c).filter(Boolean))),
  ];

  // Header gradient styling based on active audio universe
  const gradientStyles = {
    normal: "from-[#0d3b66]/70 via-[#181818]/90 to-[#121212]",
    "8d": "from-[#3a0ca3]/70 via-[#181818]/90 to-[#121212]",
  }[audioMode || "8d"];

  return (
    <div className="w-full flex flex-col font-sans text-slate-200 select-none pb-24">
      {/* ============================================================== */}
      {/* 🌟 SPOTIFY GRAND PLAYLIST HERO HEADER */}
      {/* ============================================================== */}
      <div className={`p-6 md:p-8 bg-gradient-to-b ${gradientStyles} flex flex-col md:flex-row items-center md:items-end gap-6 transition-colors duration-700`}>
        {/* Massive Album Cover */}
        <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-md overflow-hidden shadow-2xl shrink-0 bg-[#242424] border border-white/10 relative group">
          <img
            src={filteredSongs[0]?.imageUrl || DEFAULT_COVER}
            alt="Library Cover"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={handleImgError}
          />
        </div>

        {/* Playlist Info Block */}
        <div className="flex flex-col text-center md:text-left min-w-0">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#00f2fe] mb-1 font-mono">
            PUBLIC PLAYLIST • {audioMode === "normal" ? "STEREO MASTER" : "8D BINAURAL"}
          </span>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight my-1">
            {audioMode === "normal" ? "Normal Music Library" : "8D Audio Library"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
            Precision binaural panning, dynamic orbit velocity, and acoustic soundstage captures for deep flow state and spatial focus.
          </p>
          <div className="flex items-center justify-center md:justify-start gap-2 mt-3 text-xs font-semibold text-white">
            <span className="text-[#00f2fe]">Flow 8D</span>
            <span>•</span>
            <span className="text-slate-300">{filteredSongs.length} songs</span>
            <span>•</span>
            <span className="text-slate-400 font-mono">~{Math.round(filteredSongs.length * 4.2)} mins</span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 🎵 ACTION TOOLBAR: Play, Universe Switch, Search */}
      {/* ============================================================== */}
      <div className="px-6 py-5 flex flex-wrap items-center justify-between gap-4 border-b border-white/5 bg-[#121212]/80 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-5">
          {/* Large Spotify Circular Play Button */}
          {filteredSongs.length > 0 && (
            <button
              onClick={() => playSong(filteredSongs[0], filteredSongs)}
              className="w-14 h-14 rounded-full bg-[#00f2fe] text-obsidian-950 flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-transform"
              title="Play playlist"
            >
              <span className="material-symbols-outlined text-3xl font-bold ml-1">
                play_arrow
              </span>
            </button>
          )}

          {/* Universe Switcher Pill */}
          <button
            onClick={openModeSelector}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#242424] hover:bg-[#2e2e2e] border border-[#00f2fe]/30 text-white hover:text-[#00f2fe] text-xs font-semibold transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-sm text-[#00f2fe]">sync</span>
            <span>Switch Universe</span>
          </button>

          {/* Favorites Filter */}
          <button
            onClick={() =>
              setActiveFilterTab(activeFilterTab === "favorites" ? "all" : "favorites")
            }
            className={`p-2.5 rounded-full border transition-all ${
              activeFilterTab === "favorites"
                ? "bg-[#00f2fe]/20 text-[#00f2fe] border-[#00f2fe]/50 shadow-glow-cyan"
                : "border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
            }`}
            title="Filter Liked Songs"
          >
            <span
              className="material-symbols-outlined text-xl"
              style={{
                fontVariationSettings: activeFilterTab === "favorites" ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              favorite
            </span>
          </button>
        </div>

        {/* Search Input on the right */}
        <div className="relative w-full sm:w-72">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-500 text-sm">
            search
          </span>
          <input
            type="text"
            placeholder="Filter in library..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#242424] border-0 rounded-full py-2 pl-9 pr-8 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-white/20"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2.5 text-slate-500 hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Category Pills Strip */}
      <div className="px-6 pt-3 pb-1 overflow-x-auto scrollbar-none flex items-center gap-2">
        {categoryList.map((cat, idx) => {
          const isSelected =
            (cat === "All Categories" && selectedCategory === "All") ||
            selectedCategory === cat;
          return (
            <button
              key={idx}
              onClick={() => setSelectedCategory(cat === "All Categories" ? "All" : cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                isSelected
                  ? "bg-white text-black font-bold"
                  : "bg-[#242424] hover:bg-[#2c2c2c] text-slate-300"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* 📋 SPOTIFY TRACK TABLE */}
      {/* ============================================================== */}
      <div className="px-6 mt-4">
        {/* Table Header */}
        <div className="grid grid-cols-12 px-4 py-2 text-[11px] font-medium text-slate-400 uppercase tracking-wider border-b border-white/10">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-6 md:col-span-5">Title</div>
          <div className="hidden md:block md:col-span-3">Category</div>
          <div className="col-span-5 md:col-span-3 text-right pr-2">Duration</div>
        </div>

        {/* Table Rows */}
        {filteredSongs.length === 0 ? (
          <div className="py-16 text-center text-slate-500 font-mono text-xs">
            {loading ? "Loading audio tracks..." : "No tracks found."}
          </div>
        ) : (
          <div className="divide-y divide-transparent mt-1">
            {filteredSongs.map((song, idx) => {
              const isThisPlaying =
                currentSong &&
                (currentSong._id || currentSong.id) === (song._id || song.id) &&
                isPlaying;
              const isFav = favorites.has(song._id || song.id);

              return (
                <div
                  key={song._id || song.id || idx}
                  onClick={() => playSong(song, filteredSongs)}
                  className={`grid grid-cols-12 items-center px-4 py-2.5 rounded-md hover:bg-[#282828] cursor-pointer group transition-colors text-xs ${
                    isThisPlaying ? "bg-[#282828] text-[#00f2fe]" : "text-slate-300"
                  }`}
                >
                  {/* Number or Play indicator */}
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
                        playSong(song, filteredSongs);
                      }}
                      className="text-white hover:text-[#00f2fe] transition-colors"
                    >
                      <span className="material-symbols-outlined text-xl">
                        {isThisPlaying ? "pause" : "play_arrow"}
                      </span>
                    </button>
                  </div>

                  {/* Title & Artist */}
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

                  {/* Duration & Heart */}
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
        )}
      </div>
    </div>
  );
}
