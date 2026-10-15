import React, { useState, useEffect } from "react";
import { usePlayer } from "../context/PlayerContext";
import { songsApi, categoriesApi } from "../api/api";

const DEFAULT_COVER =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCYHY4hp0r-GSzPdesFf5Z5mHQjlDX8zkLIjOdCA_IqUU_uw_nFr73ANifvOdaM2Q0NTsbK9ZB4CakHGH5fOSwA-_HynlD80C-hNL1oquc1m9K6gETHr9tKwpVJsxr8i3yXt8MxzxgSfUOhVYLQ8IqgfrlSGKs-61qE80eejtCqn6bE6dEiNbaAVFjYTn5bXQizoK0XcGh2VyyPyVMbGgVbr-Vnz7APr5Vg8HSuKiI1D50YhAVg3lfgaQ";

export default function MusicLibrary({ onNavigate, initialCategory = "All" }) {
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
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || "All");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("list"); // 'list' | 'grid'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

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
      song.composer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.album?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.genre?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || song.category === selectedCategory;

    const matchesGenre =
      selectedGenre === "All" || song.genre?.toLowerCase() === selectedGenre.toLowerCase();

    const matchesTab =
      activeFilterTab === "all" ||
      (activeFilterTab === "favorites" && favorites.has(song._id || song.id)) ||
      (activeFilterTab === "mode_only" && (song.audioMode === audioMode || (!song.audioMode && audioMode === "8d")));

    return matchesSearch && matchesCategory && matchesGenre && matchesTab;
  });

  const categoryList = [
    "All Categories",
    ...Array.from(new Set(categories.map((c) => c.name || c).filter(Boolean))),
  ];

  const gradientStyles = {
    normal: "from-[#0d3b66]/70 via-[#181818]/90 to-[#121212]",
    "8d": "from-[#1DB954]/25 via-[#181818]/90 to-[#121212]",
    "9d": "from-[#831843]/70 via-[#181818]/90 to-[#121212]",
  }[audioMode || "8d"] || "from-[#1DB954]/25 via-[#181818]/90 to-[#121212]";

  return (
    <div className="w-full flex flex-col font-sans text-slate-200 select-none pb-28 md:pb-24">
      {/* ============================================================== */}
      {/* 🌟 SPOTIFY GRAND PLAYLIST HERO HEADER (Stitch Screen 1c3c1d45) */}
      {/* ============================================================== */}
      <div className={`p-5 sm:p-8 bg-gradient-to-b ${gradientStyles} flex flex-col sm:flex-row items-center sm:items-end gap-5 transition-colors duration-700`}>
        {/* Massive Album Cover */}
        <div className="w-40 h-40 sm:w-52 sm:h-52 rounded-xl overflow-hidden shadow-2xl shrink-0 bg-[#242424] border border-white/10 relative group">
          <img
            src={filteredSongs[0]?.imageUrl || DEFAULT_COVER}
            alt="Library Cover"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={handleImgError}
          />
        </div>

        {/* Playlist Info Block */}
        <div className="flex flex-col text-center sm:text-left min-w-0">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#1DB954] mb-1 font-mono">
            PUBLIC PLAYLIST • {audioMode === "normal" ? "STEREO MASTER" : audioMode === "9d" ? "9D HOLOGRAPHIC" : "8D BINAURAL"}
          </span>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight my-1">
            {audioMode === "normal" ? "Normal Music Library" : audioMode === "9d" ? "9D Dimension Library" : "8D Audio Library"}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-300 mt-1 max-w-2xl leading-relaxed">
            {audioMode === "normal"
              ? "Studio master stereo tracks with clean dynamic fidelity and rich acoustics."
              : audioMode === "9d"
              ? "Multi-dimensional dual harmonic panning, frequency isolation, and holographic depth."
              : "Precision binaural panning, dynamic orbit velocity, and acoustic soundstage captures."}
          </p>
          <div className="flex items-center justify-center sm:justify-start gap-2 mt-2 text-xs font-semibold text-white">
            <span className="text-[#1DB954]">Flow 8D</span>
            <span>•</span>
            <span className="text-neutral-300">{filteredSongs.length} songs</span>
            <span>•</span>
            <span className="text-neutral-400 font-mono">~{Math.round(filteredSongs.length * 4.2)} mins</span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 🎵 ACTION TOOLBAR: Play, Universe Switch, Search */}
      {/* ============================================================== */}
      <div className="px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/5 bg-[#121212]/85 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Large Spotify Circular Play Button */}
          {filteredSongs.length > 0 && (
            <button
              onClick={() => playSong(filteredSongs[0], filteredSongs)}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#1DB954] text-black flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-transform"
              title="Play playlist"
            >
              <span
                className="material-symbols-outlined text-3xl font-bold ml-1"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                play_arrow
              </span>
            </button>
          )}

          {/* Universe Switcher Pill */}
          <button
            onClick={openModeSelector}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#242424] hover:bg-[#2e2e2e] border border-[#1DB954]/30 text-white hover:text-[#1DB954] text-xs font-semibold transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-sm text-[#1DB954]">sync</span>
            <span>Mode</span>
          </button>

          {/* Favorites Filter */}
          <button
            onClick={() =>
              setActiveFilterTab(activeFilterTab === "favorites" ? "all" : "favorites")
            }
            className={`p-2.5 rounded-full border transition-all ${
              activeFilterTab === "favorites"
                ? "bg-[#1DB954]/20 text-[#1DB954] border-[#1DB954]/50 shadow-md"
                : "border-white/10 text-neutral-400 hover:text-white hover:bg-white/5"
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

        {/* Search Input & View Toggle on the right */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-neutral-400 text-sm">
              search
            </span>
            <input
              type="text"
              placeholder="Search in playlist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#242424] border-0 rounded-full py-2 pl-9 pr-8 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-[#1DB954]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-neutral-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* List vs Grid View Toggle */}
          <div className="flex items-center bg-[#242424] rounded-full p-0.5 border border-white/5 shrink-0">
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-full transition-colors ${
                viewMode === "list" ? "bg-white/20 text-white" : "text-neutral-400 hover:text-white"
              }`}
              title="List View"
            >
              <span className="material-symbols-outlined text-lg">view_list</span>
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-full transition-colors ${
                viewMode === "grid" ? "bg-white/20 text-white" : "text-neutral-400 hover:text-white"
              }`}
              title="Grid View"
            >
              <span className="material-symbols-outlined text-lg">grid_view</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mood / Genre & Category Pills Strip */}
      <div className="px-4 sm:px-6 pt-3 pb-1 overflow-x-auto no-scrollbar flex items-center gap-2">
        {[
          { id: "All", label: "All Moods" },
          { id: "Love", label: "❤️ Love" },
          { id: "Melody", label: "🎵 Melody" },
          { id: "Vibe", label: "⚡ Vibe" },
        ].map((m) => {
          const isSelected = selectedGenre === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setSelectedGenre(m.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? "bg-[#1DB954] text-black font-bold shadow-md"
                  : "bg-[#1c1c1c] hover:bg-[#282828] text-neutral-300 border border-white/5"
              }`}
            >
              <span>{m.label}</span>
            </button>
          );
        })}

        <div className="h-4 w-px bg-white/20 mx-1 shrink-0" />

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
                  : "bg-[#242424] hover:bg-[#2c2c2c] text-neutral-300"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* 📋 SPOTIFY TRACK LIST / GRID DISPLAY */}
      {/* ============================================================== */}
      <div className="px-3 sm:px-6 mt-4">
        {filteredSongs.length === 0 ? (
          <div className="py-20 text-center text-neutral-500 font-mono text-xs">
            {loading ? "Loading audio tracks..." : "No tracks found matching your query."}
          </div>
        ) : viewMode === "grid" ? (
          /* Responsive Cards Grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
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
                  className="group p-3 rounded-2xl bg-[#181818] hover:bg-[#242424] cursor-pointer transition-all duration-300 flex flex-col justify-between shadow-md border border-white/5 hover:border-white/10 active:scale-[0.98]"
                >
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-3 bg-[#202020] shadow-md">
                    <img
                      src={song.imageUrl || DEFAULT_COVER}
                      alt={song.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={handleImgError}
                    />

                    {song.audioMode && (
                      <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-black/75 text-[#1DB954] border border-[#1DB954]/30 uppercase">
                        {song.audioMode}
                      </div>
                    )}

                    <div className="absolute right-2.5 bottom-2.5 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-3 transition-all duration-200">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playSong(song, filteredSongs);
                        }}
                        className="w-10 h-10 rounded-full bg-[#1DB954] text-black flex items-center justify-center shadow-xl hover:scale-105 active:scale-90 transition-transform"
                      >
                        <span
                          className="material-symbols-outlined text-2xl font-bold ml-0.5"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          {isThisPlaying ? "pause" : "play_arrow"}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="min-w-0 flex flex-col">
                    <h3 className="text-xs sm:text-sm font-bold text-white truncate leading-snug group-hover:text-[#1DB954] transition-colors pb-0.5">
                      {song.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-neutral-400 truncate mt-1 leading-normal">
                      {song.artist}
                    </p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-[10px] text-neutral-500 font-mono leading-none">
                      <span className="leading-none">{song.duration || "4:15"}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(song._id || song.id);
                        }}
                        className="hover:text-white p-1 inline-flex items-center justify-center leading-none"
                      >
                        <span
                          className={`material-symbols-outlined text-sm ${isFav ? "text-[#1DB954]" : ""}`}
                          style={{ fontVariationSettings: isFav ? "'FILL' 1" : "'FILL' 0" }}
                        >
                          favorite
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table Header & Rows */
          <div>
            <div className="grid grid-cols-12 px-4 py-2.5 items-center text-[11px] font-semibold text-neutral-400 uppercase tracking-wider border-b border-white/10 font-mono leading-none">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-8 md:col-span-5">Title</div>
              <div className="hidden md:block md:col-span-3">Category</div>
              <div className="col-span-3 md:col-span-3 text-right pr-2">Duration</div>
            </div>

            <div className="divide-y divide-white/5 mt-1">
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
                    className={`grid grid-cols-12 items-center px-4 py-3 rounded-xl hover:bg-[#242424] cursor-pointer group transition-colors text-xs ${
                      isThisPlaying ? "bg-[#242424] text-[#1DB954]" : "text-neutral-300"
                    }`}
                  >
                    {/* Number or Play indicator */}
                    <div className="col-span-1 flex items-center justify-center font-mono text-neutral-400 group-hover:hidden leading-none">
                      {isThisPlaying ? (
                        <span className="material-symbols-outlined text-[#1DB954] text-base animate-pulse">
                          equalizer
                        </span>
                      ) : (
                        idx + 1
                      )}
                    </div>
                    <div className="col-span-1 hidden items-center justify-center group-hover:flex leading-none">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playSong(song, filteredSongs);
                        }}
                        className="text-white hover:text-[#1DB954] transition-colors inline-flex items-center justify-center"
                      >
                        <span
                          className="material-symbols-outlined text-xl"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          {isThisPlaying ? "pause" : "play_arrow"}
                        </span>
                      </button>
                    </div>

                    {/* Title & Artist */}
                    <div className="col-span-8 md:col-span-5 flex items-center gap-3.5 min-w-0 pr-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-black shadow-sm">
                        <img
                          src={song.imageUrl || DEFAULT_COVER}
                          alt={song.title}
                          className="w-full h-full object-cover"
                          onError={handleImgError}
                        />
                      </div>
                      <div className="min-w-0 flex flex-col justify-center">
                        <h4
                          className={`font-bold truncate text-xs sm:text-sm leading-snug pb-0.5 ${
                            isThisPlaying ? "text-[#1DB954]" : "text-white group-hover:text-[#1DB954] transition-colors"
                          }`}
                        >
                          {song.title}
                        </h4>
                        <p className="text-[11px] text-neutral-400 truncate mt-0.5 leading-normal">
                          {song.artist}
                        </p>
                      </div>
                    </div>

                    {/* Category & Mood Badge */}
                    <div className="hidden md:flex md:col-span-3 items-center gap-2 text-neutral-400 text-xs truncate leading-none">
                      <span className="truncate leading-none">{song.category || "Tamil Melodies"}</span>
                      {song.audioMode && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#1DB954] shrink-0 uppercase leading-none inline-flex items-center">
                          {song.audioMode}
                        </span>
                      )}
                    </div>

                    {/* Duration & Heart */}
                    <div className="col-span-3 md:col-span-3 flex items-center justify-end gap-3 text-neutral-400 font-mono text-xs pr-2 leading-none">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(song._id || song.id);
                        }}
                        className="transition-opacity hover:text-white p-1 inline-flex items-center justify-center"
                      >
                        <span
                          className={`material-symbols-outlined text-base ${
                            isFav ? "text-[#1DB954] opacity-100" : "text-neutral-400 opacity-0 group-hover:opacity-100"
                          }`}
                          style={{ fontVariationSettings: isFav ? "'FILL' 1" : "'FILL' 0" }}
                        >
                          favorite
                        </span>
                      </button>
                      <span className="leading-none">{song.duration || "4:15"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
